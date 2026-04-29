import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Copy, Sparkles, Database, Search, FileText, CheckCircle2, Wand2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PhotoEditorTab } from '../components/PhotoEditorTab';
import { useProperties } from '../context/PropertyContext';
import { GoogleGenAI } from "@google/genai";

export default function EditorPage() {
  const navigate = useNavigate();
  const { properties } = useProperties();
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPropertyPicker, setShowPropertyPicker] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'Casa',
    purpose: 'Venda',
    price: '',
    condo: '',
    iptu: '',
    beds: '',
    baths: '',
    suites: '',
    parking: '',
    area: '',
    description: '',
    address: '',
    neighborhood: '',
    city: 'Belo Horizonte',
    state: 'MG',
    cep: ''
  });

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
  };

  const generateAIContent = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Você é um corretor de imóveis de luxo experiente da CR Imóveis. 
      Crie uma descrição persuasiva e profissional para um portal de imóveis de luxo com os seguintes dados:
      Título: ${formData.title}
      Tipo: ${formData.type}
      Preço: ${formData.price}
      Quartos: ${formData.beds}
      Banheiros: ${formData.baths}
      Vagas: ${formData.parking}
      Área: ${formData.area}m²
      Localização: ${formData.neighborhood}, ${formData.city} - ${formData.state}

      A descrição deve ser elegante, destacar o "lifestyle", luxo e exclusividade da marca CR. 
      Use tópicos claros para as características técnicas. 
      Não use excesso de emojis. Foque em converter o cliente de alto padrão.
      Finalize com uma frase de impacto sobre agendar uma visita exclusiva.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });

      const text = response.text;
      if (text) {
        setFormData(prev => ({ ...prev, description: text }));
      }
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectProperty = (prop: any) => {
    setFormData({
      title: prop.title || '',
      type: prop.category?.split(' ')[0] || 'Casa',
      purpose: prop.listingType === 'aluguel' ? 'Aluguel' : 'Venda',
      price: prop.price || '',
      condo: prop.condoFee || '',
      iptu: prop.iptu || '',
      beds: prop.beds?.toString() || '',
      baths: prop.baths?.toString() || '',
      parking: prop.parking?.toString() || '',
      suites: '', 
      area: prop.area?.replace(/\D/g, '') || '',
      description: prop.description || '',
      address: prop.propertyStreet ? `${prop.propertyStreet}, ${prop.propertyNumber || ''}` : prop.location || '',
      neighborhood: prop.propertyNeighborhood || '',
      city: prop.propertyCity || 'Belo Horizonte',
      state: prop.propertyState || 'MG',
      cep: prop.propertyCep || ''
    });
    setShowPropertyPicker(false);
  };

  return (
    <div className="pt-10 pb-20 px-4 sm:px-6 bg-[#f0f4f0] min-h-screen relative overflow-x-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-[#617964]/20 via-[#617964]/5 to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-marromescuro/60 hover:text-marromescuro transition-all group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-sm">Voltar ao Site</span>
          </button>
          
          <div className="flex items-center gap-3">
             <img src="https://i.imgur.com/FLnyJIe.png" alt="CR" className="h-6 object-contain" />
             <div className="w-px h-4 bg-marromescuro/10" />
             <span className="text-[10px] font-black uppercase tracking-widest text-marromescuro/40">Studio de Criação</span>
          </div>
        </div>

        {/* 1. PHOTO STUDIO (GREEN IDENTITY) */}
        <section className="bg-gradient-to-br from-[#617964] to-[#4a5c4c] rounded-[3rem] p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden group">
          {/* Logo Branding */}
          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
             <Sparkles className="w-40 h-40" />
          </div>

          <div className="relative z-10 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/10 pb-8">
              <div className="flex items-center gap-3">
                <img src="https://i.imgur.com/FLnyJIe.png" alt="CR" className="h-6 object-contain brightness-0 invert" />
                <div className="w-px h-4 bg-white/20" />
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-white/50" />
                  <span className="font-black text-[10px] uppercase tracking-[0.2em] text-white/50">Studio de Fotos IA</span>
                </div>
              </div>
              <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-white/40" />
                Processamento Otimizado
              </div>
            </div>
            
            <div className="text-marromescuro">
               <PhotoEditorTab />
            </div>
          </div>
        </section>

        {/* 2. DESCRIPTION GENERATOR (RESTYLED WITH GREEN IDENTITY) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-gradient-to-br from-[#617964] to-[#4a5c4c] rounded-[3rem] p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
               <Wand2 className="w-32 h-32" />
            </div>
            
            <div className="relative z-10 space-y-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-6">
                <div className="flex items-center gap-3">
                  <img src="https://i.imgur.com/FLnyJIe.png" alt="CR" className="h-6 object-contain brightness-0 invert" />
                  <div className="w-px h-4 bg-white/20" />
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-white/50" />
                    <span className="font-black text-[10px] uppercase tracking-widest text-white/50">Gerador IA</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPropertyPicker(true)}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 flex items-center gap-2"
                >
                  <Database className="w-4 h-4" />
                  Importar
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h3 className="text-xl sm:text-2xl font-black leading-tight mb-4">Dados do <span className="text-white/60">Imóvel</span></h3>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Título do Imóvel</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Maravilhosa Casa Duplex no Belvedere..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white placeholder:text-white/20 focus:bg-white/10 outline-none transition-all focus:border-white/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Valor</label>
                      <input 
                        type="text" 
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:bg-white/10 outline-none"
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Área m²</label>
                      <input 
                        type="text" 
                        value={formData.area}
                        onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:bg-white/10 outline-none"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                   {[
                     { label: 'Quartos', field: 'beds' },
                     { label: 'Banheiros', field: 'baths' },
                     { label: 'Vagas', field: 'parking' }
                   ].map((f) => (
                     <div key={f.field} className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 text-center block">{f.label}</label>
                        <input 
                          type="number" 
                          value={(formData as any)[f.field]}
                          onChange={(e) => setFormData(prev => ({ ...prev, [f.field]: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-2 py-4 text-sm font-black text-center focus:bg-white/10 outline-none"
                        />
                     </div>
                   ))}
                </div>

                <button 
                  onClick={generateAIContent}
                  disabled={isGenerating || !formData.title}
                  className="w-full py-5 bg-white text-[#617964] rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  {isGenerating ? 'Sincronizando com Gemini...' : 'Gerar Descrição de Luxo'}
                </button>
              </div>
            </div>
          </div>

          {/* AI Result Side with Green Identity */}
          <div className="bg-gradient-to-br from-[#617964] to-[#4a5c4c] rounded-[3rem] p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden flex flex-col h-full group">
             <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                <Sparkles className="w-32 h-32" />
             </div>
             
             <div className="relative z-10 flex flex-col h-full space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                   <div className="flex items-center gap-3">
                      <img src="https://i.imgur.com/FLnyJIe.png" alt="CR" className="h-6 object-contain brightness-0 invert" />
                      <div className="w-px h-4 bg-white/20" />
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-white/50" />
                        <span className="font-black text-[10px] uppercase tracking-widest text-white/50">Resultado Gemini</span>
                      </div>
                   </div>
                   {formData.description && (
                      <button 
                        onClick={() => handleCopy(formData.description)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest border border-white/10"
                      >
                         <Copy className="w-3 h-3" />
                         <span>Copiar</span>
                      </button>
                   )}
                </div>

                <div className="flex-1 bg-black/10 rounded-[2rem] border border-white/5 p-6 overflow-hidden">
                   {formData.description ? (
                     <textarea 
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full h-full bg-transparent border-none focus:ring-0 outline-none text-xs sm:text-sm font-medium leading-relaxed text-white/80 resize-none min-h-[300px]"
                     />
                   ) : (
                     <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                        <Wand2 className="w-12 h-12" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Aguardando dados para processar...</p>
                     </div>
                   )}
                </div>

                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                   <div className="flex items-center gap-3 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-white/40" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Dica Profissional</span>
                   </div>
                   <p className="text-[10px] font-bold text-white/50 leading-relaxed uppercase tracking-wider">
                     Use descrições emocionais para vender o sonho. Nossa IA foca em despertar desejo no cliente.
                   </p>
                </div>
             </div>
          </div>

        </section>

        {/* Property Picker Modal */}
        {showPropertyPicker && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-marromescuro/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                <div>
                  <h3 className="text-2xl font-black text-marromescuro">Escolher Imóvel</h3>
                  <p className="text-[10px] font-black text-marromescuro/30 uppercase tracking-widest mt-1">Sincronização Ativa CR Imóveis</p>
                </div>
                <button onClick={() => setShowPropertyPicker(false)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors">
                  <ChevronLeft className="w-6 h-6 rotate-90 text-marromescuro" />
                </button>
              </div>
              <div className="px-8 py-4 border-b border-gray-50 flex items-center gap-3">
                <Search className="w-5 h-5 text-gray-300" />
                <input 
                  type="text" 
                  placeholder="DIGITE O NOME OU LOCALIZAÇÃO..." 
                  className="flex-1 outline-none text-xs font-black text-marromescuro uppercase tracking-[0.2em] placeholder:text-gray-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {properties
                  .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.location.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(prop => (
                    <button 
                      key={prop.id}
                      onClick={() => selectProperty(prop)}
                      className="w-full flex items-center gap-5 p-4 hover:bg-gray-50 rounded-2xl transition-all group border border-transparent hover:border-gray-100 text-left active:scale-[0.98]"
                    >
                      <div className="shrink-0 relative">
                        <img src={prop.image} alt="" className="w-20 h-20 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-marromescuro/10 rounded-2xl group-hover:bg-transparent transition-colors" />
                      </div>
                      <div>
                        <p className="font-black text-marromescuro group-hover:text-[#617964] transition-colors leading-tight">{prop.title}</p>
                        <div className="flex items-center gap-2 mt-2">
                           <span className="text-[9px] font-black uppercase tracking-tight text-white px-2 py-0.5 bg-terracota rounded-md shadow-sm">
                             {prop.price}
                           </span>
                           <p className="text-[9px] text-marromescuro/40 font-black uppercase tracking-tight line-clamp-1 truncate max-w-[150px]">{prop.location}</p>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

