import React, { useState } from 'react';
import { ArrowLeft, User, Home, Download, FileText, CheckCircle, ShieldCheck, DollarSign, Calendar, MapPin } from 'lucide-react';
import { generateReserveFichaPDF } from '../lib/pdfGenerator';
import { ConfirmPDFDownloadModal } from './ConfirmPDFDownloadModal';
import { PDFPreviewModal } from './PDFPreviewModal';

interface Props {
  onBack: () => void;
  initialData?: any | 'blank' | null;
}

export function FichaReserva({ onBack, initialData }: Props) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUri, setPreviewUri] = useState('');

  const [formData, setFormData] = useState<any>({
// ... (rest of the initial state)
    propertyAddress: '',
    propertyCode: '',
    propertyType: 'venda',
    proponentName: '',
    proponentCpf: '',
    proponentRg: '',
    proponentEmail: '',
    proponentPhone: '',
    ownerName: '',
    ownerDoc: '',
    proposalValue: '',
    signalValue: '',
    paymentMethod: 'pix',
    otherPayment: '',
    paymentDate: '',
    reserveUntil: '',
    cityForo: '',
    currentDate: new Date().toLocaleDateString('pt-BR')
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGeneratePDF = () => {
    generateReserveFichaPDF(formData);
    setIsConfirmOpen(false);
  };

  const handleReviewPDF = () => {
    const uri = generateReserveFichaPDF(formData, { returnUri: true }) as string;
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
              Ficha de Reserva <span className="text-gray-400 font-medium text-sm ml-2">(Com Sinal/Arras)</span>
            </h2>
            <p className="text-sm text-gray-500 font-medium">Gire o termo de reserva e garantia de exclusividade temporária.</p>
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
        {/* DADOS DO IMÓVEL */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-sm font-black text-[#617964] flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
            <Home className="w-4 h-4" /> Dados do Imóvel
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">Endereço Completo</label>
              <input type="text" value={formData.propertyAddress} onChange={(e) => handleChange('propertyAddress', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">Código</label>
              <input type="text" value={formData.propertyCode} onChange={(e) => handleChange('propertyCode', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
            <div className="md:col-span-3 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">Tipo de Negócio</label>
              <div className="flex gap-4">
                <label className="flex-1 flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer transition-all hover:bg-white hover:border-[#617964] group has-[:checked]:bg-[#617964]/5 has-[:checked]:border-[#617964]">
                  <input type="radio" name="propertyType" checked={formData.propertyType === 'venda'} onChange={() => handleChange('propertyType', 'venda')} className="hidden" />
                  <span className="text-sm font-bold text-gray-600 group-has-[:checked]:text-[#617964]">Venda</span>
                </label>
                <label className="flex-1 flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer transition-all hover:bg-white hover:border-blue-200 group has-[:checked]:bg-blue-50 has-[:checked]:border-blue-200">
                  <input type="radio" name="propertyType" checked={formData.propertyType === 'locacao'} onChange={() => handleChange('propertyType', 'locacao')} className="hidden" />
                  <span className="text-sm font-bold text-gray-600 group-has-[:checked]:text-blue-600">Locação</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* DADOS DO PROPONENTE */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-sm font-black text-[#617964] flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
            <User className="w-4 h-4" /> Dados do Proponente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">Nome Completo</label>
              <input type="text" value={formData.proponentName} onChange={(e) => handleChange('proponentName', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">CPF</label>
              <input type="text" value={formData.proponentCpf} onChange={(e) => handleChange('proponentCpf', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">RG</label>
              <input type="text" value={formData.proponentRg} onChange={(e) => handleChange('proponentRg', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">E-mail</label>
              <input type="email" value={formData.proponentEmail} onChange={(e) => handleChange('proponentEmail', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">Telefone</label>
              <input type="text" value={formData.proponentPhone} onChange={(e) => handleChange('proponentPhone', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
          </div>
        </div>

        {/* DADOS DO PROPRIETÁRIO */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-sm font-black text-[#617964] flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
            <ShieldCheck className="w-4 h-4" /> Dados do Proprietário
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">Nome Completo</label>
              <input type="text" value={formData.ownerName} onChange={(e) => handleChange('ownerName', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">CPF/CNPJ</label>
              <input type="text" value={formData.ownerDoc} onChange={(e) => handleChange('ownerDoc', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
          </div>
        </div>

        {/* VALOR E RESERVA */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-sm font-black text-[#617964] flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
            <DollarSign className="w-4 h-4" /> Valor e Reserva
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">Valor da Proposta (R$)</label>
              <input type="text" value={formData.proposalValue} onChange={(e) => handleChange('proposalValue', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#617964]/20 outline-none" placeholder="0,00" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">Valor do Sinal/Arras (R$)</label>
              <input type="text" value={formData.signalValue} onChange={(e) => handleChange('signalValue', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm font-bold text-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none" placeholder="0,00" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">Forma de Pagamento</label>
              <select value={formData.paymentMethod} onChange={(e) => handleChange('paymentMethod', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none">
                <option value="pix">Pix</option>
                <option value="transfer">Transferência</option>
                <option value="cash">Dinheiro</option>
                <option value="other">Outro</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">Data do Pagamento</label>
              <input type="text" value={formData.paymentDate} onChange={(e) => handleChange('paymentDate', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" placeholder="DD/MM/AAAA" />
            </div>
            {formData.paymentMethod === 'other' && (
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase">Especifique Forma</label>
                <input type="text" value={formData.otherPayment} onChange={(e) => handleChange('otherPayment', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
              </div>
            )}
          </div>
        </div>

        {/* PRAZO, FORO E CONDIÇÕES */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 space-y-6 lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-black text-[#617964] flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
                <Calendar className="w-4 h-4" /> Prazos e Foro
              </h3>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase">Reservado até</label>
                <input type="text" value={formData.reserveUntil} onChange={(e) => handleChange('reserveUntil', e.target.value)} className="w-full bg-gray-100/50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm font-bold text-[#617964] focus:ring-2 focus:ring-[#617964]/20 outline-none" placeholder="DD/MM/AAAA" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Foro da Comarca de
                </label>
                <input type="text" value={formData.cityForo} onChange={(e) => handleChange('cityForo', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" placeholder="Ex: Belo Horizonte / MG" />
              </div>
            </div>

            <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100">
               <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                    Regras das Arras
                  </h3>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] text-gray-600 font-bold uppercase leading-tight">
                    Conforme Artigos 417 a 420 do Código Civil:
                  </p>
                  {[
                    "Desistência do Proponente: Perda do sinal pago.",
                    "Desistência do Proprietário: Devolução em dobro.",
                    "Conclusão: Valor abatido do total do imóvel.",
                    "Impeditivos Jurídicos: Devolução simples acordada."
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] font-bold text-emerald-800">
                      <CheckCircle className="w-3 h-3 mt-0.5 shrink-0" />
                      {item}
                    </div>
                  ))}
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
        title="Ficha de Reserva"
      />
    </div>
  );
}
