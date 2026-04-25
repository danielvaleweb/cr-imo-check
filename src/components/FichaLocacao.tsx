import React, { useState } from 'react';
import { ArrowLeft, User, Building2, Download, FileText, CheckCircle, ShieldCheck, DollarSign, Calendar, MapPin, Briefcase } from 'lucide-react';
import { generateRentalFichaPDF } from '../lib/pdfGenerator';
import { ConfirmPDFDownloadModal } from './ConfirmPDFDownloadModal';
import { PDFPreviewModal } from './PDFPreviewModal';

interface Props {
  onBack: () => void;
  initialData?: any;
}

export function FichaLocacao({ onBack, initialData }: Props) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUri, setPreviewUri] = useState('');

  const [formData, setFormData] = useState<any>({
    // Locatário
    tenantName: '',
    tenantCpf: '',
    tenantRg: '',
    tenantBirthDate: '',
    tenantCivilStatus: '',
    tenantProfession: '',
    tenantPhone: '',
    tenantEmail: '',
    tenantAddress: '',
    tenantResidencyTime: '',
    // Imóvel
    propertyAddress: '',
    propertyType: '',
    propertyPurpose: 'Residencial',
    rentAmount: '',
    chargesAmount: '',
    totalAmount: '',
    startDate: '',
    contractTerm: '',
    endDate: '',
    // Pagamento
    paymentMethod: 'Pix',
    dueDate: '',
    // Garantia
    guaranteeType: 'Caução',
    guaranteeDescription: '',
    // Fiador
    guarantorName: '',
    guarantorCpf: '',
    guarantorRg: '',
    guarantorProfession: '',
    guarantorIncome: '',
    guarantorAddress: '',
    guarantorPhone: '',
    // Meta
    city: 'Curitiba',
    date: new Date().toLocaleDateString('pt-BR')
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGeneratePDF = () => {
    generateRentalFichaPDF(formData);
    setIsConfirmOpen(false);
  };

  const handleReviewPDF = () => {
    const uri = generateRentalFichaPDF(formData, { returnUri: true }) as string;
    setPreviewUri(uri);
    setIsConfirmOpen(false);
    setIsPreviewOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 hover:bg-gray-100 rounded-2xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Ficha de Locação</h2>
            <p className="text-gray-500 font-medium">Residencial / Comercial</p>
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
        {/* DADOS DO LOCATÁRIO */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-sm font-black text-[#617964] flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
            <User className="w-4 h-4" /> Dados do Locatário
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Nome Completo</label>
              <input type="text" value={formData.tenantName} onChange={e => handleChange('tenantName', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">CPF</label>
              <input type="text" value={formData.tenantCpf} onChange={e => handleChange('tenantCpf', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">RG</label>
              <input type="text" value={formData.tenantRg} onChange={e => handleChange('tenantRg', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Data de Nasc.</label>
              <input type="date" value={formData.tenantBirthDate} onChange={e => handleChange('tenantBirthDate', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Estado Civil</label>
              <input type="text" value={formData.tenantCivilStatus} onChange={e => handleChange('tenantCivilStatus', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Profissão</label>
              <input type="text" value={formData.tenantProfession} onChange={e => handleChange('tenantProfession', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Telefone</label>
              <input type="text" value={formData.tenantPhone} onChange={e => handleChange('tenantPhone', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">E-mail</label>
              <input type="email" value={formData.tenantEmail} onChange={e => handleChange('tenantEmail', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Endereço Atual</label>
              <input type="text" value={formData.tenantAddress} onChange={e => handleChange('tenantAddress', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Tempo de Residência</label>
              <input type="text" value={formData.tenantResidencyTime} onChange={e => handleChange('tenantResidencyTime', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10" />
            </div>
          </div>
        </div>

        {/* DADOS DO IMÓVEL */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-sm font-black text-[#617964] flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
            <Building2 className="w-4 h-4" /> Dados do Imóvel Locado
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Endereço do Imóvel</label>
              <input type="text" value={formData.propertyAddress} onChange={e => handleChange('propertyAddress', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Tipo (Ex: Casa/Apto)</label>
              <input type="text" value={formData.propertyType} onChange={e => handleChange('propertyType', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Finalidade</label>
              <select value={formData.propertyPurpose} onChange={e => handleChange('propertyPurpose', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white">
                <option value="Residencial">Residencial</option>
                <option value="Comercial">Comercial</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Aluguel (R$)</label>
              <input type="text" value={formData.rentAmount} onChange={e => handleChange('rentAmount', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Encargos (R$)</label>
              <input type="text" value={formData.chargesAmount} onChange={e => handleChange('chargesAmount', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Total Mensal (R$)</label>
              <input type="text" value={formData.totalAmount} onChange={e => handleChange('totalAmount', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Início Locação</label>
              <input type="date" value={formData.startDate} onChange={e => handleChange('startDate', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Prazo (Meses)</label>
              <input type="text" value={formData.contractTerm} onChange={e => handleChange('contractTerm', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Término Previsto</label>
              <input type="date" value={formData.endDate} onChange={e => handleChange('endDate', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10" />
            </div>
          </div>
        </div>

        {/* FORMA DE PAGAMENTO E GARANTIA */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-sm font-black text-[#617964] flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
            <DollarSign className="w-4 h-4" /> Pagamento e Garantia
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Forma de Pagamento</label>
              <select value={formData.paymentMethod} onChange={e => handleChange('paymentMethod', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white">
                <option value="Boleto">Boleto</option>
                <option value="Pix">Pix</option>
                <option value="Transferência">Transferência</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Vencimento (Dia)</label>
              <input type="text" value={formData.dueDate} onChange={e => handleChange('dueDate', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Tipo de Garantia</label>
              <select value={formData.guaranteeType} onChange={e => handleChange('guaranteeType', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white">
                <option value="Fiador">Fiador</option>
                <option value="Seguro Fiança">Seguro Fiança</option>
                <option value="Caução">Caução</option>
                <option value="Título de Capitalização">Título de Capitalização</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Descrição da Garantia</label>
              <textarea value={formData.guaranteeDescription} onChange={e => handleChange('guaranteeDescription', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10 h-24 resize-none" />
            </div>
          </div>
        </div>

        {/* FIADOR */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-sm font-black text-[#617964] flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
            <ShieldCheck className="w-4 h-4" /> Dados do Fiador (se houver)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Nome do Fiador</label>
              <input type="text" value={formData.guarantorName} onChange={e => handleChange('guarantorName', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">CPF</label>
              <input type="text" value={formData.guarantorCpf} onChange={e => handleChange('guarantorCpf', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">RG</label>
              <input type="text" value={formData.guarantorRg} onChange={e => handleChange('guarantorRg', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Profissão</label>
              <input type="text" value={formData.guarantorProfession} onChange={e => handleChange('guarantorProfession', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Renda Mensal (R$)</label>
              <input type="text" value={formData.guarantorIncome} onChange={e => handleChange('guarantorIncome', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Endereço</label>
              <input type="text" value={formData.guarantorAddress} onChange={e => handleChange('guarantorAddress', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Telefone</label>
              <input type="text" value={formData.guarantorPhone} onChange={e => handleChange('guarantorPhone', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10" />
            </div>
          </div>
        </div>

        {/* LOCAL E DATA */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 space-y-6 lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Foro da Comarca</label>
                <input type="text" value={formData.city} onChange={e => handleChange('city', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10" />
             </div>
             <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Data</label>
                <input type="text" value={formData.date} onChange={e => handleChange('date', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10" />
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
        title="Ficha de Locação"
      />
    </div>
  );
}
