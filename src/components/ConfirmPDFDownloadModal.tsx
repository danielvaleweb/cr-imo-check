import React from 'react';
import { AlertCircle, CheckCircle, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onReview: () => void;
}

export function ConfirmPDFDownloadModal({ isOpen, onClose, onConfirm, onReview }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden border border-gray-100"
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-3 mb-8">
                <h3 className="text-2xl font-black text-gray-900 leading-tight">
                  Revisão Necessária
                </h3>
                <p className="text-gray-500 font-medium">
                  Você revisou a ficha e está correta? É importante conferir todos os dados antes de gerar o documento final.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={onConfirm}
                  className="w-full py-4 bg-[#617964] text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-lg shadow-[#617964]/20 uppercase tracking-widest text-sm"
                >
                  <CheckCircle className="w-5 h-5" /> Sim, está tudo correto
                </button>
                <button
                  onClick={onReview}
                  className="w-full py-4 bg-gray-50 text-gray-900 rounded-2xl font-black border border-gray-100 flex items-center justify-center gap-2 hover:bg-gray-100 transition-all uppercase tracking-widest text-sm"
                >
                  <Eye className="w-5 h-5 text-[#617964]" /> Revisar Dados Agora
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 italic">
               <p className="text-[10px] text-gray-400 font-medium text-center">
                 A CR Imóveis preza pela precisão dos documentos. Revise com atenção.
               </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
