import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { 
  ArrowLeft, 
  MapPin, 
  Info,
  Building2,
  ShieldCheck,
  Waves,
  Trees,
  Car,
  X,
  Eye,
  Flame,
  Utensils,
  Dumbbell,
  Trophy,
  Gamepad2,
  Baby,
  Coffee,
  Wifi,
  Dog,
  Bike,
  Store,
  Wind,
  Heart,
  Bed,
  Bath,
  Maximize,
  ArrowUpRight,
  Home,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useCondos } from '../context/CondoContext';
import { useProperties } from '../context/PropertyContext';
import PropertyCard from '../components/PropertyCard';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useTexture, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function Sphere360({ imageUrl }: { imageUrl: string }) {
  const texture = useTexture(imageUrl);
  return (
    <Sphere args={[500, 60, 40]} scale={[-1, 1, 1]}>
      <meshBasicMaterial map={texture} side={THREE.BackSide} toneMapped={false} />
    </Sphere>
  );
}

const CondoGalleryCard = ({ prop, onClick, isFavorite, onToggleFavorite }: any) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className="relative aspect-square overflow-hidden group cursor-pointer bg-marromescuro/5 rounded-2xl"
    >
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        {(!prop.image || prop.image.includes('pe07Ikg.png')) && (!prop.images || prop.images.length === 0 || prop.images[0] === '') ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-white">
            <img 
              src="https://i.imgur.com/egg4k7M.png" 
              alt="CR Imóveis" 
              className="absolute inset-0 w-full h-full object-contain opacity-5 p-12"
              referrerPolicy="no-referrer"
            />
            <Home className="w-12 h-12 text-marromescuro/10 mb-3" />
            <span className="text-[10px] font-bold text-marromescuro/20 uppercase tracking-widest">Sem foto</span>
          </div>
        ) : (
          <motion.img 
            src={prop.images && prop.images.length > 0 && prop.images[0] !== '' ? prop.images[0] : prop.image} 
            alt={prop.title} 
            className="w-full h-full object-cover"
            animate={{ 
              scale: isHovered ? 1.05 : 1,
            }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            referrerPolicy="no-referrer"
          />
        )}
      </div>

      {/* Favorite Button - Always visible but subtle */}
      <div className="absolute top-6 right-6 z-20">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(e);
          }}
          className={`p-3 rounded-full backdrop-blur-md transition-all duration-300 ${isFavorite ? 'bg-white text-marromescuro shadow-lg' : 'bg-black/20 text-white hover:bg-white hover:text-marromescuro'}`}
        >
          <Heart 
            className={`w-5 h-5 transition-all ${isFavorite ? 'fill-marromescuro' : ''}`} 
          />
        </button>
      </div>

      {/* Hover Overlay - ONLY ON HOVER */}
      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 bg-gradient-to-t from-marromescuro/90 via-marromescuro/40 to-transparent flex flex-col justify-end p-8 text-white"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <h3 className="text-2xl font-bold tracking-tight leading-tight">{prop.title}</h3>
                <div className="flex items-center gap-1.5 text-white/70 text-xs font-medium">
                  <MapPin className="w-3.5 h-3.5 text-terracota" />
                  <span>{prop.location}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-2 pt-4 border-t border-white/10">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/80">
                  <Bed className="w-3.5 h-3.5 text-terracota" />
                  <span>{prop.beds} Suítes</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/80">
                  <Car className="w-3.5 h-3.5 text-terracota" />
                  <span>{prop.parking} Vagas</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/80">
                  <Maximize className="w-3.5 h-3.5 text-terracota" />
                  <span>{prop.area}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold">Investimento</span>
                  <span className="text-xl font-bold text-white">{prop.price}</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-terracota transition-colors">
                  <ArrowUpRight className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function CondoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { condos } = useCondos();
  const { properties } = useProperties();
  const { favorites, toggleFavorite } = useOutletContext<{ favorites: (string | number)[], toggleFavorite: (id: string | number) => void }>();
  
  const [is360Open, setIs360Open] = useState(false);
  const [visibleProperties, setVisibleProperties] = useState(12);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, 300]);
  const heroOpacity = useTransform(scrollY, [0, 800], [1, 0.3]);

  const condo = condos.find(c => c.id.toString() === id);
  const condoProperties = properties.filter(p => condo && (p.condoId === condo.id || p.location.includes(condo.name)));

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const condoImages = condo?.images || [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === condoImages.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? condoImages.length - 1 : prev - 1));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1000) {
        if (visibleProperties < condoProperties.length) {
          setVisibleProperties(prev => prev + 6);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleProperties, condoProperties.length]);

  if (!condo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-white">
        <h2 className="text-2xl font-serif font-bold text-marromescuro mb-2">Condomínio não encontrado</h2>
        <button 
          onClick={() => navigate('/')}
          className="px-8 py-4 bg-marromescuro text-white rounded-2xl font-bold hover:bg-marromescuro/90 transition-all"
        >
          Voltar para o Início
        </button>
      </div>
    );
  }

  const loadMore = () => {
    setVisibleProperties(prev => prev + 8);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Top 360 Image Section */}
      <div className="fixed top-0 left-0 w-full h-[75vh] md:h-[95vh] overflow-hidden bg-black z-0">
        <motion.img 
          src={(condo.images && condo.images.length > 0) ? condo.images[0] : (condo.image360Url || "https://i.imgur.com/Gp90UvK.png")} 
          alt={condo.name} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          animate={is360Open ? { scale: 1.5, opacity: 0 } : { scale: 1 }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
        />
        
        <AnimatePresence>
          {!is360Open && (
            <motion.div 
              initial={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center"
            >
              {condo.logoUrl ? (
                <img 
                  src={condo.logoUrl} 
                  alt="Logo" 
                  className="w-[60%] max-w-[800px] mb-4 drop-shadow-2xl object-contain max-h-[300px]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8 drop-shadow-2xl text-center px-4">
                  {condo.name}
                </h1>
              )}
              <div className="flex flex-col items-center">
                {condo.image360Url && (
                  <button 
                    onClick={() => setIs360Open(true)}
                    className="px-8 py-4 bg-white/20 backdrop-blur-md border border-white/40 text-white rounded-full font-bold uppercase tracking-widest hover:bg-gradient-to-r hover:from-[#BBDA00] hover:to-[#839702] hover:border-transparent transition-all flex items-center gap-3 shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(187,218,0,0.4)]"
                  >
                    <Eye className="w-5 h-5" />
                    Ver em 360º
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Back Button Overlay */}
        <AnimatePresence>
          {!is360Open && (
            <motion.button 
              initial={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={() => navigate(-1)}
              className="absolute top-32 left-8 flex items-center gap-2 text-white/80 hover:text-white transition-colors font-bold group bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm z-10"
            >
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              Voltar
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Content that scrolls over the hero */}
      <div className="relative z-20 mt-[50vh] md:mt-[70vh] min-h-screen">
        {/* Properties Gallery - Full Width */}
        <div className="w-full px-2 pt-20 relative z-10 bg-gradient-to-b from-transparent via-white to-white">
          {condoProperties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {condoProperties.slice(0, visibleProperties).map((prop) => (
                <CondoGalleryCard 
                  key={prop.id} 
                  prop={prop} 
                  onClick={() => navigate(`/imovel/${prop.id}`)} 
                  isFavorite={favorites.includes(prop.id)}
                  onToggleFavorite={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    toggleFavorite(prop.id);
                  }}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
            <div className="bg-white p-12 rounded-[40px] text-center shadow-sm border border-marromescuro/5">
              <Building2 className="w-12 h-12 text-marromescuro/20 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-marromescuro mb-2">Nenhum imóvel cadastrado</h3>
              <p className="text-marromescuro/60">Ainda não há imóveis disponíveis neste condomínio.</p>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Solid background starts after the gallery */}
      <div className="bg-white relative z-10 pb-20 pt-12 space-y-12">
        {/* Condo Bio & Characteristics - Full Width like Gallery */}
        <div className="w-full px-4 md:px-8">
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl border border-marromescuro/5">
            <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-20">
              {/* Title, Location & Gallery Slider */}
              <div className="lg:w-1/3 space-y-8 shrink-0">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-marromescuro/30 uppercase tracking-[0.2em]">Condomínio</span>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-marromescuro leading-tight italic tracking-tight drop-shadow-sm">
                      {condo.name}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-terracota font-bold text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{condo.location}</span>
                  </div>
                </div>

                {/* Slider */}
                {condoImages.length > 0 && (
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden group shadow-2xl bg-marromescuro/5 border border-marromescuro/5">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentImageIndex}
                        src={condoImages[currentImageIndex]}
                        alt={`${condo.name} - ${currentImageIndex + 1}`}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </AnimatePresence>
                    
                    {condoImages.length > 1 && (
                      <>
                        <button 
                          onClick={(e) => { e.stopPropagation(); prevImage(); }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/30 backdrop-blur-md text-white rounded-full transition-all opacity-0 group-hover:opacity-100 z-10 border border-white/20"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); nextImage(); }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/30 backdrop-blur-md text-white rounded-full transition-all opacity-0 group-hover:opacity-100 z-10 border border-white/20"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full text-[9px] font-bold text-white uppercase tracking-[0.2em] z-10 border border-white/10">
                          {currentImageIndex + 1} / {condoImages.length}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Bio Section */}
              <div className="lg:w-1/4 space-y-4">
                <h3 className="text-[10px] font-bold text-marromescuro/30 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-terracota" />
                  Sobre
                </h3>
                <p className="text-marromescuro/70 leading-relaxed text-sm font-medium">
                  {condo.bio}
                </p>
              </div>

              {/* Amenities Section */}
              <div className="lg:w-2/4 space-y-6">
                <h3 className="text-[10px] font-bold text-marromescuro/30 uppercase tracking-[0.2em]">Infraestrutura & Lazer</h3>
                <div className="flex flex-wrap items-center gap-x-8 gap-y-6">
                  {condo.portariaType && condo.portariaType !== 'Não possui' && (
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-marromescuro/5 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5 text-terracota" />
                      </div>
                      <span className="text-[10px] font-bold text-marromescuro/70 uppercase tracking-widest">Portaria {condo.portariaType}</span>
                    </div>
                  )}
                  
                  {condo.gasSupply && (
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-marromescuro/5 flex items-center justify-center shrink-0">
                        <Flame className="w-5 h-5 text-terracota" />
                      </div>
                      <span className="text-[10px] font-bold text-marromescuro/70 uppercase tracking-widest">Gás {condo.gasSupply}</span>
                    </div>
                  )}

                  {/* Leisure and Conveniencies */}
                  {[
                    ...(condo.leisure || []),
                    ...(condo.verticalConveniencies || []),
                    ...(condo.horizontalConveniencies || [])
                  ].map((amenity, idx) => {
                    const Icon = (() => {
                      const a = amenity.toLowerCase();
                      if (a.includes('piscina') || a.includes('lazer')) return Waves;
                      if (a.includes('academia') || a.includes('fitness')) return Dumbbell;
                      if (a.includes('churrasqueira') || a.includes('gourmet') || a.includes('cozinha')) return Utensils;
                      if (a.includes('festa')) return Coffee;
                      if (a.includes('jogo')) return Gamepad2;
                      if (a.includes('play') || a.includes('kids') || a.includes('infantil')) return Baby;
                      if (a.includes('quadra') || a.includes('campo') || a.includes('futebol') || a.includes('tênis')) return Trophy;
                      if (a.includes('pet')) return Dog;
                      if (a.includes('bike') || a.includes('bicicleta')) return Bike;
                      if (a.includes('wifi') || a.includes('internet') || a.includes('coworking')) return Wifi;
                      if (a.includes('mercado') || a.includes('loja') || a.includes('conveniência')) return Store;
                      if (a.includes('verde') || a.includes('árvore') || a.includes('natureza')) return Trees;
                      if (a.includes('estacionamento') || a.includes('vaga')) return Car;
                      if (a.includes('sauna')) return Wind;
                      return Info;
                    })();

                    return (
                      <div key={idx} className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-marromescuro/5 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-terracota" />
                        </div>
                        <span className="text-[10px] font-bold text-marromescuro/70 uppercase tracking-widest whitespace-nowrap">{amenity}</span>
                      </div>
                    );
                  })}

                  {/* Default Area Verde if not in list */}
                  {![...(condo.leisure || []), ...(condo.verticalConveniencies || []), ...(condo.horizontalConveniencies || [])].some(a => a.toLowerCase().includes('verde')) && (
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-marromescuro/5 flex items-center justify-center shrink-0">
                        <Trees className="w-5 h-5 text-terracota" />
                      </div>
                      <span className="text-[10px] font-bold text-marromescuro/70 uppercase tracking-widest">Área Verde</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 360 Modal */}
      <AnimatePresence>
        {is360Open && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-[100] bg-black"
          >
            <motion.div
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
              className="w-full h-full relative"
            >
              <button 
                onClick={() => setIs360Open(false)}
                className="absolute top-8 right-8 z-50 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-all border border-white/20"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="absolute top-8 left-8 z-50 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full text-white text-xs font-bold flex items-center gap-3 border border-white/10">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                MODO IMERSIVO: ARRASTE PARA EXPLORAR
              </div>
              
              <Canvas 
                key={condo.image360Url || "default-360"}
                camera={{ position: [0, 0, 0.1], fov: 75 }}
                style={{ width: '100vw', height: '100vh' }}
                gl={{ antialias: true }}
              >
                <OrbitControls 
                  enableZoom={false} 
                  autoRotate 
                  autoRotateSpeed={0.4}
                  rotateSpeed={-0.5} // Reverse for more natural feel
                />
                <React.Suspense fallback={null}>
                  <Sphere360 imageUrl={condo.image360Url || "https://i.imgur.com/Gp90UvK.png"} />
                </React.Suspense>
              </Canvas>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
