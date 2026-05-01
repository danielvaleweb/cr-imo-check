import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Building, User, Signature, Download, ArrowLeft, FileSignature, CheckSquare, FileText } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { generateNonExclusivityPDF } from '../lib/pdfGenerator';
import { Property } from '../context/PropertyContext';
import { ConfirmPDFDownloadModal } from './ConfirmPDFDownloadModal';
import { PDFPreviewModal } from './PDFPreviewModal';

interface Props {
  onBack: () => void;
  initialProperty?: Property | 'blank' | null;
}

export function FichaCaptacaoSimples({ onBack, initialProperty }: Props) {
  const { publishedProperties: properties } = useProperties();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState<any>({});
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUri, setPreviewUri] = useState('');

  React.useEffect(() => {
// ...
    if (initialProperty === 'blank') {
      handleBlankFicha();
    } else if (initialProperty && typeof initialProperty !== 'string') {
      handleSelectProperty(initialProperty);
    }
  }, [initialProperty]);

  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.ownerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectProperty = (prop: Property) => {
    setSelectedProperty(prop);
    setFormData({
      ...prop,
      commissionPercentage: prop.commissionPercentage || '6',
      signatureDate: prop.signatureDate || new Date().toISOString().split('T')[0],
      witness1Name: prop.witness1Name || '',
      witness1Cpf: prop.witness1Cpf || '',
      witness1Rg: prop.witness1Rg || '',
      witness2Name: prop.witness2Name || '',
      witness2Cpf: prop.witness2Cpf || '',
      witness2Rg: prop.witness2Rg || '',
    });
    setSearchTerm('');
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGeneratePDF = () => {
    if (!selectedProperty) return;
    generateNonExclusivityPDF(formData);
    setIsConfirmOpen(false);
  };

  const handleReviewPDF = () => {
    if (!selectedProperty) return;
    const uri = generateNonExclusivityPDF(formData, { returnUri: true }) as string;
    setPreviewUri(uri);
    setIsConfirmOpen(false);
    setIsPreviewOpen(true);
  };

  const handleBlankFicha = () => {
// ...
    const blankProperty: any = {
       id: 'blank_' + Date.now(),
       title: 'Ficha Avulsa',
       code: 'AVULSO',
    };
    handleSelectProperty(blankProperty);
  };

  if (!selectedProperty) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-[#617964] hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-black text-gray-900">Captação Sem Exclusividade</h2>
              <p className="text-sm text-gray-500 font-medium">Selecione um imóvel no sistema para carregar os dados.</p>
            </div>
          </div>
        </div>

        <div className="relative max-w-2xl">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome do imóvel, código ou proprietário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#617964]/20 shadow-sm transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {searchTerm && filteredProperties.map(prop => (
            <div 
              key={prop.id}
              onClick={() => handleSelectProperty(prop)}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md cursor-pointer transition-all hover:border-[#617964]/30 group"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">CÓD: {prop.code || 'N/A'}</span>
                {prop.isExclusive ? <CheckSquare className="w-4 h-4 text-emerald-500" /> : <FileSignature className="w-4 h-4 text-blue-500" />}
              </div>
              <h4 className="font-bold text-gray-900 text-sm line-clamp-1 mb-1 group-hover:text-[#617964] transition-colors">{prop.title}</h4>
              <p className="text-xs text-gray-500 line-clamp-1 flex items-center gap-1"><User className="w-3 h-3" /> {prop.ownerName || 'Sem proprietário vinculado'}</p>
            </div>
          ))}
          {searchTerm && filteredProperties.length === 0 && (
             <div className="col-span-full py-12 text-center text-gray-400 font-medium bg-gray-50 rounded-2xl border border-dashed border-gray-200">
               Nenhum imóvel encontrado.
             </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-6 sticky top-0 bg-gray-50/80 backdrop-blur-md z-10 p-4 -mx-4 px-4 rounded-xl">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedProperty(null)} className="p-2 bg-white text-gray-400 rounded-xl hover:bg-gray-100 transition-colors shadow-sm border border-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              Revisar Dados: <span className="text-[#617964]">{selectedProperty.code}</span>
            </h2>
            <p className="text-sm text-gray-500 font-medium">Você pode alterar os campos abaixo antes de gerar o PDF.</p>
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
        
        {/* Proprietário Box */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-black text-[#617964] flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
            <User className="w-4 h-4" /> Dados do Proprietário
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">Nome Completo</label>
              <input type="text" value={formData.ownerName || ''} onChange={(e) => handleChange('ownerName', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">CPF</label>
              <input type="text" value={formData.ownerCpf || ''} onChange={(e) => handleChange('ownerCpf', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">RG</label>
              <input type="text" value={formData.ownerRg || ''} onChange={(e) => handleChange('ownerRg', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase">E-mail</label>
               <input type="email" value={formData.ownerEmail || ''} onChange={(e) => handleChange('ownerEmail', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
             <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase">WhatsApp</label>
               <input type="text" value={formData.ownerPhone || ''} onChange={(e) => handleChange('ownerPhone', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
             <div className="col-span-2 space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase">Endereço de Moradia</label>
               <input type="text" value={formData.ownerAddress || ''} onChange={(e) => handleChange('ownerAddress', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
          </div>
        </div>

        {/* Imóvel Box */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
           <h3 className="text-sm font-black text-[#617964] flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
            <Building className="w-4 h-4" /> Dados do Imóvel
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">Logradouro / Rua (Imóvel)</label>
              <input type="text" value={formData.propertyStreet || formData.location || ''} onChange={(e) => handleChange('propertyStreet', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">Matrícula Nº</label>
              <input type="text" value={formData.matricula || ''} onChange={(e) => handleChange('matricula', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
             <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">Inscrição IPTU</label>
              <input type="text" value={formData.inscricaoIptu || ''} onChange={(e) => handleChange('inscricaoIptu', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
             <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">Valor Venda (R$)</label>
              <input type="text" value={formData.vendaPrice || formData.price || ''} onChange={(e) => handleChange('vendaPrice', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
             <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">Área Construída</label>
              <input type="text" value={formData.area || ''} onChange={(e) => handleChange('area', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
          </div>
        </div>

        {/* Condições Exclusividade */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
           <h3 className="text-sm font-black text-[#617964] flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
            <CheckSquare className="w-4 h-4" /> Condições & Remuneração
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">Comissão (%)</label>
              <input type="number" value={formData.commissionPercentage} onChange={(e) => handleChange('commissionPercentage', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
            </div>
          </div>
        </div>

        {/* Testemunhas */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
           <h3 className="text-sm font-black text-[#617964] flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
            <Signature className="w-4 h-4" /> Testemunhas
          </h3>
          
          <div className="space-y-4">
             <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100/50">
               <h4 className="text-xs font-bold text-gray-500 mb-3">Testemunha 1</h4>
               <div className="grid grid-cols-2 gap-3">
                 <div className="col-span-2 space-y-1">
                    <input type="text" placeholder="Nome Completo" value={formData.witness1Name || ''} onChange={(e) => handleChange('witness1Name', e.target.value)} className="w-full bg-white border border-gray-100 rounded-lg py-1.5 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
                 </div>
                 <div className="space-y-1">
                    <input type="text" placeholder="CPF" value={formData.witness1Cpf || ''} onChange={(e) => handleChange('witness1Cpf', e.target.value)} className="w-full bg-white border border-gray-100 rounded-lg py-1.5 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
                 </div>
                 <div className="space-y-1">
                    <input type="text" placeholder="RG" value={formData.witness1Rg || ''} onChange={(e) => handleChange('witness1Rg', e.target.value)} className="w-full bg-white border border-gray-100 rounded-lg py-1.5 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
                 </div>
               </div>
             </div>

             <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100/50">
               <h4 className="text-xs font-bold text-gray-500 mb-3">Testemunha 2</h4>
               <div className="grid grid-cols-2 gap-3">
                 <div className="col-span-2 space-y-1">
                    <input type="text" placeholder="Nome Completo" value={formData.witness2Name || ''} onChange={(e) => handleChange('witness2Name', e.target.value)} className="w-full bg-white border border-gray-100 rounded-lg py-1.5 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
                 </div>
                 <div className="space-y-1">
                    <input type="text" placeholder="CPF" value={formData.witness2Cpf || ''} onChange={(e) => handleChange('witness2Cpf', e.target.value)} className="w-full bg-white border border-gray-100 rounded-lg py-1.5 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
                 </div>
                 <div className="space-y-1">
                    <input type="text" placeholder="RG" value={formData.witness2Rg || ''} onChange={(e) => handleChange('witness2Rg', e.target.value)} className="w-full bg-white border border-gray-100 rounded-lg py-1.5 px-3 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none" />
                 </div>
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
        title="Captação Simples"
      />
    </div>
  );
}
