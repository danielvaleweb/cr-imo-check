import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Globe, 
  Instagram, 
  Youtube, 
  Linkedin, 
  Phone, 
  Video, 
  Save, 
  X,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_PARTNERS } from '../constants/partners';

export interface Partner {
  id: string;
  name: string;
  specialty: string;
  slug: string;
  logoUrl: string;
  headerLogoUrl: string;
  coverImageUrl: string;
  bio: string;
  videoUrl: string;
  email: string;
  website: string;
  phone: string;
  address: string;
  instagram: string;
  youtube: string;
  linkedin: string;
  createdAt: any;
}

export const PartnersTab = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPartnerId, setCurrentPartnerId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    slug: '',
    logoUrl: '',
    headerLogoUrl: '',
    coverImageUrl: '',
    bio: '',
    videoUrl: '',
    email: '',
    website: '',
    phone: '',
    address: '',
    instagram: '',
    youtube: '',
    linkedin: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'partners'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Partner));
      setPartners(data);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentPartnerId(null);
    setFormData({
      name: '',
      specialty: '',
      slug: '',
      logoUrl: '',
      headerLogoUrl: '',
      coverImageUrl: '',
      bio: '',
      videoUrl: '',
      email: '',
      website: '',
      phone: '',
      address: '',
      instagram: '',
      youtube: '',
      linkedin: ''
    });
    setIsModalOpen(true);
  };

  const handleSeed = async () => {
    if (confirm("Deseja carregar os parceiros iniciais?")) {
      try {
        for (const p of INITIAL_PARTNERS) {
          await addDoc(collection(db, 'partners'), {
            ...p,
            createdAt: serverTimestamp()
          });
        }
      } catch (error) {
        console.error("Error seeding partners:", error);
      }
    }
  };

  const handleOpenEdit = (partner: Partner) => {
    setIsEditing(true);
    setCurrentPartnerId(partner.id);
    setFormData({
      name: partner.name,
      specialty: partner.specialty || '',
      slug: partner.slug || '',
      logoUrl: partner.logoUrl,
      headerLogoUrl: partner.headerLogoUrl || '',
      coverImageUrl: partner.coverImageUrl || '',
      bio: partner.bio || '',
      videoUrl: partner.videoUrl || '',
      email: partner.email || '',
      website: partner.website || '',
      phone: partner.phone || '',
      address: partner.address || '',
      instagram: partner.instagram || '',
      youtube: partner.youtube || '',
      linkedin: partner.linkedin || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && currentPartnerId) {
        await updateDoc(doc(db, 'partners', currentPartnerId), {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'partners'), {
          ...formData,
          createdAt: serverTimestamp()
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving partner:", error);
      alert("Erro ao salvar parceiro.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este parceiro?")) {
      try {
        await deleteDoc(doc(db, 'partners', id));
      } catch (error) {
        console.error("Error deleting partner:", error);
      }
    }
  };

  const filteredPartners = partners.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Gestão de Parceiros</h2>
          <p className="text-sm text-gray-500 font-medium">Cadastre e gerencie os parceiros estratégicos da imobiliária.</p>
        </div>
        <div className="flex items-center gap-4">
          {partners.length === 0 && (
            <button 
              onClick={handleSeed}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
            >
              Carregar Iniciais
            </button>
          )}
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-6 py-3 bg-[#617964] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#4a5c4c] transition-all shadow-lg shadow-[#617964]/20"
          >
            <Plus className="w-4 h-4" /> Novo Parceiro
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Buscar parceiros..."
          className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border border-gray-100 focus:border-[#617964] focus:ring-4 focus:ring-[#617964]/5 transition-all text-sm font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.map(partner => (
          <motion.div 
            key={partner.id}
            layout
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-20 h-20 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center p-2">
                {partner.logoUrl ? (
                  <img src={partner.logoUrl} alt={partner.name} className="w-full h-full object-contain" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-300" />
                )}
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => handleOpenEdit(partner)}
                  className="p-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-[#617964] hover:text-white transition-all"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(partner.id)}
                  className="p-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-black text-gray-900 leading-tight">{partner.name}</h3>
                <p className="text-[10px] font-black text-[#617964] uppercase tracking-widest mt-1">{partner.specialty}</p>
                <p className="text-xs text-gray-500 font-medium line-clamp-2 mt-2">{partner.bio}</p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                {partner.website && <Globe className="w-4 h-4 text-gray-400" />}
                {partner.instagram && <Instagram className="w-4 h-4 text-gray-400" />}
                {partner.youtube && <Youtube className="w-4 h-4 text-gray-400" />}
                {partner.linkedin && <Linkedin className="w-4 h-4 text-gray-400" />}
                {partner.videoUrl && <Video className="w-4 h-4 text-emerald-500" />}
              </div>

              <a 
                href={`/parceiro/${partner.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-gray-50 text-gray-600 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-100 transition-all"
              >
                Ver Página <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-marromescuro/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div>
                  <h3 className="text-xl font-black text-gray-900">{isEditing ? 'Editar Parceiro' : 'Novo Parceiro'}</h3>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Configurações de Parceria</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSave} className="overflow-y-auto p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nome da Empresa</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-[#617964] transition-all font-medium"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">SLUG (URL amigável: gustavo_badaro)</label>
                      <input 
                        type="text" 
                        placeholder="ex: gustavo_badaro"
                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-[#617964] transition-all font-medium"
                        value={formData.slug}
                        onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/ /g, '_')})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Especialidade / O que faz</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Design de Interiores"
                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-[#617964] transition-all font-medium"
                        value={formData.specialty}
                        onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Logo Principal (Home)</label>
                      <input 
                        type="text" 
                        required
                        placeholder="https://exemplo.com/logo.png"
                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-[#617964] transition-all font-medium"
                        value={formData.logoUrl}
                        onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Logo Topo (Opcional)</label>
                      <input 
                        type="text" 
                        placeholder="Se não preencher, usa a principal"
                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-[#617964] transition-all font-medium"
                        value={formData.headerLogoUrl}
                        onChange={(e) => setFormData({...formData, headerLogoUrl: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Foto de Capa URL (sobre o vídeo)</label>
                      <input 
                        type="text" 
                        placeholder="https://exemplo.com/capa.png"
                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-[#617964] transition-all font-medium"
                        value={formData.coverImageUrl}
                        onChange={(e) => setFormData({...formData, coverImageUrl: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Vídeo URL (YouTube/Vimeo)</label>
                      <input 
                        type="text" 
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-[#617964] transition-all font-medium"
                        value={formData.videoUrl}
                        onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Contacts & Social */}
                  <div className="space-y-6">
                     <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Site Oficial</label>
                      <input 
                        type="text" 
                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-[#617964] transition-all font-medium"
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">E-mail de Contato</label>
                       <input 
                         type="email" 
                         className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-[#617964] transition-all font-medium"
                         value={formData.email}
                         onChange={(e) => setFormData({...formData, email: e.target.value})}
                       />
                     </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Telefone / WhatsApp</label>
                      <input 
                        type="text" 
                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-[#617964] transition-all font-medium"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Endereço</label>
                       <input 
                         type="text" 
                         placeholder="Ex: Rua Exemplo, 123 - Centro"
                         className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-[#617964] transition-all font-medium"
                         value={formData.address}
                         onChange={(e) => setFormData({...formData, address: e.target.value})}
                       />
                     </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Instagram (@)</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-[#617964] transition-all font-medium text-sm"
                          value={formData.instagram}
                          onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">YouTube</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-[#617964] transition-all font-medium text-sm"
                          value={formData.youtube}
                          onChange={(e) => setFormData({...formData, youtube: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">LinkedIn</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-[#617964] transition-all font-medium text-sm"
                          value={formData.linkedin}
                          onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Bio / Descrição da Empresa</label>
                  <textarea 
                    rows={4}
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-[#617964] transition-all font-medium resize-none"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  />
                </div>

                <div className="pt-4 sticky bottom-0 bg-white pb-2 flex gap-4">
                  <button 
                    type="submit"
                    className="flex-1 py-5 bg-[#617964] text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#617964]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    <Save className="w-5 h-5" /> {isEditing ? 'Atualizar Parceiro' : 'Salvar Parceiro'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 py-5 bg-gray-100 text-gray-500 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-200 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
