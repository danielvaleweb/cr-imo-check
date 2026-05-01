import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Sparkles, Download, Layers, Trash2 } from 'lucide-react';
import { addLog } from '../services/logService';

interface ProcessedFile {
  originalFile: File;
  previewUrl?: string;
  processedBase64: string | null;
  status: 'pending' | 'processing' | 'done' | 'error';
  isDark?: boolean;
}

export function PhotoEditorTab() {
  const [mode, setMode] = useState<'edit' | 'watermark'>('edit');
  const [targetLogo, setTargetLogo] = useState<'auto' | 'white' | 'black'>('auto');
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => file.type.startsWith('image/'));
    const newProcessedFiles: ProcessedFile[] = validFiles.map(file => ({
      originalFile: file,
      previewUrl: URL.createObjectURL(file),
      processedBase64: null,
      status: 'pending'
    }));
    setFiles(prev => [...prev, ...newProcessedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const fileToRemove = prev[index];
      if (fileToRemove.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const processImage = (fileData: ProcessedFile): Promise<ProcessedFile> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = fileData.previewUrl || URL.createObjectURL(fileData.originalFile);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ ...fileData, status: 'error' });
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Analyze brightness
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let brightnessSum = 0;
        let blownOutCount = 0;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
          brightnessSum += luminance;
          if (luminance > 240) blownOutCount++;
        }

        const totalPixels = data.length / 4;
        const avgBrightness = brightnessSum / totalPixels;
        const isDark = avgBrightness < 128;
        const isBlownOut = blownOutCount / totalPixels > 0.05;

        if (mode === 'edit') {
          // Subtle AI-like enhancement logic
          let brightness = 100;
          let contrast = 100;
          let saturation = 105;
          
          if (avgBrightness < 80) { // Muito escuro
            brightness = 130;
            contrast = 115;
            saturation = 112;
          } else if (avgBrightness < 110) { // Um pouco escuro
            brightness = 118;
            contrast = 108;
            saturation = 108;
          } else if (isBlownOut) { // Estourado / Muito claro
            brightness = 92;
            contrast = 106;
            saturation = 100;
          } else if (avgBrightness > 190) { // Muito claro geral
            brightness = 95;
            contrast = 104;
            saturation = 100;
          }

          // Aplicando correção de nitidez e vibração
          ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          
          const processedUrl = canvas.toDataURL('image/jpeg', 0.90);
          resolve({ ...fileData, processedBase64: processedUrl, status: 'done', isDark });

        } else if (mode === 'watermark') {
          // Add Watermark
          let watermarkUrl = 'https://i.imgur.com/FLnyJIe.png'; // Default White
          
          if (targetLogo === 'white') {
            watermarkUrl = 'https://i.imgur.com/FLnyJIe.png';
          } else if (targetLogo === 'black') {
            watermarkUrl = 'https://i.imgur.com/PsQnJ9g.png';
          } else {
            // Auto detection logic
            watermarkUrl = isDark 
              ? 'https://i.imgur.com/FLnyJIe.png' // White for dark images
              : 'https://i.imgur.com/PsQnJ9g.png'; // Black for light images
          }

          const wmImg = new Image();
          wmImg.crossOrigin = 'Anonymous';
          wmImg.onload = () => {
            // First draw the clean image
            ctx.filter = 'none';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            ctx.globalAlpha = 0.5; // Slightly increased opacity for better visibility
            
            // Adjust watermark size (45% of the shortest side)
            const shortestSide = Math.min(canvas.width, canvas.height);
            const maxWmWidth = shortestSide * 0.45;
            let scale = maxWmWidth / wmImg.width;
            
            // Scale constraints
            if (scale > 3) scale = 3;
            
            const wmW = wmImg.width * scale;
            const wmH = wmImg.height * scale;
            
            const x = (canvas.width - wmW) / 2;
            const y = (canvas.height - wmH) / 2;
            
            ctx.drawImage(wmImg, x, y, wmW, wmH);
            ctx.globalAlpha = 1.0;
            
            const processedUrl = canvas.toDataURL('image/jpeg', 0.92);
            resolve({ ...fileData, processedBase64: processedUrl, status: 'done', isDark });
          };
          wmImg.onerror = () => {
            // If watermark fails, return error rather than unwatermarked image
            resolve({ ...fileData, status: 'error' });
          }
          wmImg.src = watermarkUrl;
        }
        
      };
      img.onerror = () => {
         resolve({ ...fileData, status: 'error' });
      }
      img.src = url;
    });
  };

  const processAll = async () => {
    const filesToProcess = files.filter(f => f.status === 'pending');
    if (filesToProcess.length === 0) return;

    // First mark all as processing to show UI feedback
    setFiles(prev => prev.map(f => f.status === 'pending' ? { ...f, status: 'processing' } : f));
    
    // Process all pending files in parallel
    const processPromises = filesToProcess.map(async (file) => {
      try {
        const result = await processImage(file);
        
        if (result.status === 'done' && result.processedBase64) {
          addLog(
            'photo_editor',
            mode === 'watermark' ? 'Aplicou Marca d\'Água' : 'Editou Foto (IA)',
            `Arquivo: ${result.originalFile.name}`
          );
        }
        return result;
      } catch (error) {
        console.error(`Erro ao processar ${file.originalFile.name}:`, error);
        return { ...file, status: 'error' as const };
      }
    });

    const results = await Promise.all(processPromises);

    // Update state for all processed files at once
    setFiles(prev => {
      const newFiles = [...prev];
      let resultIdx = 0;
      
      return newFiles.map(f => {
        if (f.status === 'processing') {
          return results[resultIdx++] || f;
        }
        return f;
      });
    });
  };

  const doDownload = (base64Data: string, originalName: string) => {
     const link = document.createElement('a');
     link.href = base64Data;
     
     // add suffix
     const parts = originalName.split('.');
     const ext = parts.pop();
     const newName = `${parts.join('.')}-processed.${ext}`;
     
     link.download = newName;
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
  };

  const downloadAll = async () => {
    const doneFiles = files.filter(f => f.status === 'done' && f.processedBase64);
    if (doneFiles.length === 0) return;
    
    // Dispara todos os downloads de uma vez (arquivos individuais).
    // No PC, navegadores baseados em Chromium irão perguntar se você "Permite o download de vários arquivos".
    // No iPhone (iOS), o Safari possui um bloqueio rígido contra múltiplos downloads via código web
    // para evitar spam, portanto ele pode baixar apenas a primeira foto. Infelizmente, sem usar ZIP
    // não existe uma liberação nativa no iOS para baixar 20 arquivos separados num único clique.
    doneFiles.forEach((f, index) => {
      setTimeout(() => {
        doDownload(f.processedBase64!, f.originalFile.name);
      }, index * 400); // 400ms delay to try and trick popup blockers and ensure files don't collide
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mx-auto">
        <div className="flex bg-gray-100 p-1.5 rounded-2xl w-full max-w-md mx-auto mb-6 sm:mb-8">
            <button
              onClick={() => setMode('edit')}
              className={`flex-1 py-3 px-4 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                mode === 'edit'
                  ? 'bg-white text-marromescuro shadow-sm'
                  : 'text-marromescuro/40 hover:text-marromescuro'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Editar
            </button>
            <button
               onClick={() => setMode('watermark')}
               className={`flex-1 py-3 px-4 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                 mode === 'watermark'
                   ? 'bg-white text-marromescuro shadow-sm'
                   : 'text-marromescuro/40 hover:text-marromescuro'
               }`}
             >
               <Layers className="w-3.5 h-3.5" />
               Marca d'Água
             </button>
        </div>

        {mode === 'watermark' && (
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8">
            <button
              onClick={() => setTargetLogo('auto')}
              className={`flex-1 sm:flex-none min-w-[120px] px-3 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-tight transition-all border ${
                targetLogo === 'auto' 
                  ? 'bg-gray-900 text-white border-gray-900 shadow-md' 
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              Logo Automático
            </button>
            <button
              onClick={() => setTargetLogo('white')}
              className={`flex-1 sm:flex-none min-w-[120px] px-3 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-tight transition-all border ${
                targetLogo === 'white' 
                  ? 'bg-white text-gray-900 border-marromescuro shadow-sm' 
                  : 'bg-gray-50 text-gray-400 border-gray-200'
              }`}
            >
              Forçar Branco
            </button>
            <button
              onClick={() => setTargetLogo('black')}
              className={`flex-1 sm:flex-none min-w-[120px] px-3 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-tight transition-all border ${
                targetLogo === 'black' 
                  ? 'bg-gray-900 text-white border-gray-900 shadow-md' 
                  : 'bg-white text-gray-900 border-gray-200'
              }`}
            >
              Forçar Preto
            </button>
          </div>
        )}

        {/* Upload Area */}
        <div 
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center transition-all cursor-pointer group ${
            isDragging ? 'border-[#617964] bg-[#617964]/5' : 'border-gray-100 hover:border-[#617964]/30 bg-gray-50/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
            multiple 
            accept="image/*" 
          />
          <div className="bg-white p-5 rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-[#617964]" />
          </div>
          <h3 className="text-sm sm:text-base font-black text-marromescuro mb-1 uppercase tracking-tight">Upload de Fotos</h3>
          <p className="text-[10px] sm:text-xs text-marromescuro/40 text-center max-w-[200px] sm:max-w-sm font-bold uppercase tracking-wider">
            Arraste fotos ou clique aqui para selecionar
          </p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-sm sm:text-lg font-black text-marromescuro uppercase tracking-tight">Imagens Selecionadas ({files.length})</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setFiles([])}
                  className="flex-1 sm:flex-none px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-marromescuro/40 hover:text-red-600 transition-colors bg-gray-50 rounded-xl"
                >
                  Limpar
                </button>
                <button
                  onClick={processAll}
                  disabled={!files.some(f => f.status === 'pending')}
                  className="flex-1 sm:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white bg-[#617964] hover:bg-[#4a5c4c] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#617964]/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Processar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {files.map((file, i) => (
                <div key={i} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 group relative">
                  <div className="aspect-[4/3] bg-gray-200 relative">
                    {file.processedBase64 ? (
                      <img src={file.processedBase64} className="w-full h-full object-cover" alt="Processed" />
                    ) : file.previewUrl ? (
                      <>
                        <img src={file.previewUrl} className="w-full h-full object-cover opacity-50" alt="Original Preview" />
                        {mode === 'watermark' && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6">
                            <img 
                              src={targetLogo === 'black' ? 'https://i.imgur.com/PsQnJ9g.png' : 'https://i.imgur.com/FLnyJIe.png'} 
                              className="w-1/2 h-auto opacity-30 object-contain" 
                              alt="Watermark Overlay"
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                         <ImageIcon className="w-8 h-8 opacity-50" />
                      </div>
                    )}
                    
                    {file.status === 'processing' && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white p-4">
                        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin mb-2"></div>
                        <span className="text-sm font-medium text-center">Processando com IA...</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 truncate" title={file.originalFile.name}>
                      {file.originalFile.name}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        file.status === 'done' ? 'bg-green-100 text-green-700' :
                        file.status === 'error' ? 'bg-red-100 text-red-700' :
                        file.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {file.status === 'done' ? 'Concluído' :
                         file.status === 'error' ? 'Erro' :
                         file.status === 'processing' ? 'Pendente' :
                         'Aguardando'}
                      </span>
                      
                      {file.status === 'done' && file.isDark !== undefined && mode === 'watermark' && (
                         <span className="text-xs text-gray-500">{file.isDark ? 'Escura' : 'Clara'}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions overlay */}
                  <div className="absolute top-2 right-2 flex gap-1 transition-opacity">
                    {file.status === 'done' && file.processedBase64 && (
                      <button 
                         onClick={() => doDownload(file.processedBase64!, file.originalFile.name)}
                         className="p-1.5 bg-white/90 hover:bg-white text-gray-700 rounded-lg backdrop-blur-sm shadow-sm transition-colors"
                         title="Download individual (Usar no celular se o download em lote falhar)"
                      >
                         <Download className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                       onClick={() => removeFile(i)}
                       className="p-1.5 bg-white/90 hover:bg-white text-red-600 rounded-lg backdrop-blur-sm shadow-sm transition-colors"
                       title="Remover"
                    >
                       <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {files.some(f => f.status === 'done') && (
              <div className="flex justify-center mt-8">
                 <button
                   onClick={downloadAll}
                   className="w-full sm:w-auto px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white bg-marromescuro hover:bg-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/10"
                 >
                   <Download className="w-4 h-4" />
                   Baixar Todas
                 </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
