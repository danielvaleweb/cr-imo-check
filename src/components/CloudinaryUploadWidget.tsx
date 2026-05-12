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
  showPreview = true,
  withWatermark = true
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const widgetRef = useRef<any>(null);
  const batchUrls = useRef<string[]>([]);

  const applyWatermark = (url: string) => {
    if (!url.includes('/image/upload/')) return url;
    
    // Base64 URL for the logo: https://i.imgur.com/egg4k7M.png
    const logoBase64 = 'aHR0cHM6Ly9pLmltZ3VyLmNvbS9lZ2c0azdNLnBuZw==';
    
    // Center watermark, 40% width, 30% opacity
    // Using chaining transformation to ensure watermark is applied correctly
    const transformation = `l_fetch:${logoBase64},g_center,w_0.4,o_30/`;
    return url.replace('/image/upload/', `/image/upload/${transformation}`);
  };

  useEffect(() => {
    if (!window.cloudinary) return;

    widgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName: 'dslmdkfoh',
        uploadPreset: 'cr_upload',
        folder: folder,
        sources: ['local', 'url', 'camera', 'google_drive'],
        multiple: multiple,
        maxFiles: maxFiles,
        resourceType: 'auto',
        clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp', 'pdf'],
        defaultSource: 'local',
        styles: {
          palette: {
            window: '#FFFFFF',
            windowBorder: '#90A0B3',
            tabIcon: '#617964',
            menuIcons: '#5A616A',
            textDark: '#000000',
            textLight: '#FFFFFF',
            link: '#617964',
            action: '#617964',
            inactiveTabIcon: '#0E2F5A',
            error: '#F44235',
            inProgress: '#617964',
            complete: '#20B832',
            sourceBg: '#E4EBF1'
          },
          fonts: {
            default: null,
            "'Helvetica Neue', Helvetica, Arial, sans-serif": {}
          }
        }
      },
      async (error: any, result: any) => {
        if (error && onUploadError) {
          onUploadError(error);
          setIsUploading(false);
          return;
        }

        if (result.event === 'upload-progress') {
          setProgress(result.info.progress);
          setIsUploading(true);
        }

        if (result.event === 'success') {
          let url = result.info.secure_url;
          
          if (withWatermark && result.info.resource_type === 'image') {
            url = applyWatermark(url);
          }

          if (showPreview) {
            setPreview(url);
          }
          batchUrls.current.push(url);
          onUploadSuccess(url);
        }

        if (result.event === 'close') {
          if (batchUrls.current.length > 0 && onBatchUploadSuccess) {
            onBatchUploadSuccess(batchUrls.current);
          }
          batchUrls.current = [];
          setIsUploading(false);
        }
      }
    );
  }, [onUploadSuccess, onBatchUploadSuccess, onUploadError, folder, multiple, maxFiles, showPreview, withWatermark]);

  const handleOpenWidget = () => {
    if (widgetRef.current) {
      widgetRef.current.open();
    } else {
      console.error('Cloudinary widget not initialized');
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setProgress(0);
  };

  return (
    <div className="w-full space-y-3">
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
