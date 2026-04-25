import React, { useState } from 'react';
import { ArrowLeft, User, Home, Download, FileText, CheckCircle, ShieldCheck, DollarSign, Calendar } from 'lucide-react';
import { generateProposalFichaPDF } from '../lib/pdfGenerator';

interface Props {
  onBack: () => void;
  initialData?: any | 'blank' | null;
}

export function FichaProposta({ onBack, initialData }: Props) {
  const [formData, setFormData] = useState<any>({
    proponentName: '',
    proponentCpf: '',
    proponentRg: '',
    proponentEmail: '',
    proponentPhone: '',
    proponentWhatsapp: '',
    propertyAddress: '',
    propertyCode: '',
    proposalType: 'venda',
    offeredValue: '',
    paymentMethod: 'cash',
    otherPayment: '',
    useFgts: 'no',
    hasPermuta: 'no',
    permutaDescription: '',
    entryValue: '',
    paymentTerm: '',
    bankName: '',
    validUntil: '',
    observations: '',
    currentDate: new Date().toLocaleDateString('pt-BR')
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGeneratePDF = () => {
    generateProposalFichaPDF(formData);
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
              Ficha de Proposta <span className="text-gray-400 font-medium text-sm ml-2">(Compra ou Locação)</span>
            </h2>
            <p className="text-sm text-gray-500 font-medium">Preencha os termos da oferta e gere o documento formal.</p>
          </div>
        </div>
        <button
          onClick={handleGeneratePDF}
          className="px-6 py-3 bg-[#617964] text-white rounded-xl text-sm font-black shadow-lg shadow-[#617964]/20 hover:scale-[1.02] flex items-center gap-2 uppercase tracking-widest transition-all"
        >
          <Download className="w-4 h-4" /> Gerar PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">E-mail</label>
              <input type="email" value={formData.proponentEmail} onChange={(e) => handleChange('proponentEmail', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">Telefone</label>
              <input type="text" value={formData.proponentPhone} onChange={(e) => handleChange('proponentPhone', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">WhatsApp</label>
              <input type="text" value={formData.proponentWhatsapp} onChange={(e) => handleChange('proponentWhatsapp', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
          </div>
        </div>

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
              <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">Tipo de Proposta</label>
              <div className="flex gap-4">
                <label className="flex-1 flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer transition-all hover:bg-white hover:border-[#617964] group has-[:checked]:bg-[#617964]/5 has-[:checked]:border-[#617964]">
                  <input type="radio" name="proposalType" checked={formData.proposalType === 'venda'} onChange={() => handleChange('proposalType', 'venda')} className="hidden" />
                  <span className="text-sm font-bold text-gray-600 group-has-[:checked]:text-[#617964]">Venda</span>
                </label>
                <label className="flex-1 flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer transition-all hover:bg-white hover:border-blue-200 group has-[:checked]:bg-blue-50 has-[:checked]:border-blue-200">
                  <input type="radio" name="proposalType" checked={formData.proposalType === 'locacao'} onChange={() => handleChange('proposalType', 'locacao')} className="hidden" />
                  <span className="text-sm font-bold text-gray-600 group-has-[:checked]:text-blue-600">Locação</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* CONDIÇÕES DA PROPOSTA */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 space-y-6 lg:col-span-2">
          <h3 className="text-sm font-black text-[#617964] flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
            <DollarSign className="w-4 h-4" /> Condições da Proposta
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase">Valor Ofertado (R$)</label>
                <input type="text" value={formData.offeredValue} onChange={(e) => handleChange('offeredValue', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#617964]/20 outline-none" placeholder="0,00" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase">Forma de Pagamento</label>
                <select value={formData.paymentMethod} onChange={(e) => handleChange('paymentMethod', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none">
                  <option value="cash">À vista</option>
                  <option value="bank">Financiamento bancário</option>
                  <option value="fgts">FGTS</option>
                  <option value="consortium">Consórcio</option>
                  <option value="other">Outro</option>
                </select>
              </div>
              {formData.paymentMethod === 'other' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Especifique</label>
                  <input type="text" value={formData.otherPayment} onChange={(e) => handleChange('otherPayment', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Utilizará FGTS?</label>
                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center justify-center p-2 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer text-xs font-bold group has-[:checked]:bg-[#617964]/10 has-[:checked]:border-[#617964] has-[:checked]:text-[#617964]">
                      <input type="radio" checked={formData.useFgts === 'yes'} onChange={() => handleChange('useFgts', 'yes')} className="hidden" /> Sim
                    </label>
                    <label className="flex-1 flex items-center justify-center p-2 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer text-xs font-bold group has-[:checked]:bg-gray-200 has-[:checked]:text-gray-700">
                      <input type="radio" checked={formData.useFgts === 'no'} onChange={() => handleChange('useFgts', 'no')} className="hidden" /> Não
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase">Oferece Permuta?</label>
                   <div className="flex gap-2">
                    <label className="flex-1 flex items-center justify-center p-2 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer text-xs font-bold group has-[:checked]:bg-blue-50 has-[:checked]:border-blue-300 has-[:checked]:text-blue-600">
                      <input type="radio" checked={formData.hasPermuta === 'yes'} onChange={() => handleChange('hasPermuta', 'yes')} className="hidden" /> Sim
                    </label>
                    <label className="flex-1 flex items-center justify-center p-2 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer text-xs font-bold group has-[:checked]:bg-gray-200 has-[:checked]:text-gray-700">
                      <input type="radio" checked={formData.hasPermuta === 'no'} onChange={() => handleChange('hasPermuta', 'no')} className="hidden" /> Não
                    </label>
                  </div>
                </div>
              </div>
              {formData.hasPermuta === 'yes' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Descreva a Permuta</label>
                  <textarea value={formData.permutaDescription} onChange={(e) => handleChange('permutaDescription', e.target.value)} rows={2} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none resize-none" placeholder="Imóveis, veículos, etc..." />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase">Valor de Entrada (R$)</label>
                <input type="text" value={formData.entryValue} onChange={(e) => handleChange('entryValue', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase">Prazo de Pagamento</label>
                <input type="text" value={formData.paymentTerm} onChange={(e) => handleChange('paymentTerm', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" placeholder="Ex: 360 meses" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase">Instituição Financeira</label>
                <input type="text" value={formData.bankName} onChange={(e) => handleChange('bankName', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" placeholder="Ex: Caixa Econômica, Itaú..." />
              </div>
            </div>
          </div>
        </div>

        {/* PRAZO E OBSERVAÇÕES */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 space-y-6 lg:col-span-2">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-sm font-black text-[#617964] flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
                  <Calendar className="w-4 h-4" /> Validade e Observações
                </h3>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Proposta Válida até</label>
                  <input type="text" value={formData.validUntil} onChange={(e) => handleChange('validUntil', e.target.value)} className="w-full bg-gray-100/50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm font-bold text-[#617964] focus:ring-2 focus:ring-[#617964]/20 outline-none" placeholder="DD/MM/AAAA" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Observações Extras</label>
                  <textarea value={formData.observations} onChange={(e) => handleChange('observations', e.target.value)} rows={3} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none resize-none" placeholder="Detalhes adicionais da proposta..." />
                </div>
              </div>

              <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-100">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="w-6 h-6 text-amber-600" />
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                    Aviso Legal
                  </h3>
                </div>
                <ul className="space-y-3">
                  {[
                    "Proposta com caráter formal e vinculativo.",
                    "Sujeita a aceitação por escrito do proprietário.",
                    "Intermediação exclusiva CR Imóveis de Luxo.",
                    "Válida apenas pelo prazo estabelecido."
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] font-bold text-amber-800 leading-tight">
                      <CheckCircle className="w-3 h-3 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
