import React, { useState } from 'react';
import { ArrowLeft, User, Briefcase, Download, FileText, CheckCircle, ShieldCheck, DollarSign, ListChecks, Building2 } from 'lucide-react';
import { generateCreditAnalysisPDF } from '../lib/pdfGenerator';
import { ConfirmPDFDownloadModal } from './ConfirmPDFDownloadModal';
import { PDFPreviewModal } from './PDFPreviewModal';

interface Props {
  onBack: () => void;
  initialData?: any | 'blank' | null;
}

export function FichaAnaliseCredito({ onBack, initialData }: Props) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUri, setPreviewUri] = useState('');

  const [formData, setFormData] = useState<any>({
// ... rest of state
    name: '',
    cpf: '',
    rg: '',
    birthDate: '',
    maritalStatus: '',
    phone: '',
    email: '',
    currentAddress: '',
    residenceTime: '',
    profession: '',
    company: '',
    cnpj: '',
    companyAddress: '',
    companyPhone: '',
    bondTime: '',
    bondType: '',
    mainIncome: '',
    otherIncomes: '',
    totalIncome: '',
    incomeCommitment: '',
    propertyAddress: '',
    rentValue: '',
    totalCharges: '',
    guaranteeType: 'fiador',
    guaranteeDescription: '',
    guarantorName: '',
    guarantorCpf: '',
    guarantorProfession: '',
    guarantorIncome: '',
    guarantorAddress: '',
    guarantorHasProperty: 'no',
    authorizeConsult: 'yes',
    analysisResult: '',
    hasRestrictions: 'no',
    creditScore: '',
    docsPresented: [],
    finalResult: 'approved',
    internalObs: ''
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDocToggle = (docId: string) => {
    setFormData(prev => ({
      ...prev,
      docsPresented: prev.docsPresented.includes(docId)
        ? prev.docsPresented.filter(id => id !== docId)
        : [...prev.docsPresented, docId]
    }));
  };

  const handleGeneratePDF = () => {
    generateCreditAnalysisPDF(formData);
    setIsConfirmOpen(false);
  };

  const handleReviewPDF = () => {
    const uri = generateCreditAnalysisPDF(formData, { returnUri: true }) as string;
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
              Análise de Crédito <span className="text-gray-400 font-medium text-sm ml-2">(Locação)</span>
            </h2>
            <p className="text-sm text-gray-500 font-medium">Ficha técnica para avaliação de risco e capacidade financeira do locatário.</p>
          </div>
        </div>
        <button
          onClick={() => setIsConfirmOpen(true)}
          className="px-6 py-3 bg-[#617964] text-white rounded-xl text-sm font-black shadow-lg shadow-[#617964]/20 hover:scale-[1.02] flex items-center gap-2 uppercase tracking-widest transition-all"
        >
          <Download className="w-4 h-4" /> Gerar PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ... */}
        {/* DADOS DO PRETENDENTE */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-sm font-black text-[#617964] flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
            <User className="w-4 h-4" /> Dados do Pretendente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">Nome Completo</label>
              <input type="text" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">CPF</label>
              <input type="text" value={formData.cpf} onChange={(e) => handleChange('cpf', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">RG</label>
              <input type="text" value={formData.rg} onChange={(e) => handleChange('rg', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">Nascimento</label>
              <input type="text" value={formData.birthDate} onChange={(e) => handleChange('birthDate', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" placeholder="DD/MM/AAAA" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">Estado Civil</label>
              <input type="text" value={formData.maritalStatus} onChange={(e) => handleChange('maritalStatus', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
          </div>
        </div>

        {/* DADOS PROFISSIONAIS */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-sm font-black text-[#617964] flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
            <Briefcase className="w-4 h-4" /> Dados Profissionais
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">Profissão</label>
              <input type="text" value={formData.profession} onChange={(e) => handleChange('profession', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">Empresa</label>
              <input type="text" value={formData.company} onChange={(e) => handleChange('company', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">CNPJ (Opcional)</label>
              <input type="text" value={formData.cnpj} onChange={(e) => handleChange('cnpj', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">Vínculo</label>
              <input type="text" value={formData.bondType} onChange={(e) => handleChange('bondType', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" placeholder="Ex: CLT, Autônomo..." />
            </div>
          </div>
        </div>

        {/* RENDA E IMÓVEL */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 space-y-6 lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-black text-[#617964] flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
                <DollarSign className="w-4 h-4" /> Renda e Capacidade
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Renda Mensal (R$)</label>
                  <input type="text" value={formData.mainIncome} onChange={(e) => handleChange('mainIncome', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#617964]/20 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Comprometimento (%)</label>
                  <input type="text" value={formData.incomeCommitment} onChange={(e) => handleChange('incomeCommitment', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Outras Rendas / Especificar</label>
                  <input type="text" value={formData.otherIncomes} onChange={(e) => handleChange('otherIncomes', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black text-[#617964] flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
                <Building2 className="w-4 h-4" /> Imóvel Pretendido
              </h3>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase">Valor do Aluguel (R$)</label>
                <input type="text" value={formData.rentValue} onChange={(e) => handleChange('rentValue', e.target.value)} className="w-full bg-emerald-50 border border-emerald-100 rounded-xl py-2.5 px-4 text-sm font-bold text-emerald-700 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase">Total c/ Encargos (R$)</label>
                <input type="text" value={formData.totalCharges} onChange={(e) => handleChange('totalCharges', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
              </div>
            </div>
          </div>
        </div>

        {/* GARANTIA */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-sm font-black text-[#617964] flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
            <ShieldCheck className="w-4 h-4" /> Modalidade de Garantia
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'fiador', label: 'Fiador' },
                { id: 'seguro', label: 'Seguro Fiança' },
                { id: 'caucao', label: 'Caução' },
                { id: 'titulo', label: 'Título Cap.' }
              ].map(opt => (
                <label key={opt.id} className="flex items-center justify-center p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer transition-all hover:bg-white hover:border-[#617964] group has-[:checked]:bg-[#617964]/5 has-[:checked]:border-[#617964]">
                  <input type="radio" value={opt.id} checked={formData.guaranteeType === opt.id} onChange={(e) => handleChange('guaranteeType', e.target.value)} className="hidden" />
                  <span className="text-xs font-bold text-gray-600 group-has-[:checked]:text-[#617964]">{opt.label}</span>
                </label>
              ))}
            </div>
            <textarea value={formData.guaranteeDescription} onChange={(e) => handleChange('guaranteeDescription', e.target.value)} rows={2} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none resize-none" placeholder="Detalhes da garantia..." />
          </div>
        </div>

        {/* DOCUMENTAÇÃO CHECKLIST */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-sm font-black text-[#617964] flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
            <ListChecks className="w-4 h-4" /> Documentos Apresentados
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'id', label: 'RG e CPF' },
              { id: 'income', label: 'Renda' },
              { id: 'address', label: 'Residência' },
              { id: 'ir', label: 'I.R.' },
              { id: 'work', label: 'CTPS/Social' },
              { id: 'guarantor', label: 'Docs Fiador' }
            ].map(doc => (
              <label key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer transition-all hover:bg-white group has-[:checked]:bg-blue-50 has-[:checked]:border-blue-200">
                <input type="checkbox" checked={formData.docsPresented.includes(doc.id)} onChange={() => handleDocToggle(doc.id)} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300" />
                <span className="text-xs font-bold text-gray-600 group-has-[:checked]:text-blue-700">{doc.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* PARECER FINAL */}
        <div className="bg-gray-900 rounded-[24px] p-8 space-y-6 lg:col-span-2 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-lg font-black uppercase tracking-widest text-[#617964]">Parecer Final</h3>
              <p className="text-xs text-gray-400 font-medium">Decisão estratégica da análise de crédito.</p>
            </div>
            <div className="flex gap-4">
              {[
                { id: 'approved', label: 'Aprovado', color: 'bg-emerald-500' },
                { id: 'restricted', label: 'Aprovado c/ Restrições', color: 'bg-amber-500' },
                { id: 'denied', label: 'Reprovado', color: 'bg-rose-500' }
              ].map(res => (
                <label key={res.id} className={`flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer border transition-all ${formData.finalResult === res.id ? 'border-white bg-white/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                  <input type="radio" value={res.id} checked={formData.finalResult === res.id} onChange={(e) => handleChange('finalResult', e.target.value)} className="hidden" />
                  <div className={`w-2 h-2 rounded-full ${res.color} ${formData.finalResult === res.id ? 'animate-pulse' : ''}`} />
                  <span className="text-[10px] font-black uppercase tracking-wider">{res.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase">Observações Internas (Não aparecem no PDF principal)</label>
            <textarea value={formData.internalObs} onChange={(e) => handleChange('internalObs', e.target.value)} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:ring-2 focus:ring-[#617964]/50 outline-none resize-none" placeholder="Detalhamento técnico da análise..." />
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
        title="Análise de Crédito"
      />
    </div>
  );
}
