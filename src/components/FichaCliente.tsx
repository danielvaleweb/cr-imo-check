import React, { useState } from 'react';
import { ArrowLeft, User, Search, Download, CheckSquare, FileText, Briefcase, Heart } from 'lucide-react';
import { generateClientFichaPDF } from '../lib/pdfGenerator';
import { ConfirmPDFDownloadModal } from './ConfirmPDFDownloadModal';
import { PDFPreviewModal } from './PDFPreviewModal';

interface Props {
  onBack: () => void;
  initialData?: any | 'blank' | null;
}

export function FichaCliente({ onBack, initialData }: Props) {
  const [formData, setFormData] = useState<any>({});
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUri, setPreviewUri] = useState('');

  React.useEffect(() => {
// ...
    if (initialData === 'blank') {
      setFormData({
         name: '', cpf: '', rg: '', phone: '', whatsapp: '', email: '',
         maritalStatus: '', profession: '', monthlyIncome: '',
         searchType: '', propertyType: '', neighborhoods: '', targetValue: '',
         bedrooms: '', parkingSpots: '', suites: '', differentials: {}, otherDifferentials: '',
         paymentMethods: {}, hasExchange: '', urgency: '', observations: ''
      });
    } else if (initialData && typeof initialData !== 'string') {
      // In case we want to populate from a proposal
      setFormData({
         name: initialData.userName || '', 
         email: initialData.userEmail || '',
         phone: initialData.userPhone || '',
         whatsapp: initialData.userPhone || '',
         cpf: '', rg: '',
         maritalStatus: '', profession: '', monthlyIncome: '',
         searchType: '', propertyType: initialData.propertyType || '', 
         neighborhoods: '', targetValue: initialData.proposalValue ? `R$ ${initialData.proposalValue}` : '',
         bedrooms: '', parkingSpots: '', suites: '', differentials: {}, otherDifferentials: '',
         paymentMethods: {
            financiamento: initialData.paymentMethod?.includes('Financiamento') || false,
            aVista: initialData.paymentMethod?.includes('vista') || false,
         }, 
         hasExchange: '', urgency: '', observations: ''
      });
    }
  }, [initialData]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDifferential = (key: string) => {
    setFormData(prev => ({
      ...prev,
      differentials: { ...prev.differentials, [key]: !prev.differentials?.[key] }
    }));
  };

  const handlePayment = (key: string) => {
    setFormData(prev => ({
      ...prev,
      paymentMethods: { ...prev.paymentMethods, [key]: !prev.paymentMethods?.[key] }
    }));
  };

  const handleGeneratePDF = () => {
    generateClientFichaPDF(formData);
    setIsConfirmOpen(false);
  };

  const handleReviewPDF = () => {
    const uri = generateClientFichaPDF(formData, { returnUri: true }) as string;
    setPreviewUri(uri);
    setIsConfirmOpen(false);
    setIsPreviewOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-6 sticky top-0 bg-gray-50/80 backdrop-blur-md z-10 p-4 -mx-4 px-4 rounded-xl">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-white text-gray-400 rounded-xl hover:bg-gray-100 transition-colors shadow-sm border border-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-black text-gray-900">
              Ficha de Cliente <span className="text-gray-400 font-medium text-sm ml-2">(Comprador / Locatário)</span>
            </h2>
            <p className="text-sm text-gray-500 font-medium">Preencha os dados abaixo para gerar a ficha em PDF.</p>
          </div>
        </div>
        <button
          onClick={() => setIsConfirmOpen(true)}
          className="px-6 py-3 bg-amber-500 text-white rounded-xl text-sm font-black shadow-lg shadow-amber-500/20 hover:scale-[1.02] flex items-center gap-2 uppercase tracking-widest transition-all"
        >
          <Download className="w-4 h-4" /> Gerar PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* DADOS PESSOAIS */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-sm font-black text-[#617964] flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
            <User className="w-4 h-4" /> Dados Pessoais
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">Nome Completo</label>
              <input type="text" value={formData.name || ''} onChange={(e) => handleChange('name', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">CPF</label>
              <input type="text" value={formData.cpf || ''} onChange={(e) => handleChange('cpf', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">RG</label>
              <input type="text" value={formData.rg || ''} onChange={(e) => handleChange('rg', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
            
            <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase">Telefone</label>
               <input type="text" value={formData.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
             <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase">WhatsApp</label>
               <input type="text" value={formData.whatsapp || ''} onChange={(e) => handleChange('whatsapp', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
             <div className="lg:col-span-2 space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase">E-mail</label>
               <input type="email" value={formData.email || ''} onChange={(e) => handleChange('email', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase">Estado Civil</label>
               <input type="text" value={formData.maritalStatus || ''} onChange={(e) => handleChange('maritalStatus', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase">Profissão</label>
               <input type="text" value={formData.profession || ''} onChange={(e) => handleChange('profession', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase">Renda Mensal</label>
               <input type="text" value={formData.monthlyIncome || ''} onChange={(e) => handleChange('monthlyIncome', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
          </div>
        </div>

        {/* PERFIL DE BUSCA */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
           <h3 className="text-sm font-black text-[#617964] flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
            <Heart className="w-4 h-4" /> Perfil de Busca
          </h3>
          
          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase bg-white px-1">Tipo</label>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="radio" checked={formData.searchType === 'compra'} onChange={() => handleChange('searchType', 'compra')} className="w-4 h-4 text-[#617964] focus:ring-[#617964]" />
                  Compra
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="radio" checked={formData.searchType === 'locacao'} onChange={() => handleChange('searchType', 'locacao')} className="w-4 h-4 text-[#617964] focus:ring-[#617964]" />
                  Locação
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase">Tipo de Imóvel</label>
                <input type="text" value={formData.propertyType || ''} onChange={(e) => handleChange('propertyType', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
                </div>
                <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase">Bairros de Interesse</label>
                <input type="text" value={formData.neighborhoods || ''} onChange={(e) => handleChange('neighborhoods', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
                </div>
                <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase">Valor Pretendido</label>
                <input type="text" value={formData.targetValue || ''} onChange={(e) => handleChange('targetValue', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" placeholder="R$" />
                </div>
                <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase">Quartos</label>
                <input type="number" value={formData.bedrooms || ''} onChange={(e) => handleChange('bedrooms', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
                </div>
                <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase">Vagas</label>
                <input type="number" value={formData.parkingSpots || ''} onChange={(e) => handleChange('parkingSpots', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
                </div>
                 <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase">Suítes</label>
                <input type="number" value={formData.suites || ''} onChange={(e) => handleChange('suites', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase block">Diferenciais Desejados</label>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { id: 'piscina', label: 'Piscina' },
                        { id: 'areaGourmet', label: 'Área gourmet' },
                        { id: 'elevador', label: 'Elevador' },
                        { id: 'portaria', label: 'Portaria' },
                        { id: 'mobiliado', label: 'Mobiliado' },
                        { id: 'varanda', label: 'Varanda' }
                    ].map(diff => (
                        <label key={diff.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                            <input type="checkbox" checked={formData.differentials?.[diff.id] || false} onChange={() => handleDifferential(diff.id)} className="w-4 h-4 text-[#617964] rounded focus:ring-[#617964]" />
                            {diff.label}
                        </label>
                    ))}
                </div>
            </div>
            
            <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase">Outros Diferenciais</label>
                <input type="text" value={formData.otherDifferentials || ''} onChange={(e) => handleChange('otherDifferentials', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
          </div>
        </div>

        <div className="space-y-8">
            {/* CONDIÇÕES */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm font-black text-[#617964] flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
                    <Briefcase className="w-4 h-4" /> Condições
                </h3>
            
                <div className="space-y-5">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase bg-white px-1 block mb-2">Forma de Pagamento</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: 'financiamento', label: 'Financiamento' },
                                { id: 'aVista', label: 'À vista' },
                                { id: 'fgts', label: 'FGTS' },
                                { id: 'consorcio', label: 'Consórcio' }
                            ].map(pay => (
                                <label key={pay.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                    <input type="checkbox" checked={formData.paymentMethods?.[pay.id] || false} onChange={() => handlePayment(pay.id)} className="w-4 h-4 text-[#617964] rounded focus:ring-[#617964]" />
                                    {pay.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase bg-white px-1 block mb-2">Possui imóvel para troca?</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                            <input type="radio" checked={formData.hasExchange === 'yes'} onChange={() => handleChange('hasExchange', 'yes')} className="w-4 h-4 text-[#617964] focus:ring-[#617964]" />
                            Sim
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                            <input type="radio" checked={formData.hasExchange === 'no'} onChange={() => handleChange('hasExchange', 'no')} className="w-4 h-4 text-[#617964] focus:ring-[#617964]" />
                            Não
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* URGÊNCIA */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm font-black text-[#617964] flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
                    <FileText className="w-4 h-4" /> Urgência & Observações
                </h3>
            
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase bg-white px-1 block mb-2">Urgência</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: 'imediata', label: 'Imediata' },
                                { id: '30dias', label: 'Até 30 dias' },
                                { id: '90dias', label: 'Até 90 dias' },
                                { id: 'sem_prazo', label: 'Sem prazo definido' }
                            ].map(urg => (
                                <label key={urg.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                    <input type="radio" name="urgency" checked={formData.urgency === urg.id} onChange={() => handleChange('urgency', urg.id)} className="w-4 h-4 text-[#617964] focus:ring-[#617964]" />
                                    {urg.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase">Observações</label>
                        <textarea 
                           value={formData.observations || ''} 
                           onChange={(e) => handleChange('observations', e.target.value)} 
                           rows={4}
                           className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none resize-none" 
                        />
                    </div>
                </div>
            </div>
        </div>

      </div>

      <ConfirmPDFDownloadModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleGeneratePDF}
        onReview={handleReviewPDF}
      />

      <PDFPreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        pdfDataUri={previewUri}
        title="Ficha de Cliente"
      />
    </div>
  );
}
