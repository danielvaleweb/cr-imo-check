import React from 'react';
import { X, Download, Printer } from 'lucide-react';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfDataUri: string;
  title: string;
}

export function PDFPreviewModal({ isOpen, onClose, pdfDataUri, title }: PDFPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#617964]/10 rounded-xl flex items-center justify-center">
              <Download className="w-5 h-5 text-[#617964]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 leading-tight">Visualização do Modelo</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{title}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                const link = document.createElement('a');
                link.href = pdfDataUri;
                link.download = `${title.replace(/\s+/g, '_')}_MODELO.pdf`;
                link.click();
              }}
              className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Baixar PDF
            </button>
            <button 
              onClick={onClose}
              className="p-3 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow bg-gray-100 p-4 lg:p-8 overflow-hidden">
          <div className="w-full h-full bg-white rounded-2xl shadow-inner overflow-hidden">
            <iframe 
              src={`${pdfDataUri}#toolbar=0`} 
              className="w-full h-full border-none"
              title="PDF Preview"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-white border-t border-gray-100 flex justify-between items-center">
          <p className="text-xs text-gray-400 font-medium italic">
            * Esta é apenas uma visualização do modelo para leitura.
          </p>
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-[#617964] text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-[#4a5d4c] transition-all shadow-lg active:scale-95"
          >
            Fechar Visualização
          </button>
        </div>
      </div>
    </div>
  );
}
