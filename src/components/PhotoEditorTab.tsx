import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Sparkles, Download, Layers, Trash2 } from 'lucide-react';

interface ProcessedFile {
  originalFile: File;
  processedBase64: string | null;
  status: 'pending' | 'processing' | 'done' | 'error';
  isDark?: boolean;
}

export function PhotoEditorTab() {
  const [mode, setMode] = useState<'edit' | 'watermark'>('edit');
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
      processedBase64: null,
      status: 'pending'
    }));
    setFiles(prev => [...prev, ...newProcessedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processImage = (fileData: ProcessedFile): Promise<ProcessedFile> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(fileData.originalFile);
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
          
          if (avgBrightness < 80) { // Very dark
            brightness = 120;
            contrast = 105;
          } else if (avgBrightness < 110) { // Slightly dark
            brightness = 110;
            contrast = 103;
          } else if (isBlownOut) { // Highlights blown out
            brightness = 90;
            contrast = 105;
          } else if (avgBrightness > 190) { // Too bright overall
            brightness = 95;
            contrast = 102;
          }

          ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          
          const processedUrl = canvas.toDataURL('image/jpeg', 0.95);
          resolve({ ...fileData, processedBase64: processedUrl, status: 'done', isDark });

        } else if (mode === 'watermark') {
          // Add Watermark
          const watermarkUrl = isDark 
            ? 'https://i.imgur.com/FLnyJIe.png' // White for dark images
            : 'https://i.imgur.com/PsQnJ9g.png'; // Black for light images

          const wmImg = new Image();
          wmImg.crossOrigin = 'Anonymous';
          wmImg.onload = () => {
            ctx.globalAlpha = 0.4; // 40% opacity as requested
            
            // Adjust watermark size (e.g., 40% of the image width)
            const maxWmWidth = canvas.width * 0.4;
            let scale = maxWmWidth / wmImg.width;
            
            // Prevent watermark from getting extremely large if image is too large
            if (scale > 2) scale = 1.5;
            
            const wmW = wmImg.width * scale;
            const wmH = wmImg.height * scale;
            
            const x = (canvas.width - wmW) / 2;
            const y = (canvas.height - wmH) / 2;
            
            ctx.drawImage(wmImg, x, y, wmW, wmH);
            ctx.globalAlpha = 1.0;
            
            const processedUrl = canvas.toDataURL('image/jpeg', 0.95);
            resolve({ ...fileData, processedBase64: processedUrl, status: 'done', isDark });
          };
          wmImg.onerror = () => {
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
    // mark all pending as processing
    setFiles(prev => prev.map(f => f.status === 'pending' ? { ...f, status: 'processing' } : f));
    
    // Process one by one or Promise.all. For performance, let's do Promise.all chunks, 
    // but a simple map with Promise.all is fine for normal numbers of images in browser
    
    // To prevent React state getting messy with parallel async updates, process loop:
    const currentFiles = [...files];
    for (let i = 0; i < currentFiles.length; i++) {
       if (currentFiles[i].status !== 'pending') continue;
       const result = await processImage(currentFiles[i]);
       setFiles(prev => {
          const newArr = [...prev];
          newArr[i] = result;
          return newArr;
       });
    }
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

  const downloadAll = () => {
     files.forEach(f => {
       if (f.status === 'done' && f.processedBase64) {
         doDownload(f.processedBase64, f.originalFile.name);
       }
     });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-black text-gray-900 mb-2">Editor de Fotos IA</h1>
        <p className="text-sm lg:text-base text-gray-500 font-medium">Melhore detalhes de luzes ou adicione marca d'água automaticamente.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-4xl mx-auto">
        <div className="flex bg-gray-100 p-1 rounded-xl w-full max-w-md mx-auto mb-8">
            <button
              onClick={() => setMode('edit')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                mode === 'edit'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Editar Foto
            </button>
            <button
               onClick={() => setMode('watermark')}
               className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                 mode === 'watermark'
                   ? 'bg-white text-gray-900 shadow-sm'
                   : 'text-gray-500 hover:text-gray-900'
               }`}
             >
               <Layers className="w-4 h-4" />
               Marca d'Água
             </button>
        </div>

        {/* Upload Area */}
        <div 
          className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-colors cursor-pointer ${
            isDragging ? 'border-[#617964] bg-[#617964]/5' : 'border-gray-200 hover:border-gray-300 bg-gray-50'
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
          <div className="bg-white p-4 rounded-full shadow-sm mb-4">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Upload de Imagens</h3>
          <p className="text-sm text-gray-500 text-center max-w-sm">
            Arraste e solte fotos aqui ou clique para procurar no seu dispositivo. Processamento em lote suportado.
          </p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Imagens ({files.length})</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setFiles([])}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
                >
                  Limpar
                </button>
                <button
                  onClick={processAll}
                  disabled={!files.some(f => f.status === 'pending')}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#617964] hover:bg-[#4a5c4c] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Processar Imagens
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {files.map((file, i) => (
                <div key={i} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 group relative">
                  <div className="aspect-[4/3] bg-gray-200 relative">
                    {file.processedBase64 ? (
                      <img src={file.processedBase64} className="w-full h-full object-cover" alt="Processed" />
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
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {file.status === 'done' && file.processedBase64 && (
                      <button 
                         onClick={() => doDownload(file.processedBase64!, file.originalFile.name)}
                         className="p-1.5 bg-white/90 hover:bg-white text-gray-700 rounded-lg backdrop-blur-sm shadow-sm transition-colors"
                         title="Download"
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
              <div className="flex justify-center mt-6">
                 <button
                   onClick={downloadAll}
                   className="px-6 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-black rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                 >
                   <Download className="w-4 h-4" />
                   Baixar Todas as Concluídas
                 </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
