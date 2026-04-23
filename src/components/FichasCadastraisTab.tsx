import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileSignature, 
  Home, 
  User, 
  MapPin, 
  FileText, 
  Lock, 
  TrendingUp, 
  KeyRound, 
  CheckCircle2, 
  Scale, 
  MessageCircle, 
  Search,
  Plus,
  Download
} from 'lucide-react';
import { FichaCaptacaoExclusiva } from './FichaCaptacaoExclusiva';
import { generateExclusivityPDF } from '../lib/pdfGenerator';

export const FICHAS = [
  { id: 'captacao_exclusiva', title: 'Captação (C/ Exclusividade)', description: 'Autorização de venda com exclusividade. Cópia dos dados internos e do proprietário.', icon: ShieldCheck, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  { id: 'captacao_simples', title: 'Captação (S/ Exclusividade)', description: 'Dados básicos para novo imóvel: proprietário, endereço, características e valores.', icon: FileSignature, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { id: 'cadastro_interno', title: 'Ficha do Imóvel (Interno)', description: 'Cadastro completo: código, pontos fortes, histórico e docs de matrícula.', icon: Home, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  { id: 'cliente', title: 'Ficha de Cliente (Comprador/Loc)', description: 'Perfil detalhado de busca, urgência, forma de pagamento e região.', icon: User, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { id: 'visita', title: 'Ficha de Visita', description: 'Controle de visitantes no imóvel, coletando feedbacks e assinatura.', icon: MapPin, color: 'text-rose-600', bgColor: 'bg-rose-50' },
  { id: 'proposta', title: 'Ficha de Proposta', description: 'Registro de oferta do cliente, valores de pagamento e validade da proposta.', icon: FileText, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  { id: 'reserva', title: 'Ficha de Reserva', description: 'Garantia de reserva com sinal financeiro e condições de cancelamento.', icon: Lock, color: 'text-slate-600', bgColor: 'bg-slate-50' },
  { id: 'analise_credito', title: 'Análise de Crédito (Locação)', description: 'Verificação de renda, restrições e garantias para aluguel.', icon: TrendingUp, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
  { id: 'locacao', title: 'Ficha de Locação', description: 'Cadastro e aprovação completa do inquilino selecionado.', icon: KeyRound, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { id: 'vistoria', title: 'Ficha de Vistoria (Entrada/Saída)', description: 'Laudo de conservação, fotos e checklist detalhado do imóvel.', icon: CheckCircle2, color: 'text-lime-600', bgColor: 'bg-lime-50' },
  { id: 'doc_juridica', title: 'Documentação Jurídica', description: 'Controle de certidões, matrículas, IPTU e pendências cartorárias.', icon: Scale, color: 'text-fuchsia-600', bgColor: 'bg-fuchsia-50' },
  { id: 'pos_venda', title: 'Ficha de Pós-venda', description: 'Acompanhamento final, pesquisa de satisfação e pedido de indicações.', icon: MessageCircle, color: 'text-pink-600', bgColor: 'bg-pink-50' }
];

export function FichasCadastraisTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFicha, setActiveFicha] = useState<string | null>(null);
  const [fichaMode, setFichaMode] = useState<'blank' | 'search' | null>(null);
  
  const filteredFichas = FICHAS.filter(f => 
    f.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (activeFicha === 'captacao_exclusiva') {
    return <FichaCaptacaoExclusiva onBack={() => { setActiveFicha(null); setFichaMode(null); }} initialProperty={fichaMode === 'blank' ? 'blank' : null} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-gray-900 mb-2">Fichas e Modelos</h1>
          <p className="text-sm lg:text-base text-gray-500 font-medium">Gestão de documentos e contratos de ponta a ponta na esteira imobiliária.</p>
        </div>
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar ficha..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80 pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#617964]/20 transition-shadow shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredFichas.map(ficha => (
          <div 
            key={ficha.id}
            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group focus-within:ring-2 ring-[#617964]/20 cursor-pointer flex flex-col h-full"
            onClick={() => {
              if (ficha.id === 'captacao_exclusiva') {
                setActiveFicha(ficha.id);
              } else {
                alert(`Abrir modelo: ${ficha.title} (Em desenvolvimento)`);
              }
            }}
          >
            <div className={`w-14 h-14 ${ficha.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:-translate-y-1 group-hover:scale-105 transition-transform`}>
              <ficha.icon className={`w-7 h-7 ${ficha.color}`} />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-2">{ficha.title}</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed flex-grow">
              {ficha.description}
            </p>
            
            <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (ficha.id === 'captacao_exclusiva') {
                      setActiveFicha(ficha.id);
                      setFichaMode('blank');
                    } else {
                      alert('Em breve');
                    }
                  }}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  <Plus className="w-3 h-3 text-gray-400" /> Criar
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (ficha.id === 'captacao_exclusiva') {
                      setActiveFicha(ficha.id);
                      setFichaMode('search');
                    } else {
                      alert('Em breve');
                    }
                  }}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  <Search className="w-3 h-3 text-gray-400" /> Pesquisar
                </button>
              </div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (ficha.id === 'captacao_exclusiva') {
                    generateExclusivityPDF({});
                  } else {
                    alert('Download indisponível para este modelo');
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-50 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-gray-100 hover:text-gray-700 transition-all border border-transparent hover:border-gray-200"
              >
                <Download className="w-3 h-3" /> Baixar em Branco
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {filteredFichas.length === 0 && (
         <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
           <FileSignature className="w-12 h-12 text-gray-300 mx-auto mb-4" />
           <p className="text-gray-500 font-medium">Nenhuma ficha encontrada buscando por "{searchTerm}"</p>
         </div>
      )}
    </div>
  );
}
