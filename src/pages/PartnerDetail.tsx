import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { motion } from 'motion/react';
import { 
  Globe, 
  Instagram, 
  Youtube, 
  Linkedin, 
  Phone, 
  Mail,
  MapPin,
  ArrowLeft,
  MessageCircle,
  ExternalLink,
  Play
} from 'lucide-react';

interface Partner {
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
}

const formatPhoneNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
};

const getYoutubeEmbedUrl = (url: string) => {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
};

export default function PartnerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchPartner = async () => {
      if (!id) return;
      try {
        // Try to fetch by ID first
        const docRef = doc(db, 'partners', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setPartner({ id: docSnap.id, ...docSnap.data() } as Partner);
        } else {
          // If not found by ID, try fetching by slug
          const partnersRef = collection(db, 'partners');
          const q = query(partnersRef, where("slug", "==", id));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const partnerDoc = querySnapshot.docs[0];
            setPartner({ id: partnerDoc.id, ...partnerDoc.data() } as Partner);
          }
        }
      } catch (error) {
        console.error("Error fetching partner:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPartner();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-[#617964] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
        <h2 className="text-2xl font-black text-gray-900 mb-4">Parceiro não encontrado</h2>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-[#617964] text-white rounded-2xl font-black text-xs uppercase tracking-widest"
        >
          Voltar para Início
        </button>
      </div>
    );
  }

  const embedUrl = getYoutubeEmbedUrl(partner.videoUrl);

  return (
    <div className="min-h-screen bg-white">
      {/* Header / Navigation */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-black text-gray-900 group"
          >
            <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-gray-100 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </div>
            VOLTAR
          </button>
          
          <div className="w-12 h-12 rounded-xl border border-gray-100 overflow-hidden p-1 flex items-center justify-center">
            <img src={partner.headerLogoUrl || partner.logoUrl} alt={partner.name} className="w-full h-full object-contain" />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left Column: Info */}
          <div className="space-y-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <span className="px-4 py-1.5 bg-[#617964]/10 text-[#617964] rounded-full text-[10px] font-black uppercase tracking-widest">
                Parceiro Estratégico
              </span>
              <h1 className="text-4xl lg:text-6xl font-black text-gray-900 leading-tight">
                {partner.name}
              </h1>
              <p className="text-lg font-black text-[#617964] uppercase tracking-[0.3em]">
                {partner.specialty}
              </p>
              <div className="w-20 h-1.5 bg-[#617964] rounded-full"></div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                Quem é {partner.name}
              </h3>
              <p className="text-lg text-gray-600 font-medium leading-relaxed">
                {partner.bio}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contatos</p>
                <div className="space-y-3">
                  {partner.phone && (
                    <a href={`tel:${partner.phone}`} className="flex items-center gap-3 text-sm font-bold text-gray-900 hover:text-[#617964] transition-colors">
                      <Phone className="w-4 h-4 text-[#617964]" />
                      Ligar para {partner.name}
                    </a>
                  )}
                  {partner.email && (
                    <a href={`mailto:${partner.email}`} className="flex items-center gap-3 text-sm font-bold text-gray-900 hover:text-[#617964] transition-colors">
                      <Mail className="w-4 h-4 text-[#617964]" />
                      E-Mail
                    </a>
                  )}
                  {partner.address && (
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(partner.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm font-bold text-gray-900 hover:text-[#617964] transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-[#617964]" />
                      Endereço
                    </a>
                  )}
                </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Redes Sociais</p>
                <div className="flex gap-4">
                  {partner.instagram && (
                    <a href={`https://instagram.com/${partner.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-white rounded-2xl shadow-sm text-gray-400 hover:text-[#E4405F] transition-all">
                      <Instagram className="w-6 h-6" />
                    </a>
                  )}
                  {partner.youtube && (
                    <a href={partner.youtube} target="_blank" rel="noopener noreferrer" className="p-3 bg-white rounded-2xl shadow-sm text-gray-400 hover:text-[#FF0000] transition-all">
                      <Youtube className="w-6 h-6" />
                    </a>
                  )}
                  {partner.linkedin && (
                    <a href={partner.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 bg-white rounded-2xl shadow-sm text-gray-400 hover:text-[#0A66C2] transition-all">
                      <Linkedin className="w-6 h-6" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
               className="flex flex-col sm:flex-row gap-4"
            >
              {partner.phone && (
                <a 
                  href={`https://wa.me/55${partner.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${partner.name}, vim do site da CR Imóveis queria falar com você!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-8 py-5 bg-[#25D366] text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#25D366]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <MessageCircle className="w-5 h-5" /> Iniciar Conversa
                </a>
              )}
              {partner.website && (
                <a 
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-8 py-5 bg-gray-900 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-gray-900/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <Globe className="w-5 h-5" /> Ver Website <ExternalLink className="w-4 h-4 opacity-50" />
                </a>
              )}
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="lg:sticky lg:top-32"
          >
            <div className="space-y-6">
              {partner.coverImageUrl && (
                <div className="w-full overflow-hidden border border-gray-100 shadow-md rounded-none">
                  <img 
                    src={partner.coverImageUrl} 
                    alt="Capa do parceiro" 
                    className="w-full h-auto block rounded-none"
                  />
                </div>
              )}

              {embedUrl ? (
                <>
                  <div className="bg-[#617964] p-8 rounded-[2.5rem] text-white">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-white/20 p-3 rounded-2xl">
                        <Play className="w-6 h-6 fill-current" />
                      </div>
                      <h4 className="text-xl font-black italic">Depoimento Exclusivo</h4>
                    </div>
                    <p className="text-sm font-medium opacity-90 leading-relaxed">
                      Assista ao vídeo gravado em nossa agência, onde compartilhamos detalhes sobre os projetos realizados em parceria com a {partner.name}.
                    </p>
                  </div>
                  <div className="relative aspect-video bg-gray-900 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
                    <iframe 
                      src={embedUrl}
                      title="Apresentação do Parceiro"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </>
              ) : (
                <div className="aspect-[4/5] bg-gray-50 rounded-[3rem] overflow-hidden border border-gray-100 flex items-center justify-center relative group">
                  <img 
                    src={partner.logoUrl} 
                    alt={partner.name} 
                    className="w-48 h-48 object-contain scale-110 group-hover:scale-125 transition-all duration-700 opacity-20" 
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-4">
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center">
                      <img src={partner.logoUrl} alt={partner.name} className="w-full h-full object-contain p-4" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 italic">Parceria Confirmada</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest max-w-[200px]">
                      Excelência em todos os projetos que realizamos juntos.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>

    </div>
  );
}
