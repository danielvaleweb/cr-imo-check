import React from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Phone, 
  Mail, 
  Instagram, 
  ShieldCheck, 
  ArrowLeft, 
  Home, 
  MapPin, 
  TrendingUp,
  Award,
  Star,
  MessageCircle,
  Share2,
  ArrowUpRight
} from 'lucide-react';
import { useBrokers } from '../context/BrokerContext';
import { useProperties } from '../context/PropertyContext';
import PropertyCard from '../components/PropertyCard';

export default function BrokerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { brokers } = useBrokers();
  const { publishedProperties: properties } = useProperties();
  const { favorites, toggleFavorite } = useOutletContext<{ 
    favorites: (string | number)[], 
    toggleFavorite: (id: string | number, type?: 'property' | 'condo', e?: React.MouseEvent) => void 
  }>();

  const broker = brokers.find(b => b.id.toString() === id);

  if (!broker) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-marromescuro text-white">
        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6">
          <ShieldCheck className="w-10 h-10 text-white/20" />
        </div>
        <h2 className="text-2xl font-serif font-bold mb-2">Corretor não encontrado</h2>
        <p className="text-white/60 mb-8">O perfil que você está procurando não existe ou foi removido.</p>
        <button 
          onClick={() => navigate('/')}
          className="px-8 py-4 bg-white text-marromescuro rounded-2xl font-bold hover:bg-white/90 transition-all"
        >
          Voltar para o Início
        </button>
      </div>
    );
  }

  const brokerProperties = properties.filter(p => p.broker === broker.name);

  return (
    <div className="min-h-screen bg-marromescuro pt-32 pb-20 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Navigation */}
        <div className="mb-12 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors font-bold group"
          >
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            Voltar
          </button>
          <button className="p-3 bg-white/10 rounded-2xl text-white/40 hover:text-white transition-all shadow-sm border border-white/5">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: Profile Info */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 rounded-[40px] p-8 shadow-xl border border-white/5 text-center relative overflow-hidden backdrop-blur-md"
            >
              <div className="absolute top-0 left-0 right-0 h-32 bg-white/5" />
              
              <div className="relative z-10 mb-6">
                <div className="w-40 h-40 rounded-full border-[8px] border-white/10 shadow-2xl mx-auto overflow-hidden">
                  <img 
                    src={broker.photo} 
                    alt={broker.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <h1 className="text-3xl font-serif font-bold text-white">{broker.name}</h1>
                <p className="text-terracota font-bold uppercase tracking-[0.2em] text-xs">{broker.role}</p>
                {broker.creci && (
                  <p className="text-white/30 font-black text-[10px] uppercase tracking-widest mt-2">
                    CRECI: {broker.creci}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-white/5 rounded-3xl">
                  <p className="text-xl font-black text-white">{brokerProperties.length}</p>
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Imóveis</p>
                </div>
                <div className="p-4 bg-white/5 rounded-3xl">
                  <p className="text-xl font-black text-white">10+</p>
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Anos Exp.</p>
                </div>
                <div className="p-4 bg-white/5 rounded-3xl">
                  <p className="text-xl font-black text-white">4.9</p>
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Avaliação</p>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => window.open(`https://wa.me/${broker.phone.replace(/\D/g, '')}`, '_blank')}
                  className="w-full py-4 bg-terracota text-white rounded-2xl font-bold shadow-xl shadow-terracota/20 hover:bg-terracota/90 transition-all flex items-center justify-center gap-3"
                >
                  <MessageCircle className="w-5 h-5" />
                  Falar no WhatsApp
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <button className="py-3 bg-white/5 text-white rounded-2xl font-bold text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" /> Ligar
                  </button>
                  <button className="py-3 bg-white/5 text-white rounded-2xl font-bold text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" /> E-mail
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 rounded-[40px] p-8 shadow-xl border border-white/5 backdrop-blur-md"
            >
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-terracota" />
                Certificações
              </h3>
              <div className="space-y-4">
                {[
                  { title: 'Especialista em Alto Padrão', issuer: 'CR Imóveis' },
                  { title: 'Consultor Imobiliário Certificado', issuer: 'COFECI' },
                  { title: 'Avaliador de Imóveis', issuer: 'CNAI' }
                ].map((cert, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 group hover:bg-white/10 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shadow-sm">
                      <Award className="w-5 h-5 text-white/30 group-hover:text-terracota transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{cert.title}</p>
                      <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest">{cert.issuer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {broker.instagram && (
              <motion.button 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => window.open(`https://instagram.com/${broker.instagram}`, '_blank')}
                className="w-full p-6 bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] rounded-[32px] text-white flex items-center justify-between group overflow-hidden relative"
              >
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <Instagram className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold opacity-80">Siga no Instagram</p>
                    <p className="text-lg font-black tracking-tight">@{broker.instagram}</p>
                  </div>
                </div>
                <ArrowUpRight className="w-6 h-6 relative z-10 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
              </motion.button>
            )}
          </div>

          {/* Right Column: Bio & Properties */}
          <div className="lg:col-span-2 space-y-12">
            
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-serif font-bold text-white">Sobre o Corretor</h2>
              <div className="bg-white/10 p-8 lg:p-10 rounded-[40px] shadow-xl border border-white/5 relative backdrop-blur-md">
                <div className="absolute top-8 right-8 opacity-5">
                  <Star className="w-24 h-24 text-white" />
                </div>
                <p className="text-white/70 leading-relaxed text-lg font-medium relative z-10">
                  {broker.bio}
                </p>
                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-white/5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-6 h-6 text-terracota" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">Foco em Resultados</h4>
                      <p className="text-xs text-white/60 leading-relaxed">Especialista em negociações complexas e fechamento de contratos de alto valor.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                      <Star className="w-6 h-6 text-terracota" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">Atendimento VIP</h4>
                      <p className="text-xs text-white/60 leading-relaxed">Foco total na experiência do cliente, com discrição e exclusividade garantidas.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-serif font-bold text-white">Imóveis em Pauta</h2>
                <span className="px-4 py-2 bg-white/5 text-white rounded-full text-xs font-bold">
                  {brokerProperties.length} Imóveis Disponíveis
                </span>
              </div>

              {brokerProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {brokerProperties.map((prop) => (
                    <PropertyCard 
                      key={prop.id} 
                      prop={prop}
                      onClick={() => navigate(`/imovel/${prop.id}`)}
                      isFavorite={favorites.includes(String(prop.id))}
                      onToggleFavorite={(e) => toggleFavorite(prop.id, 'property', e)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white/5 p-12 rounded-[40px] text-center border border-dashed border-white/10">
                  <Home className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/40 font-bold">Nenhum imóvel disponível no momento.</p>
                </div>
              )}
            </motion.section>

          </div>

        </div>
      </div>
    </div>
  );
}
