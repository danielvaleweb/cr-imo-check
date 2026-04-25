import React, { useState } from 'react';
import { ArrowLeft, User, Home, Download, FileText, CheckCircle, ShieldCheck } from 'lucide-react';
import { generateVisitFichaPDF } from '../lib/pdfGenerator';
import { ConfirmPDFDownloadModal } from './ConfirmPDFDownloadModal';
import { PDFPreviewModal } from './PDFPreviewModal';

interface Props {
  onBack: () => void;
  initialData?: any | 'blank' | null;
}

export function FichaVisita({ onBack, initialData }: Props) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUri, setPreviewUri] = useState('');

  const [formData, setFormData] = useState<any>({
    date: new Date().toLocaleDateString('pt-BR'),
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    propertyAddress: '',
    propertyCode: '',
    visitorName: '',
    visitorCpf: '',
    visitorRg: '',
    visitorPhone: '',
    visitorWhatsapp: '',
    visitorEmail: '',
    liked: '',
    interest: '',
    positivePoints: '',
    negativePoints: ''
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGeneratePDF = () => {
    generateVisitFichaPDF(formData);
    setIsConfirmOpen(false);
  };

  const handleReviewPDF = () => {
    const uri = generateVisitFichaPDF(formData, { returnUri: true }) as string;
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
              Ficha de Visita <span className="text-gray-400 font-medium text-sm ml-2">(Com Proteção de Comissão)</span>
            </h2>
            <p className="text-sm text-gray-500 font-medium">Preencha os dados da visita e gere o termo em PDF.</p>
          </div>
        </div>
        <button
          onClick={() => setIsConfirmOpen(true)}
          className="px-6 py-3 bg-[#617964] text-white rounded-xl text-sm font-black shadow-lg shadow-[#617964]/20 hover:scale-[1.02] flex items-center gap-2 uppercase tracking-widest transition-all"
        >
          <Download className="w-4 h-4" /> Gerar PDF
        </button>
      </div>

      {/* ... existing form content ... */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* DADOS GERAIS E DO IMÓVEL */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 space-y-6">
          <div>
            <h3 className="text-sm font-black text-[#617964] flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
              <FileText className="w-4 h-4" /> Dados Gerais
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase">Data</label>
                <input type="text" value={formData.date} onChange={(e) => handleChange('date', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase">Hora</label>
                <input type="text" value={formData.time} onChange={(e) => handleChange('time', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
              </div>
            </div>
          </div>

          <div>
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
            </div>
          </div>
        </div>

        {/* DADOS DO VISITANTE */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-black text-[#617964] flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
            <User className="w-4 h-4" /> Dados do Visitante
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">Nome Completo</label>
              <input type="text" value={formData.visitorName} onChange={(e) => handleChange('visitorName', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">CPF</label>
              <input type="text" value={formData.visitorCpf} onChange={(e) => handleChange('visitorCpf', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">RG</label>
              <input type="text" value={formData.visitorRg} onChange={(e) => handleChange('visitorRg', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">Telefone</label>
              <input type="text" value={formData.visitorPhone} onChange={(e) => handleChange('visitorPhone', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">WhatsApp</label>
              <input type="text" value={formData.visitorWhatsapp} onChange={(e) => handleChange('visitorWhatsapp', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">E-mail</label>
              <input type="email" value={formData.visitorEmail} onChange={(e) => handleChange('visitorEmail', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
          </div>
        </div>

        {/* AVALIAÇÃO DO CLIENTE */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 space-y-6 lg:col-span-2">
          <h3 className="text-sm font-black text-[#617964] flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
            <CheckCircle className="w-4 h-4" /> Avaliação do Cliente
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase block mb-3">Gostou do Imóvel?</label>
                <div className="flex gap-4">
                  <label className="flex-1 flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer transition-all hover:bg-white hover:border-[#617964] group has-[:checked]:bg-[#617964]/5 has-[:checked]:border-[#617964]">
                    <input type="radio" name="liked" checked={formData.liked === 'yes'} onChange={() => handleChange('liked', 'yes')} className="hidden" />
                    <span className="text-sm font-bold text-gray-600 group-has-[:checked]:text-[#617964]">Sim</span>
                  </label>
                  <label className="flex-1 flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer transition-all hover:bg-white hover:border-rose-200 group has-[:checked]:bg-rose-50 has-[:checked]:border-rose-200">
                    <input type="radio" name="liked" checked={formData.liked === 'no'} onChange={() => handleChange('liked', 'no')} className="hidden" />
                    <span className="text-sm font-bold text-gray-600 group-has-[:checked]:text-rose-600">Não</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase block mb-3">Nível de Interesse</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'high', label: 'Alto', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                    { id: 'medium', label: 'Médio', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
                    { id: 'low', label: 'Baixo', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' }
                  ].map(lvl => (
                    <label key={lvl.id} className={`flex items-center justify-center p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer transition-all hover:bg-white group has-[:checked]:${lvl.bg} has-[:checked]:${lvl.border}`}>
                      <input type="radio" name="interest" checked={formData.interest === lvl.id} onChange={() => handleChange('interest', lvl.id)} className="hidden" />
                      <span className={`text-sm font-bold text-gray-600 group-has-[:checked]:${lvl.color}`}>{lvl.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase">Pontos Positivos</label>
                <textarea value={formData.positivePoints} onChange={(e) => handleChange('positivePoints', e.target.value)} rows={2} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none resize-none" placeholder="O que o cliente mais gostou..." />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase">Pontos Negativos</label>
                <textarea value={formData.negativePoints} onChange={(e) => handleChange('negativePoints', e.target.value)} rows={2} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none resize-none" placeholder="O que o cliente não gostou..." />
              </div>
            </div>
          </div>
        </div>

        {/* TERMO DE PROTEÇÃO */}
        <div className="bg-[#617964]/5 rounded-[24px] p-6 border border-[#617964]/10 lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-6 h-6 text-[#617964]" />
            <h3 className="text-base font-black text-gray-900 uppercase tracking-widest border-b border-[#617964]/10 pb-1">
              Termos da Visita & Proteção
            </h3>
          </div>
          <p className="text-xs text-gray-600 font-medium leading-relaxed italic">
            "Declaro que este imóvel me foi apresentado pela imobiliária/corretor responsável, e comprometo-me a não realizar negociação direta com o proprietário, terceiros ou qualquer outro intermediador sem a participação do corretor. Caso venha a adquirir, alugar ou realizar qualquer tipo de negociação... no prazo de 180 (cento e oitenta) dias, reconheço que será devida a comissão integral..."
          </p>
          <div className="mt-4 flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-[#617964] animate-pulse" />
             <span className="text-[10px] font-black text-[#617964] uppercase tracking-wider">Proteção de comissão garantida no documento gerado.</span>
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
        title="Ficha de Visita"
      />
    </div>
  );
}
