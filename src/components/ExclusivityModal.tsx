import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, MapPin, FileSignature, Users, ShieldCheck, Download, Link as LinkIcon, Building } from 'lucide-react';

export function ExclusivityModal({ isOpen, onClose, data, onChange, generatePDF }: { isOpen: boolean, onClose: () => void, data: any, onChange: (d: any) => void, generatePDF: (d: any) => void }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex flex-col items-center justify-start p-4 bg-gray-900/40 backdrop-blur-sm sm:p-6 sm:justify-center overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden my-auto border border-gray-100"
          style={{ maxHeight: 'calc(100vh - 4rem)' }}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Ficha de Curadoria Exclusiva</h2>
                <p className="text-sm font-bold text-gray-500">Preencha as condições e gerar PDF</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all group"
            >
              <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">

            {/* Property Address Synced */}
            <div className="space-y-6">
              <h3 className="text-sm font-black text-[#617964] flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-2">
                <Building className="w-4 h-4" /> Endereço do Imóvel (Sincronizado)
              </h3>
              <p className="text-xs text-gray-500 font-medium">Estes dados são preenchidos na etapa 1 e refletirão no contrato.</p>
              
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50 pb-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-1">CEP</label>
                      <input type="text" readOnly value={data.propertyCep || ''} className="w-full bg-transparent border-none py-1 px-4 text-sm outline-none font-medium text-gray-600 pointer-events-none" />
                    </div>
                     <div className="space-y-2 lg:col-span-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Logradouro / Rua</label>
                      <input type="text" readOnly value={data.propertyStreet || ''} className="w-full bg-transparent border-none py-1 px-4 text-sm outline-none font-medium text-gray-600 pointer-events-none" />
                    </div>
                     <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Número</label>
                      <input type="text" readOnly value={data.propertyNumber || ''} className="w-full bg-transparent border-none py-1 px-4 text-sm outline-none font-medium text-gray-600 pointer-events-none" />
                    </div>
                     <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Complemento</label>
                      <input type="text" readOnly value={data.propertyComplement || ''} className="w-full bg-transparent border-none py-1 px-4 text-sm outline-none font-medium text-gray-600 pointer-events-none" />
                    </div>
                     <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Bairro</label>
                      <input type="text" readOnly value={data.propertyNeighborhood || ''} className="w-full bg-transparent border-none py-1 px-4 text-sm outline-none font-medium text-gray-600 pointer-events-none" />
                    </div>
                     <div className="space-y-2 lg:col-span-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Cidade</label>
                      <input type="text" readOnly value={data.propertyCity || ''} className="w-full bg-transparent border-none py-1 px-4 text-sm outline-none font-medium text-gray-600 pointer-events-none" />
                    </div>
                     <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Estado (UF)</label>
                      <input type="text" readOnly value={data.propertyState || ''} className="w-full bg-transparent border-none py-1 px-4 text-sm outline-none font-medium text-gray-600 pointer-events-none" />
                    </div>
                 </div>
            </div>

            {/* Contract Conditions */}
            <div className="space-y-6">
              <h3 className="text-sm font-black text-[#617964] flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-2">
                <FileSignature className="w-4 h-4" /> Condições da Exclusividade
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Prazo Exclusividade (Dias)</label>
                  <input type="number" value={data.exclusivityDays || ''} onChange={e => onChange({...data, exclusivityDays: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Prorrogação (Dias)</label>
                  <input type="number" value={data.duringDays || ''} onChange={e => onChange({...data, duringDays: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all" />
                </div>
                 <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Comissão (%)</label>
                  <input type="number" value={data.commissionPercentage || ''} onChange={e => onChange({...data, commissionPercentage: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all" />
                </div>
              </div>
            </div>


            {/* Signatures and Witnesses */}
            <div className="space-y-6">
              <h3 className="text-sm font-black text-[#617964] flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-2">
                <Users className="w-4 h-4" /> Assinaturas & Testemunhas
              </h3>

               <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                      <LinkIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-blue-900 mb-1">Assinatura Digital via GOV.BR</h4>
                      <p className="text-xs text-blue-700/80 mb-3">Recomendamos a assinatura do contrato pelo portal GOV.BR por ser gratuito e ter validade jurídica.</p>
                      <button 
                        type="button"
                        onClick={() => alert('Em desenvolvimento')}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-sm"
                      >
                        Acessar Portal de Assinatura <LinkIcon className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
               </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-4 p-4 border border-gray-100 rounded-2xl">
                    <h4 className="text-xs font-black text-gray-600 uppercase">Testemunha 1</h4>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 ml-1">NOME COMPLETO</label>
                      <input type="text" value={data.witness1Name || ''} onChange={e => onChange({...data, witness1Name: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl py-2.5 px-4 text-sm focus:ring-2 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 ml-1">CPF</label>
                      <input type="text" value={data.witness1Cpf || ''} onChange={e => onChange({...data, witness1Cpf: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl py-2.5 px-4 text-sm focus:ring-2 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 ml-1">RG</label>
                      <input type="text" value={data.witness1Rg || ''} onChange={e => onChange({...data, witness1Rg: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl py-2.5 px-4 text-sm focus:ring-2 outline-none" />
                    </div>
                 </div>

                 <div className="space-y-4 p-4 border border-gray-100 rounded-2xl">
                    <h4 className="text-xs font-black text-gray-600 uppercase">Testemunha 2</h4>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 ml-1">NOME COMPLETO</label>
                      <input type="text" value={data.witness2Name || ''} onChange={e => onChange({...data, witness2Name: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl py-2.5 px-4 text-sm focus:ring-2 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 ml-1">CPF</label>
                      <input type="text" value={data.witness2Cpf || ''} onChange={e => onChange({...data, witness2Cpf: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl py-2.5 px-4 text-sm focus:ring-2 outline-none" />
                    </div>
                     <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 ml-1">RG</label>
                      <input type="text" value={data.witness2Rg || ''} onChange={e => onChange({...data, witness2Rg: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl py-2.5 px-4 text-sm focus:ring-2 outline-none" />
                    </div>
                 </div>
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-4 items-center justify-between sticky bottom-0 z-10">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-4 bg-white border border-gray-200 text-gray-500 rounded-2xl font-bold hover:bg-gray-50 hover:text-gray-900 transition-all text-sm"
            >
              Concluir e Voltar
            </button>
            <button
              onClick={() => generatePDF(data)}
              className="w-full sm:w-auto px-8 py-4 bg-amber-500 text-white rounded-2xl text-sm font-black shadow-lg shadow-amber-500/20 hover:scale-[1.02] flex items-center justify-center gap-3 uppercase tracking-widest transition-all"
            >
              <Download className="w-5 h-5" /> Baixar ficha em PDF
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
