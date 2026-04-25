import React, { useState } from 'react';
import { ArrowLeft, Scale, Download, FileCheck, ShieldCheck, Building, User, MapPin, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { generateLegalDocPDF } from '../lib/pdfGenerator';
import { ConfirmPDFDownloadModal } from './ConfirmPDFDownloadModal';
import { PDFPreviewModal } from './PDFPreviewModal';

interface Props {
  onBack: () => void;
  initialData?: any;
}

export function FichaDocumentacaoJuridica({ onBack, initialData }: Props) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUri, setPreviewUri] = useState('');

  const [formData, setFormData] = useState<any>({
    // DADOS DO IMÓVEL
    address: '',
    propertyType: '',
    purpose: 'Venda',
    registrationNumber: '',
    registryOffice: '',
    iptuNumber: '',
    
    // DADOS DO PROPRIETÁRIO
    ownerName: '',
    ownerCpfCnpj: '',
    civilStatus: '',
    assetsRegime: '',
    phone: '',
    email: '',
    
    // DOCUMENTAÇÃO DO IMÓVEL
    registrationUpdated: 'Pendente',
    lienCert: 'Pendente',
    fullContentCert: 'Pendente',
    habitese: 'Pendente',
    approvedPlan: 'Pendente',
    constructionRegistration: 'Pendente',
    areaRegularity: 'Pendente',
    
    // TRIBUTOS E ENCARGOS
    iptuPaid: 'Não',
    municipalDebtsCert: 'Pendente',
    condoPaid: 'Não se aplica',
    additionalTaxes: 'Pendente',
    
    // CERTIDÕES PF
    federalDebtsCertPF: 'Pendente',
    stateCertPF: 'Pendente',
    municipalCertPF: 'Pendente',
    civilActionsCertPF: 'Pendente',
    laborActionsCertPF: 'Pendente',
    protestsCertPF: 'Pendente',
    federalJusticeCertPF: 'Pendente',
    laborJusticeCertPF: 'Pendente',
    
    // CERTIDÕES PJ (Muitas vezes opcional, mas incluído conforme pedido)
    socialContractPJ: 'Pendente',
    cnpjActivePJ: 'Pendente',
    federalCertPJ: 'Pendente',
    stateCertPJ: 'Pendente',
    municipalCertPJ: 'Pendente',
    laborCertPJ: 'Pendente',
    bankruptcyCertPJ: 'Pendente',
    
    // SITUAÇÃO JURÍDICA
    freeAndClear: 'Sim',
    activeFinancing: 'Não',
    fiduciaryAlienation: 'Não',
    mortgage: 'Não',
    seizure: 'Não',
    usufruct: 'Não',
    inventory: 'Não',
    divorcePending: 'Não',
    otherRestrictions: '',
    
    // CONFORMIDADE
    zoningRegular: 'Sim',
    riskArea: 'Não',
    cityHallRegularity: 'Pendente',
    
    // ANÁLISE
    identifiedIssues: '',
    requiredActions: '',
    finalStatus: 'Não apto para comercialização',
    observations: '',
    
    // ASSINATURAS E DATA
    inspectorName: '',
    realEstateAgency: 'CR IMÓVEIS DE LUXO',
    date: new Date().toLocaleDateString('pt-BR')
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGeneratePDF = () => {
    generateLegalDocPDF(formData);
    setIsConfirmOpen(false);
  };

  const handleReviewPDF = () => {
    const uri = generateLegalDocPDF(formData, { returnUri: true }) as string;
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
        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10" 
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
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Ficha de Documentação Jurídica</h2>
            <p className="text-gray-500 font-medium tracking-tight">Controle de certidões e conformidade legal</p>
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
        {/* DADOS DO IMÓVEL */}
        <Section title="Dados do Imóvel" icon={Building}>
          <InputField label="Endereço" field="address" />
          <InputField label="Tipo" field="propertyType" />
          <SelectField label="Finalidade" field="purpose" options={['Venda', 'Locação']} />
          <InputField label="Matrícula nº" field="registrationNumber" />
          <div className="md:col-span-2">
            <InputField label="Cartório de Registro de Imóveis" field="registryOffice" />
          </div>
          <InputField label="Inscrição IPTU" field="iptuNumber" />
        </Section>

        {/* DADOS DO PROPRIETÁRIO */}
        <Section title="Dados do Proprietário" icon={User}>
          <InputField label="Nome" field="ownerName" />
          <InputField label="CPF/CNPJ" field="ownerCpfCnpj" />
          <InputField label="Estado Civil" field="civilStatus" />
          <InputField label="Regime de Bens" field="assetsRegime" />
          <InputField label="Telefone" field="phone" />
          <InputField label="E-mail" field="email" />
        </Section>

        {/* DOCUMENTAÇÃO DO IMÓVEL */}
        <Section title="Documentação do Imóvel" icon={FileCheck}>
          <SelectField label="Matrícula Atualizada" field="registrationUpdated" options={['OK', 'Pendente']} />
          <SelectField label="Certidão de Ônus Reais" field="lienCert" options={['OK', 'Pendente']} />
          <SelectField label="Certidão de Inteiro Teor" field="fullContentCert" options={['OK', 'Pendente']} />
          <SelectField label="Habite-se" field="habitese" options={['OK', 'Pendente', 'Não se aplica']} />
          <SelectField label="Planta Aprovada" field="approvedPlan" options={['OK', 'Pendente']} />
          <SelectField label="Averbação da Construção" field="constructionRegistration" options={['OK', 'Pendente']} />
          <SelectField label="Regularidade Área Construída" field="areaRegularity" options={['OK', 'Pendente']} />
        </Section>

        {/* TRIBUTOS E ENCARGOS */}
        <Section title="Tributos e Encargos" icon={Scale}>
          <SelectField label="IPTU Quitado" field="iptuPaid" options={['Sim', 'Não']} />
          <SelectField label="CND Municipais" field="municipalDebtsCert" options={['OK', 'Pendente']} />
          <SelectField label="Condomínio Quitado" field="condoPaid" options={['Sim', 'Não', 'Não se aplica']} />
          <SelectField label="Taxas Adicionais" field="additionalTaxes" options={['OK', 'Pendente']} />
        </Section>

        {/* CERTIDÕES PESSOA FÍSICA */}
        <Section title="Certidões Proprietário (PF)" icon={ShieldCheck}>
          <SelectField label="Débitos Federais" field="federalDebtsCertPF" options={['OK', 'Pendente']} />
          <SelectField label="Certidão Estadual" field="stateCertPF" options={['OK', 'Pendente']} />
          <SelectField label="Certidão Municipal" field="municipalCertPF" options={['OK', 'Pendente']} />
          <SelectField label="Ações Cíveis" field="civilActionsCertPF" options={['OK', 'Pendente']} />
          <SelectField label="Ações Trabalhistas" field="laborActionsCertPF" options={['OK', 'Pendente']} />
          <SelectField label="Protestos" field="protestsCertPF" options={['OK', 'Pendente']} />
          <SelectField label="Justiça Federal" field="federalJusticeCertPF" options={['OK', 'Pendente']} />
          <SelectField label="Justiça do Trabalho" field="laborJusticeCertPF" options={['OK', 'Pendente']} />
        </Section>

        {/* SITUAÇÃO JURÍDICA */}
        <Section title="Situação Jurídica do Imóvel" icon={AlertTriangle}>
          <SelectField label="Livre e Desembaraçado" field="freeAndClear" options={['Sim', 'Não']} />
          <SelectField label="Financiamento Ativo" field="activeFinancing" options={['Sim', 'Não']} />
          <SelectField label="Alienação Fiduciária" field="fiduciaryAlienation" options={['Sim', 'Não']} />
          <SelectField label="Hipoteca" field="mortgage" options={['Sim', 'Não']} />
          <SelectField label="Penhora" field="seizure" options={['Sim', 'Não']} />
          <SelectField label="Usufruto" field="usufruct" options={['Sim', 'Não']} />
          <SelectField label="Inventário" field="inventory" options={['Sim', 'Não']} />
          <SelectField label="Divórcio/Partilha" field="divorcePending" options={['Sim', 'Não']} />
          <div className="md:col-span-2">
            <InputField label="Outras Restrições" field="otherRestrictions" />
          </div>
        </Section>

        {/* ANÁLISE E PARECER */}
        <Section title="Análise e Parecer Final" icon={FileCheck} fullWidth>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Pendências Identificadas</label>
              <textarea 
                value={formData.identifiedIssues} 
                onChange={e => handleChange('identifiedIssues', e.target.value)} 
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10 h-24" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Ações Necessárias</label>
              <textarea 
                value={formData.requiredActions} 
                onChange={e => handleChange('requiredActions', e.target.value)} 
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10 h-24" 
              />
            </div>
            <SelectField label="Parecer Final" field="finalStatus" options={['Apto para comercialização imediata', 'Apto com ressalvas', 'Não apto para comercialização']} />
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Observações</label>
              <textarea 
                value={formData.observations} 
                onChange={e => handleChange('observations', e.target.value)} 
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10 h-32" 
              />
            </div>
          </div>
        </Section>

        {/* ASSINATURAS */}
        <Section title="Responsabilidade e Data" icon={MapPin}>
          <InputField label="Data" field="date" />
          <InputField label="Responsável pela Análise" field="inspectorName" />
          <InputField label="Imobiliária" field="realEstateAgency" />
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
        title="Ficha Documentação Jurídica"
      />
    </div>
  );
}
