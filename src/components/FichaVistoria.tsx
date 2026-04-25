import React, { useState } from 'react';
import { ArrowLeft, Home, Download, CheckCircle, Camera, ClipboardCheck, User, MapPin, Calendar, Clock, ShieldCheck } from 'lucide-react';
import { generateInspectionPDF } from '../lib/pdfGenerator';
import { ConfirmPDFDownloadModal } from './ConfirmPDFDownloadModal';
import { PDFPreviewModal } from './PDFPreviewModal';

interface Props {
  onBack: () => void;
  initialData?: any;
}

export function FichaVistoria({ onBack, initialData }: Props) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUri, setPreviewUri] = useState('');

  const [formData, setFormData] = useState<any>({
    type: 'Entrada',
    date: new Date().toLocaleDateString('pt-BR'),
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    address: '',
    propertyType: '',
    tenantName: '',
    ownerName: '',
    inspectorName: '',
    // Área Externa
    gate: '', walls: '', exteriorPainting: '', sidewalks: '', garage: '',
    // Sala
    livingRoomDoor: '', livingRoomLock: '', livingRoomWalls: '', livingRoomCeiling: '', livingRoomFloor: '', livingRoomBaseboards: '', livingRoomWindows: '', livingRoomOutlets: '', livingRoomLighting: '',
    // Quartos
    bedroomDoors: '', bedroomWalls: '', bedroomCeiling: '', bedroomFloor: '', bedroomClosets: '', bedroomWindows: '', bedroomOutlets: '',
    // Cozinha
    kitchenWalls: '', kitchenCeiling: '', kitchenFloor: '', kitchenSink: '', kitchenFaucet: '', kitchenCabinets: '', kitchenCounters: '', kitchenStove: '', kitchenHood: '', kitchenElec: '',
    // Banheiros
    bathWalls: '', bathCeiling: '', bathFloor: '', bathToilet: '', bathFlush: '', bathSink: '', bathFaucet: '', bathShower: '', bathGlass: '', bathDrains: '', bathAccessories: '',
    // Área de serviço
    serviceTank: '', serviceFaucets: '', serviceWashMachine: '', serviceFloor: '',
    // Instalações
    elecInstall: '', breakerPanel: '', hydroInstall: '', waterPressure: '', gasSystem: '', intercom: '',
    // Itens Complementares
    ac: '', customFurniture: '', appliances: '', curtains: '',
    // Registro
    photosAttached: false,
    videoAttached: false,
    mediaDescription: '',
    generalObservations: ''
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGeneratePDF = () => {
    generateInspectionPDF(formData);
    setIsConfirmOpen(false);
  };

  const handleReviewPDF = () => {
    const uri = generateInspectionPDF(formData, { returnUri: true }) as string;
    setPreviewUri(uri);
    setIsConfirmOpen(false);
    setIsPreviewOpen(true);
  };

  const Section = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 space-y-6">
      <h3 className="text-sm font-black text-[#617964] flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
        <Icon className="w-4 h-4" /> {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Ficha de Vistoria</h2>
            <p className="text-gray-500 font-medium">Entrada / Saída de Imóvel</p>
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
        {/* TIPO E DADOS BÁSICOS */}
        <Section title="Dados Gerais" icon={ClipboardCheck}>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Tipo de Vistoria</label>
            <div className="flex gap-4">
              {['Entrada', 'Saída'].map(type => (
                <button
                  key={type}
                  onClick={() => handleChange('type', type)}
                  className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${formData.type === type ? 'border-[#617964] bg-[#617964]/5 text-[#617964]' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <InputField label="Data" field="date" />
          <InputField label="Hora" field="time" />
          <InputField label="Endereço do Imóvel" field="address" />
          <InputField label="Tipo de Imóvel" field="propertyType" />
          <InputField label="Locatário" field="tenantName" />
          <InputField label="Proprietário" field="ownerName" />
          <InputField label="Responsável pela Vistoria" field="inspectorName" />
        </Section>

        {/* ÁREA EXTERNA */}
        <Section title="Área Externa / Fachada" icon={Home}>
          <InputField label="Portão" field="gate" />
          <InputField label="Muros / Grades" field="walls" />
          <InputField label="Pintura Externa" field="exteriorPainting" />
          <InputField label="Calçadas" field="sidewalks" />
          <InputField label="Garagem / Vagas" field="garage" />
        </Section>

        {/* SALA */}
        <Section title="Sala" icon={Home}>
          <InputField label="Porta" field="livingRoomDoor" />
          <InputField label="Fechadura" field="livingRoomLock" />
          <InputField label="Paredes (Pintura, manchas)" field="livingRoomWalls" />
          <InputField label="Teto" field="livingRoomCeiling" />
          <InputField label="Piso (Tipo, riscos)" field="livingRoomFloor" />
          <InputField label="Rodapés" field="livingRoomBaseboards" />
          <InputField label="Janelas / Vidros" field="livingRoomWindows" />
          <InputField label="Tomadas / Elétrica" field="livingRoomOutlets" />
          <InputField label="Iluminação" field="livingRoomLighting" />
        </Section>

        {/* QUARTOS */}
        <Section title="Quartos" icon={Home}>
          <InputField label="Portas" field="bedroomDoors" />
          <InputField label="Paredes" field="bedroomWalls" />
          <InputField label="Teto" field="bedroomCeiling" />
          <InputField label="Piso" field="bedroomFloor" />
          <InputField label="Armários (se houver)" field="bedroomClosets" />
          <InputField label="Janelas" field="bedroomWindows" />
          <InputField label="Tomadas / Iluminação" field="bedroomOutlets" />
        </Section>

        {/* COZINHA */}
        <Section title="Cozinha" icon={Home}>
          <InputField label="Paredes / Revestimentos" field="kitchenWalls" />
          <InputField label="Teto" field="kitchenCeiling" />
          <InputField label="Piso" field="kitchenFloor" />
          <InputField label="Pia" field="kitchenSink" />
          <InputField label="Torneira" field="kitchenFaucet" />
          <InputField label="Gabinetes / Armários" field="kitchenCabinets" />
          <InputField label="Bancadas" field="kitchenCounters" />
          <InputField label="Fogão / Cooktop" field="kitchenStove" />
          <InputField label="Exaustor / Coifa" field="kitchenHood" />
          <InputField label="Tomadas / Elétrica" field="kitchenElec" />
        </Section>

        {/* BANHEIROS */}
        <Section title="Banheiros" icon={Home}>
          <InputField label="Paredes / Azulejos" field="bathWalls" />
          <InputField label="Teto" field="bathCeiling" />
          <InputField label="Piso" field="bathFloor" />
          <InputField label="Vaso Sanitário" field="bathToilet" />
          <InputField label="Descarga" field="bathFlush" />
          <InputField label="Pia / Cuba" field="bathSink" />
          <InputField label="Torneira" field="bathFaucet" />
          <InputField label="Chuveiro" field="bathShower" />
          <InputField label="Box / Vidro" field="bathGlass" />
          <InputField label="Ralos" field="bathDrains" />
          <InputField label="Espelhos / Acessórios" field="bathAccessories" />
        </Section>

        {/* ÁREA DE SERVIÇO */}
        <Section title="Área de Serviço" icon={Home}>
          <InputField label="Tanque" field="serviceTank" />
          <InputField label="Torneiras" field="serviceFaucets" />
          <InputField label="Instalação Máquina" field="serviceWashMachine" />
          <InputField label="Piso / Paredes" field="serviceFloor" />
        </Section>

        {/* INSTALAÇÕES GERAIS */}
        <Section title="Instalações Gerais" icon={ShieldCheck}>
          <InputField label="Instalação Elétrica" field="elecInstall" />
          <InputField label="Quadro de Disjuntores" field="breakerPanel" />
          <InputField label="Instalação Hidráulica" field="hydroInstall" />
          <InputField label="Pressão da Água" field="waterPressure" />
          <InputField label="Sistema de Gás" field="gasSystem" />
          <InputField label="Interfone / Campainha" field="intercom" />
        </Section>

        {/* ITENS COMPLEMENTARES */}
        <Section title="Itens Complementares" icon={ClipboardCheck}>
          <InputField label="Ar-condicionado" field="ac" />
          <InputField label="Móveis Planejados" field="customFurniture" />
          <InputField label="Eletrodomésticos" field="appliances" />
          <InputField label="Cortinas / Persianas" field="curtains" />
        </Section>

        {/* REGISTRO E OBS */}
        <Section title="Registro e Observações" icon={Camera}>
           <div className="flex gap-6 items-center py-2">
             <label className="flex items-center gap-2 cursor-pointer">
               <input type="checkbox" checked={formData.photosAttached} onChange={e => handleChange('photosAttached', e.target.checked)} className="rounded border-gray-300 text-[#617964] focus:ring-[#617964]" />
               <span className="text-xs font-bold text-gray-500 uppercase">Fotos Anexadas</span>
             </label>
             <label className="flex items-center gap-2 cursor-pointer">
               <input type="checkbox" checked={formData.videoAttached} onChange={e => handleChange('videoAttached', e.target.checked)} className="rounded border-gray-300 text-[#617964] focus:ring-[#617964]" />
               <span className="text-xs font-bold text-gray-500 uppercase">Vídeo Anexado</span>
             </label>
           </div>
           <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Descrição dos Registros</label>
              <input type="text" value={formData.mediaDescription} onChange={e => handleChange('mediaDescription', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10" />
           </div>
           <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Observações Gerais</label>
              <textarea 
                value={formData.generalObservations} 
                onChange={e => handleChange('generalObservations', e.target.value)} 
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 ring-[#617964]/10 h-32 resize-none" 
              />
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
        title="Ficha de Vistoria"
      />
    </div>
  );
}
