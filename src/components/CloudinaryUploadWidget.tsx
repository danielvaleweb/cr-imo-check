import React, { useEffect, useRef, useState } from 'react';
import { Upload, X, CheckCircle, Loader2, Image as ImageIcon } from 'lucide-react';

interface CloudinaryUploadWidgetProps {
  onUploadSuccess: (url: string) => void;
  onBatchUploadSuccess?: (urls: string[]) => void;
  onUploadError?: (error: any) => void;
  folder?: string;
  buttonLabel?: string;
  multiple?: boolean;
  maxFiles?: number;
  resourceType?: 'image';
  showPreview?: boolean;
  withWatermark?: boolean;
}

declare global {
  interface Window {
    cloudinary: any;
  }
}

export const CloudinaryUploadWidget: React.FC<CloudinaryUploadWidgetProps> = ({
  onUploadSuccess,
  onBatchUploadSuccess,
  onUploadError,
  folder = 'uploads',
  buttonLabel = 'Fazer Upload',
  multiple = false,
  maxFiles = 1,
  resourceType = 'image',
  showPreview = true,
  withWatermark = true
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchUrls = useRef<string[]>([]);
  const cloudName = 'dslmdkfoh';
  const uploadPreset = 'cr_upload';

  const applyWatermark = (url: string) => {
    if (!url.includes('/image/upload/')) return url;
    
    // Base64 URL for the logo: https://i.imgur.com/egg4k7M.png
    const logoBase64 = 'aHR0cHM6Ly9pLmltZ3VyLmNvbS9lZ2c0azdNLnBuZw==';
    
    // Center watermark, 40% width, 30% opacity
    const transformation = `l_fetch:${logoBase64},g_center,w_0.4,o_30/`;
    return url.replace('/image/upload/', `/image/upload/${transformation}`);
  };

  const uploadFile = async (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', folder);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType === 'image' ? 'image' : 'auto'}/upload`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.secure_url);
        } else {
          reject(new Error('Falha no upload'));
        }
      };

      xhr.onerror = () => reject(new Error('Erro de conexão'));
      xhr.send(formData);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setProgress(0);
    batchUrls.current = [];

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        let url = await uploadFile(file);
        
        // Apply watermark if it's an image
        if (withWatermark && file.type.startsWith('image/')) {
          url = applyWatermark(url);
        }

        return url;
      });

      const urls = await Promise.all(uploadPromises);
      
      if (showPreview && urls.length > 0) {
        setPreview(urls[0]);
      }

      urls.forEach(url => onUploadSuccess(url));
      
      if (onBatchUploadSuccess) {
        onBatchUploadSuccess(urls);
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (onUploadError) onUploadError(error);
    } finally {
      setIsUploading(false);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleOpenWidget = () => {
    fileInputRef.current?.click();
  };

  const clearPreview = () => {
    setPreview(null);
    setProgress(0);
  };

  return (
    <div className="w-full space-y-3">
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple={multiple}
        accept={resourceType === 'image' ? 'image/*' : 'image/*,application/pdf'}
        className="hidden"
      />
      {!preview ? (
        <button
          type="button"
          onClick={handleOpenWidget}
          disabled={isUploading}
          className="w-full border-2 border-dashed border-gray-100 rounded-3xl p-8 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-all group"
        >
          <div className="bg-white p-5 rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-[#617964] animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-[#617964]" />
            )}
          </div>
          <span className="text-base font-black text-gray-900 uppercase tracking-tight mb-1">
            {isUploading ? `Enviando... ${progress}%` : buttonLabel}
          </span>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            Imagens e PDF são permitidos
          </p>

          {isUploading && (
            <div className="w-full max-w-xs mt-6 bg-gray-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[#617964] h-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </button>
      ) : (
        <div className="relative bg-gray-50 rounded-[32px] overflow-hidden border border-gray-100 p-2">
          <div className="aspect-video bg-white rounded-[24px] overflow-hidden">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-black text-gray-900 uppercase tracking-tight">Upload concluído</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Arquivo pronto</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleOpenWidget}
                className="p-3 bg-white border border-gray-100 text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
                title="Trocar imagem"
              >
                <div className="flex items-center gap-2 px-2">
                   <ImageIcon className="w-4 h-4" />
                   <span className="text-[10px] font-black uppercase tracking-widest leading-none">Trocar</span>
                </div>
              </button>
              
              <button
                type="button"
                onClick={clearPreview}
                className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                title="Remover"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
