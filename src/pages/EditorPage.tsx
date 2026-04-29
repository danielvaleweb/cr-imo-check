import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PhotoEditorTab } from '../components/PhotoEditorTab';

export default function EditorPage() {
  const navigate = useNavigate();

  return (
    <div className="pt-32 pb-20 px-6 bg-brancobg min-h-screen">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-marromescuro/60 hover:text-marromescuro transition-colors group"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Voltar</span>
            </button>
            <h1 className="text-4xl lg:text-5xl font-black text-marromescuro">
              Studio de <span className="text-terracota">Imagens</span>
            </h1>
            <p className="text-lg text-marromescuro/60 max-w-2xl font-medium leading-relaxed">
              Utilize nossa inteligência para melhorar a iluminação das suas fotos ou aplique marcas d'água profissionais em lote.
            </p>
          </div>
        </div>

        {/* Editor Component Wrap */}
        <div className="bg-white/50 backdrop-blur-sm rounded-[2.5rem] p-4 md:p-8 border border-white/20 shadow-2xl">
          <PhotoEditorTab />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
             <div className="w-12 h-12 bg-terracota/10 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">✨</span>
             </div>
             <h3 className="text-xl font-bold text-marromescuro">Ajuste Inteligente</h3>
             <p className="text-sm text-marromescuro/60 leading-relaxed">
               Nossa IA analisa cada pixel para ajustar sombras e luzes, trazendo detalhes que as fotos originais escondem.
             </p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
             <div className="w-12 h-12 bg-[#617964]/10 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">🛡️</span>
             </div>
             <h3 className="text-xl font-bold text-marromescuro">Marca d'água</h3>
             <p className="text-sm text-marromescuro/60 leading-relaxed">
               Proteja seu conteúdo automaticamente. O sistema escolhe a versão branca ou preta baseado no brilho da foto.
             </p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
             <div className="w-12 h-12 bg-marromescuro/5 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">⚡</span>
             </div>
             <h3 className="text-xl font-bold text-marromescuro">Processamento em Lote</h3>
             <p className="text-sm text-marromescuro/60 leading-relaxed">
               Suba várias imagens de uma vez e processe todas com um único clique, economizando horas de trabalho.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
