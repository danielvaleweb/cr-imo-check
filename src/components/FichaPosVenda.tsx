import React, { useState } from 'react';
import { ArrowLeft, MessageCircle, Download, User, MapPin, Star, ThumbsUp, Heart, Phone, Mail, Calendar } from 'lucide-react';
import { generateAfterSalesPDF } from '../lib/pdfGenerator';
import { ConfirmPDFDownloadModal } from './ConfirmPDFDownloadModal';
import { PDFPreviewModal } from './PDFPreviewModal';

interface Props {
  onBack: () => void;
  initialData?: any;
}

export function FichaPosVenda({ onBack, initialData }: Props) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUri, setPreviewUri] = useState('');

  const [formData, setFormData] = useState<any>({
    // DADOS DO CLIENTE
    clientName: '',
    clientCpf: '',
    clientPhone: '',
    clientEmail: '',
    
    // DADOS DO NEGÓCIO
    dealType: 'Locação',
    propertyAddress: '',
    completionDate: new Date().toLocaleDateString('pt-BR'),
    responsibleAgent: '',
    
    // ACOMPANHAMENTO INICIAL
    receivedAsExpected: 'Sim',
    hadInitialProblems: 'Não',
    problemDescription: '',
    
    // AVALIAÇÃO DO ATENDIMENTO
    infoClarity: '',
    agentService: '',
    processAgility: '',
    negotiationSupport: '',
    
    // SATISFAÇÃO GERAL
    satisfactionLevel: 'Muito satisfeito',
    generalComment: '',
    
    // INDICAÇÕES
    wouldRecommend: 'Sim',
    hasIndication: 'Não',
    indicatedName: '',
    indicatedPhone: '',
    
    // OPORTUNIDADES FUTURAS
    futureIntent: 'Não no momento',
    futureObservations: '',
    
    // REGISTRO DE OCORRÊNCIAS
    complaints: '',
    appliedSolution: '',
    occurrenceStatus: 'Resolvido'
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGeneratePDF = () => {
    generateAfterSalesPDF(formData);
    setIsConfirmOpen(false);
  };

  const handleReviewPDF = () => {
    const uri = generateAfterSalesPDF(formData, { returnUri: true }) as string;
    setPreviewUri(uri);
    setIsConfirmOpen(false);
    setIsPreviewOpen(true);
  };

  const Section = ({ title, icon: Icon, children, fullWidth = false }: { title: string, icon: any, children: React.ReactNode, fullWidth?: boolean }) => (
    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 space-y-6">
      <h3 className="text-sm font-black text-[#617964] flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
        <Icon className="w-4 h-4" /> {title}
      </h3>
      <div className={`grid grid-cols-1 ${fullWidth ? '' : 'md:grid-cols-2'} gap-4`}>
        {children}
      </div>
    </div>
  );

  const InputField = ({ label, field, type = "text" }: { label: string, field: string, type?: string }) => (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-500 uppercase">{label}</label>
      <input 
        type={type} 
        value={formData[field]} 
        onChange={e => handleChange(field, e.target.value)} 
        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10 transition-all font-medium" 
      />
    </div>
  );

  const SelectField = ({ label, field, options }: { label: string, field: string, options: string[] }) => (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-500 uppercase">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => handleChange(field, opt)}
            className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${formData[field] === opt ? 'bg-[#617964] text-white border-[#617964]' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Ficha de Pós-Venda / Pós-Locação</h2>
            <p className="text-gray-500 font-medium tracking-tight">Pesquisa de satisfação e acompanhamento do cliente</p>
          </div>
        </div>
        <button
          onClick={() => setIsConfirmOpen(true)}
          className="px-6 py-3 bg-[#617964] text-white rounded-xl text-sm font-black shadow-lg shadow-[#617964]/20 hover:scale-[1.02] flex items-center gap-2 uppercase tracking-widest transition-all"
        >
          <Download className="w-4 h-4" /> Gerar PDF
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* DADOS DO CLIENTE */}
        <Section title="Dados do Cliente" icon={User}>
          <InputField label="Nome" field="clientName" />
          <InputField label="CPF" field="clientCpf" />
          <InputField label="Telefone" field="clientPhone" />
          <InputField label="E-mail" field="clientEmail" />
        </Section>

        {/* DADOS DO NEGÓCIO */}
        <Section title="Dados do Negócio" icon={Calendar}>
          <SelectField label="Tipo de Negócio" field="dealType" options={['Compra', 'Venda', 'Locação']} />
          <InputField label="Data de Conclusão" field="completionDate" />
          <div className="md:col-span-2">
            <InputField label="Imóvel (Endereço/Descrição)" field="propertyAddress" />
          </div>
          <InputField label="Corretor Responsável" field="responsibleAgent" />
        </Section>

        {/* ACOMPANHAMENTO INICIAL */}
        <Section title="Acompanhamento Inicial" icon={ThumbsUp}>
          <SelectField label="Recebeu o imóvel como esperado?" field="receivedAsExpected" options={['Sim', 'Não']} />
          <SelectField label="Teve problema inicial?" field="hadInitialProblems" options={['Sim', 'Não']} />
          {formData.hadInitialProblems === 'Sim' && (
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Descrever Problema</label>
              <textarea 
                value={formData.problemDescription} 
                onChange={e => handleChange('problemDescription', e.target.value)} 
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10 h-24" 
              />
            </div>
          )}
        </Section>

        {/* AVALIAÇÃO DO ATENDIMENTO */}
        <Section title="Avaliação do Atendimento" icon={Star}>
          <InputField label="Clareza nas informações" field="infoClarity" />
          <InputField label="Atendimento do corretor" field="agentService" />
          <InputField label="Agilidade no processo" field="processAgility" />
          <InputField label="Suporte na negociação" field="negotiationSupport" />
        </Section>

        {/* SATISFAÇÃO GERAL */}
        <Section title="Satisfação Geral" icon={Heart} fullWidth>
          <div className="space-y-4">
            <SelectField label="Nível de Satisfação" field="satisfactionLevel" options={['Muito satisfeito', 'Satisfeito', 'Neutro', 'Insatisfeito']} />
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Comentário Geral</label>
              <textarea 
                value={formData.generalComment} 
                onChange={e => handleChange('generalComment', e.target.value)} 
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10 h-24" 
              />
            </div>
          </div>
        </Section>

        {/* INDICAÇÕES */}
        <Section title="Indicações" icon={Phone}>
          <SelectField label="Indicaria a imobiliária?" field="wouldRecommend" options={['Sim', 'Não']} />
          <SelectField label="Deseja indicar alguém?" field="hasIndication" options={['Sim', 'Não']} />
          {formData.hasIndication === 'Sim' && (
            <>
              <InputField label="Nome do Indicado" field="indicatedName" />
              <InputField label="Telefone do Indicado" field="indicatedPhone" />
            </>
          )}
        </Section>

        {/* OPORTUNIDADES FUTURAS */}
        <Section title="Oportunidades Futuras" icon={Star}>
          <SelectField label="Pretendência" field="futureIntent" options={['Comprar outro imóvel', 'Vender imóvel', 'Investir em imóveis', 'Não no momento']} />
          <div className="md:col-span-2">
            <InputField label="Observações de Futuro" field="futureObservations" />
          </div>
        </Section>

        {/* REGISTRO DE OCORRÊNCIAS */}
        <Section title="Registro de Ocorrências" icon={MessageCircle} fullWidth>
           <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Reclamações Registradas</label>
              <textarea 
                value={formData.complaints} 
                onChange={e => handleChange('complaints', e.target.value)} 
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10 h-24" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Solução Aplicada</label>
              <textarea 
                value={formData.appliedSolution} 
                onChange={e => handleChange('appliedSolution', e.target.value)} 
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10 h-24" 
              />
            </div>
            <SelectField label="Status da Ocorrência" field="occurrenceStatus" options={['Resolvido', 'Em andamento']} />
          </div>
        </Section>
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
        title="Ficha de Pós-Venda"
      />
    </div>
  );
}
