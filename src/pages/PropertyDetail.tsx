import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { formatPhone } from '../lib/utils';
import { 
  ArrowLeft, 
  Share2, 
  Heart, 
  MapPin, 
  Bed, 
  Bath, 
  Car, 
  Maximize, 
  Calendar, 
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Info,
  ExternalLink,
  Headset,
  X,
  Home,
  User,
  Play,
  Copy,
  Check,
  Link as LinkIcon,
  Facebook,
  Instagram,
  Clock,
  AlertTriangle,
  Building2,
  Mail,
  Phone,
  FileText,
  Waves,
  Wind,
  UtensilsCrossed,
  ArrowUpRight,
  Droplets,
  Bike,
  Dumbbell,
  RotateCcw,
  BedDouble,
  Map as MapIcon
} from 'lucide-react';
import { useParams, useNavigate, useOutletContext, Link } from 'react-router-dom';
import { useProperties } from '../context/PropertyContext';
import { useBrokers } from '../context/BrokerContext';
import { useCondos } from '../context/CondoContext';
import PropertyCard from '../components/PropertyCard';

const MOCK_PROPERTY = {
  id: '624270',
  type: 'Alto Padrão',
  title: 'Casa Luxury',
  location: 'Jardim América',
  city: 'São Paulo',
  price: 'R$ 8.700.000',
  area: '290 m²',
  dorms: 3,
  suites: 2,
  vagas: 2,
  description: `Apartamento mobiliado, com 290 m² de área útil, assinado pela DDK, que combina amplitude, sofisticação e design contemporâneo em um dos bairros mais desejados de São Paulo. Envolvido por janelas piso-teto, o imóvel é extremamente iluminado, com excelente incidência do sol da tarde, proporcionando conforto e bem-estar em todos os ambientes. As salas amplas e integradas valorizam a fluidez dos espaços, enquanto a cozinha gourmet, equipada com eletrodomésticos Gorenje, pode ser integrada ou isolada da área social por elegantes portas em camarão. A área íntima conta com três dormitórios, todos com janelas antirruído, sendo duas suítes, a suíte master se destaca pelo alto padrão, oferecendo dois closets e banheiro com duas cubas e dois chuveiros. A segunda suíte dispõe de sauna úmida, trazendo ainda mais conforto e exclusividade. O terceiro dormitório, atualmente utilizado como escritório, é versátil e facilmente reversível. O apartamento é complementado por marcenaria de primeira linha, sistema de automação e ar-condicionado, garantindo praticidade, tecnologia e acabamento impecável. Um imóvel único, pronto para morar, no coração do Jardim América.`,
  agent: {
    name: 'Simone Fagundes',
    role: 'Corretor(a) associado',
    image: 'https://i.imgur.com/2vUJ9Au.png'
  },
  images: [
    'https://i.imgur.com/pe07Ikg.png',
    'https://i.imgur.com/W10YtDm.png',
    'https://i.imgur.com/pe07Ikg.png',
    'https://i.imgur.com/W10YtDm.png',
    'https://i.imgur.com/pe07Ikg.png',
  ],
  neighborhood: {
    title: 'Jardim América',
    description: 'Um verdadeiro oásis dentro da urbana São Paulo, as ruas e avenidas do bairro do Jardim América têm o verde como marca registrada. Possui uma valorização imobiliária constante. Com baixa densidade de verticalização, encontramos no bairro uma grande concentração de residências de alto luxo, com áreas e terrenos de dimensões generosos. Oferecendo uma tranquilidade e qualidade de vida superiores no elegante bairro encontramos os tradicionais clubes, como o Sociedade Harmonia de Tênis e o Clube Athlético Paulistano. O bairro abriga também uma grande referência da cidade, a igreja Nossa Senhora do Brasil. Todas essas singularidades tornam o Jardim América um dos bairros mais valorizados e desejados da cidade.',
    gastronomy: 'Fasano, Mani, Rodeio, A Figueira Rubaiyat',
    clubs: 'Clube Athlético Paulistano, Esporte Clube Pinheiros, Sociedade Harmonia de Tênis',
    image: 'https://i.imgur.com/pe07Ikg.png'
  }
};

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties } = useProperties();
  const { brokers } = useBrokers();
  const { condos } = useCondos();
  const { favorites, toggleFavorite } = useOutletContext<{ 
    favorites: (string | number)[], 
    toggleFavorite: (id: string | number, type?: 'property' | 'condo', e?: React.MouseEvent) => void 
  }>();
  const [scrolled, setScrolled] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [showFloorPlan, setShowFloorPlan] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [isFloorPlanModalOpen, setIsFloorPlanModalOpen] = useState(false);
  const [modalFloorPlanIndex, setModalFloorPlanIndex] = useState(0);
  const [isTour360ModalOpen, setIsTour360ModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [locationImageIndex, setLocationImageIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isNeighborhoodExpanded, setIsNeighborhoodExpanded] = useState(false);
  const [activePriceTab, setActivePriceTab] = useState(0);

  const propertyData = properties.find(p => p.id.toString() === id) || properties[0];
  
  // Find the condo for this property
  const condo = condos.find(c => c.id.toString() === propertyData.condoId?.toString());
  
  // Find the broker for this property
  const broker = brokers.find(b => b.name === propertyData.broker) || brokers[0];
  
  const RELATED_PROPERTIES = properties.slice(0, 3);
  
  // Merge dynamic data with mock data for fields not present in PROPERTIES
  const property = {
    ...MOCK_PROPERTY,
    ...propertyData,
    id: propertyData.id,
    agent: {
      id: broker.id,
      name: broker.name,
      role: broker.role,
      image: broker.photo,
      phone: broker.phone,
      email: broker.email,
      creci: broker.creci,
      instagram: broker.instagram
    },
    // Use the dynamic images if available, otherwise fallback to mock gallery with dynamic main image
    images: propertyData.images && propertyData.images.length > 0 && propertyData.images[0] !== ''
      ? propertyData.images 
      : [propertyData.image, ...MOCK_PROPERTY.images.slice(1)]
  };

  // Scroll listener for header style
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Delay controls for 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowControls(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  // Keyboard support for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;
      if (e.key === 'Escape') setIsModalOpen(false);
      if (e.key === 'ArrowLeft') setModalImageIndex((prev) => (prev === 0 ? property.images.length - 1 : prev - 1));
      if (e.key === 'ArrowRight') setModalImageIndex((prev) => (prev === property.images.length - 1 ? 0 : prev + 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, property.images.length]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `Confira este imóvel: ${property.title} - ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const handleShareInstagram = () => {
    // Instagram doesn't have a direct share URL for web, so we'll just open Instagram
    // or suggest copying the link. For now, let's just open the site.
    window.open('https://www.instagram.com/', '_blank');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return '';
    // Handle youtu.be, youtube.com/watch?v=, youtube.com/embed/
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
  };

  const isOfflineBrasilia = () => {
    const now = new Date();
    const utcHour = now.getUTCHours();
    // Brasília is UTC-3
    let brHour = utcHour - 3;
    if (brHour < 0) brHour += 24;
    // Offline between 00:00 and 08:00
    return brHour >= 0 && brHour < 8;
  };

  const [isAgentHovered, setIsAgentHovered] = useState(false);

  // Scheduling Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleStep, setScheduleStep] = useState(1);
  const [scheduleData, setScheduleData] = useState({
    date: '',
    time: '',
    name: '',
    email: '',
    phone: '',
    location: 'property' // 'property' or 'office'
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const offline = isOfflineBrasilia();

  const handleScheduleNext = () => {
    if (scheduleStep === 1) {
      if (!scheduleData.date || !scheduleData.time) {
        return;
      }
      setScheduleStep(2);
    }
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here we would normally send the data to a backend
    console.log('Agendamento confirmado:', scheduleData);
    setIsScheduleModalOpen(false);
    
    // Show success message after a short delay
    setTimeout(() => {
      setShowSuccessModal(true);
      // Play success sound
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Audio play failed:', err));
    }, 400);

    // Reset state after a short delay to avoid flicker during exit animation
    setTimeout(() => {
      setScheduleStep(1);
      setAgreedToTerms(false);
      setScheduleData({
        date: '',
        time: '',
        name: '',
        email: '',
        phone: '',
        location: 'property'
      });
    }, 300);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Top Header */}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 w-[1798px] max-w-[98%] pl-0 pr-14 py-4 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all shadow-2xl ${
                scrolled 
                  ? 'bg-white text-black opacity-100 border border-black/10' 
                  : 'bg-white/10 backdrop-blur-md border border-white/20 text-white opacity-90 hover:bg-white/20'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Gallery */}
      <section className="relative h-screen w-full bg-white overflow-hidden">
        {(property.images[activeImage] && property.images[activeImage].includes('pe07Ikg.png')) ? (
          <div className="w-full h-full flex flex-col items-center justify-center relative">
            <img 
              src="https://i.imgur.com/egg4k7M.png" 
              alt="CR Imóveis" 
              className="absolute inset-0 w-full h-full object-contain opacity-5 p-12 md:p-32"
              referrerPolicy="no-referrer"
            />
            <Home className="w-16 h-16 text-marromescuro/20 mb-4 relative z-10" />
            <span className="text-xl font-bold text-marromescuro/40 relative z-10 uppercase tracking-widest">Imóvel sem foto</span>
          </div>
        ) : (
          <img 
            src={property.images[activeImage]} 
            alt="Property" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        )}

        {/* Property Title Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="flex flex-col items-center gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ 
                opacity: !showControls && activeImage === 0 ? 1 : 0.5,
                y: 0
              }}
              transition={{ 
                duration: 1.5,
                ease: "easeOut"
              }}
              className="text-center px-6"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="flex justify-center"
              >
                <motion.h1 
                  animate={{ 
                    backgroundPosition: ["-200% 0", "200% 0"] 
                  }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tight italic bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-[length:200%_auto] bg-clip-text text-transparent drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)] py-4 px-4 leading-relaxed"
                >
                  {property.title}
                </motion.h1>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        
        {/* Navigation Arrows - Removed as requested */}
        <AnimatePresence>
          {showControls && (
            <>
              {/* Thumbnails Overlay - Delayed */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-2 w-[95vw] md:w-auto overflow-x-auto no-scrollbar snap-x"
              >
                {((property.floorPlanUrls && property.floorPlanUrls.length > 0 && property.floorPlanUrls[0] !== '') || property.floorPlanUrl) && (
                  <button 
                    onClick={() => setIsFloorPlanModalOpen(true)}
                    className="shrink-0 w-20 md:w-24 h-14 md:h-16 rounded-xl bg-[#132014]/90 backdrop-blur-md flex flex-col items-center justify-center text-white text-[10px] font-bold hover:bg-[#132014] transition-colors border border-white/20 shadow-2xl snap-center"
                  >
                    <MapIcon className="w-5 h-5 mb-1" />
                    <span>PLANTA</span>
                  </button>
                )}

                {property.tour360Url && (
                  <button 
                    onClick={() => setIsTour360ModalOpen(true)}
                    className="shrink-0 w-20 md:w-24 h-14 md:h-16 rounded-xl bg-[#617964]/80 backdrop-blur-md flex flex-col items-center justify-center text-white text-[10px] font-bold hover:bg-[#617964] transition-colors border border-white/20 shadow-2xl snap-center"
                  >
                    <RotateCcw className="w-5 h-5 mb-1" />
                    <span>TOUR 360º</span>
                  </button>
                )}

                <div className="flex gap-1 shrink-0">
                  {property.images.slice(0, 5).map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`shrink-0 w-20 md:w-24 h-14 md:h-16 rounded-xl overflow-hidden border-2 transition-all shadow-2xl snap-center ${activeImage === idx ? 'border-[#617964] scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                  {property.images.length > 5 && (
                    <button 
                      onClick={() => {
                        setModalImageIndex(5);
                        setIsModalOpen(true);
                      }}
                      className="shrink-0 w-20 md:w-24 h-14 md:h-16 rounded-xl bg-black/40 backdrop-blur-md flex flex-col items-center justify-center text-white text-[10px] font-bold hover:bg-black/60 transition-colors border border-white/20 shadow-2xl snap-center"
                    >
                      <span>+{property.images.length - 5}</span>
                      <span className="opacity-60">fotos</span>
                    </button>
                  )}
                </div>

                {property.videoUrl && (
                  <button 
                    onClick={() => setIsVideoModalOpen(true)}
                    className="shrink-0 w-20 md:w-24 h-14 md:h-16 rounded-xl bg-[#617964]/80 backdrop-blur-md flex flex-col items-center justify-center text-white text-[10px] font-bold hover:bg-[#617964] transition-colors border border-white/20 shadow-2xl snap-center"
                  >
                    <Play className="w-5 h-5 mb-1 fill-white" />
                    <span>VÍDEO</span>
                  </button>
                )}

                {property.customButtons && property.customButtons.map((btn: any, idx: number) => (
                  <a 
                    key={idx}
                    href={btn.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 w-20 md:w-24 h-14 md:h-16 rounded-xl bg-black/40 backdrop-blur-md flex flex-col items-center justify-center text-white text-[10px] font-bold hover:bg-black/60 transition-colors border border-white/20 shadow-2xl snap-center"
                  >
                    <ExternalLink className="w-5 h-5 mb-1" />
                    <span>{btn.label.toUpperCase()}</span>
                  </a>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </section>

      {/* Fullscreen Gallery Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center"
          >
            <button 
              onClick={() => {
                setActiveImage(modalImageIndex);
                setIsModalOpen(false);
              }}
              className="absolute top-8 right-8 p-2 bg-white hover:bg-white/90 rounded-full text-black transition-all z-[110] shadow-xl"
            >
              <X className="w-6 h-6" />
            </button>

            <button 
              onClick={() => setModalImageIndex((prev) => (prev === 0 ? property.images.length - 1 : prev - 1))}
              className="absolute left-8 p-3 bg-white hover:bg-white/90 rounded-full text-black transition-all z-[110] shadow-xl"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="relative w-[90vw] h-[80vh] flex items-center justify-center">
              <motion.div
                key={modalImageIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full h-full flex items-center justify-center"
              >
                <img
                  src={property.images[modalImageIndex]}
                  alt="Property"
                  className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
                  referrerPolicy="no-referrer"
                />
                
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                  <div className="flex flex-col items-center justify-center opacity-50">
                    <span className="text-white text-base md:text-2xl font-bold tracking-widest uppercase -rotate-12 whitespace-nowrap drop-shadow-lg">
                      Direitos reservados CR Imóveis 2026 ©
                    </span>
                  </div>
                </div>
              </motion.div>

              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full text-black text-[10px] font-bold shadow-lg">
                {modalImageIndex + 1} / {property.images.length}
              </div>
            </div>

            <button 
              onClick={() => setModalImageIndex((prev) => (prev === property.images.length - 1 ? 0 : prev + 1))}
              className="absolute right-8 p-3 bg-white hover:bg-white/90 rounded-full text-black transition-all z-[110] shadow-xl"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoModalOpen && property.videoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <button 
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-8 right-8 p-2 bg-white hover:bg-white/90 rounded-full text-black transition-all z-[110] shadow-xl"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black">
              <iframe
                src={`${getYoutubeEmbedUrl(property.videoUrl)}?autoplay=1`}
                title="Property Video"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-6 relative">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="space-y-2">
                  <h1 className="text-4xl md:text-5xl font-serif font-bold text-marromescuro leading-tight italic tracking-tight drop-shadow-sm">{property.title}</h1>
                  <div className="flex flex-wrap items-center gap-2 text-marromescuro/40">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-terracota" />
                      <span className="text-base md:text-lg font-medium">{property.location}</span>
                    </div>
                    {condo && (
                      <Link 
                        to={`/condominio/${condo.id}`} 
                        className="flex items-center gap-2 px-3 py-1 bg-terracota/10 text-terracota rounded-full hover:bg-terracota/20 transition-all font-bold text-xs md:text-sm"
                      >
                        <Building2 className="w-4 h-4" />
                        {condo.name}
                      </Link>
                    )}
                  </div>
                </div>

                {property.code && (
                  <div className="flex flex-col items-start md:items-end pt-2 w-full md:w-auto border-t md:border-t-0 border-marromescuro/10 mt-4 md:mt-0 pt-4 md:pt-2">
                    <div className="flex items-center gap-4 text-marromescuro">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-marromescuro/30">Cod.</span>
                        <Home className="w-3 h-3 text-marromescuro/20" />
                      </div>
                      
                      <span className="text-2xl md:text-3xl font-black tracking-tighter leading-none">{property.code}</span>
                      
                      <div className="relative group/copy">
                        <button 
                          onClick={() => handleCopyCode(property.code)}
                          className="p-2 hover:bg-marromescuro/10 rounded-xl transition-all group"
                        >
                          <Copy className="w-4 h-4 text-marromescuro" />
                        </button>
                        
                        <AnimatePresence>
                          {codeCopied && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.9 }}
                              className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white text-[10px] font-bold px-4 py-2.5 rounded-xl shadow-2xl z-50 whitespace-nowrap flex items-center gap-2"
                            >
                              <Check className="w-3 h-3 text-[#617964]" />
                              Copiado!
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1A1A1A]" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Characteristics Row - Moved inside left column to push description down */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6 py-8 bg-[#617964] rounded-3xl shadow-sm border border-[#617964]/20 px-8">
              {propertyData.rooms > 0 && (
                <div className="flex flex-col items-center gap-1 group/char">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm group-hover/char:bg-white/90 transition-colors">
                    <Bed className="w-5 h-5 text-[#132014]" />
                  </div>
                  <span className="text-[8px] font-bold text-white/80 uppercase tracking-widest text-center">Quartos</span>
                  <span className="text-xs font-bold text-white text-center">{propertyData.rooms}</span>
                </div>
              )}

              {propertyData.beds > 0 && (
                <div className="flex flex-col items-center gap-1 group/char">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm group-hover/char:bg-white/90 transition-colors">
                    <BedDouble className="w-5 h-5 text-[#132014]" />
                  </div>
                  <span className="text-[8px] font-bold text-white/80 uppercase tracking-widest text-center">Suítes</span>
                  <span className="text-xs font-bold text-white text-center">{propertyData.beds}</span>
                </div>
              )}

              {propertyData.baths > 0 && (
                <div className="flex flex-col items-center gap-1 group/char">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm group-hover/char:bg-white/90 transition-colors">
                    <Bath className="w-5 h-5 text-[#132014]" />
                  </div>
                  <span className="text-[8px] font-bold text-white/80 uppercase tracking-widest text-center">Banh.</span>
                  <span className="text-xs font-bold text-white text-center">{propertyData.baths}</span>
                </div>
              )}

              {propertyData.hasLavabo && (
                <div className="flex flex-col items-center gap-1 group/char">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm group-hover/char:bg-white/90 transition-colors">
                    <Droplets className="w-5 h-5 text-[#132014]" />
                  </div>
                  <span className="text-[8px] font-bold text-white/80 uppercase tracking-widest text-center">Lavabo</span>
                  <span className="text-xs font-bold text-white text-center">Sim</span>
                </div>
              )}

              {propertyData.parking > 0 && (
                <div className="flex flex-col items-center gap-1 group/char">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm group-hover/char:bg-white/90 transition-colors">
                    <Car className="w-5 h-5 text-[#132014]" />
                  </div>
                  <span className="text-[8px] font-bold text-white/80 uppercase tracking-widest text-center">Vagas</span>
                  <span className="text-xs font-bold text-white text-center">{propertyData.parking}</span>
                </div>
              )}

              {propertyData.motoParking > 0 && (
                <div className="flex flex-col items-center gap-1 group/char">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm group-hover/char:bg-white/90 transition-colors">
                    <Bike className="w-5 h-5 text-[#132014]" />
                  </div>
                  <span className="text-[8px] font-bold text-white/80 uppercase tracking-widest text-center">Moto</span>
                  <span className="text-xs font-bold text-white text-center">{propertyData.motoParking}</span>
                </div>
              )}

              {propertyData.area && (
                <div className="flex flex-col items-center gap-1 group/char">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm group-hover/char:bg-white/90 transition-colors">
                    <Maximize className="w-5 h-5 text-[#132014]" />
                  </div>
                  <span className="text-[8px] font-bold text-white/80 uppercase tracking-widest text-center">Área</span>
                  <span className="text-xs font-bold text-white text-center">{propertyData.area}</span>
                </div>
              )}

              {propertyData.elevators > 0 && (
                <div className="flex flex-col items-center gap-1 group/char">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm group-hover/char:bg-white/90 transition-colors">
                    <ArrowUpRight className="w-5 h-5 text-[#132014]" />
                  </div>
                  <span className="text-[8px] font-bold text-white/80 uppercase tracking-widest text-center">Elev.</span>
                  <span className="text-xs font-bold text-white text-center">{propertyData.elevators}</span>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 p-8 bg-white border border-marromescuro/10 rounded-[32px] space-y-6">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs uppercase tracking-wider text-marromescuro font-helvetica font-bold">Valores do Investimento</span>
              <div className="flex items-center gap-2 relative">
                <button 
                  onClick={() => setShowShareOptions(!showShareOptions)}
                  className="py-2 px-2 hover:bg-terracota/10 rounded-full transition-colors group/share ml-0 mr-0"
                  title="Compartilhar"
                >
                  <Share2 className="w-6 h-6 text-terracota group-hover/share:scale-110 transition-all" />
                </button>

                <AnimatePresence>
                  {showShareOptions && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowShareOptions(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-marromescuro/5 p-2 z-50 overflow-hidden"
                      >
                        <button
                          onClick={handleShareWhatsApp}
                          className="w-full flex items-center gap-3 p-3 hover:bg-marromescuro/5 rounded-xl transition-colors text-marromescuro font-medium text-sm"
                        >
                          <div className="p-2 bg-green-500/10 rounded-lg">
                            <MessageCircle className="w-4 h-4 text-green-600" />
                          </div>
                          WhatsApp
                        </button>
                        <button
                          onClick={handleShareFacebook}
                          className="w-full flex items-center gap-3 p-3 hover:bg-marromescuro/5 rounded-xl transition-colors text-marromescuro font-medium text-sm"
                        >
                          <div className="p-2 bg-blue-600/10 rounded-lg">
                            <Facebook className="w-4 h-4 text-blue-600" />
                          </div>
                          Facebook
                        </button>
                        <button
                          onClick={handleShareInstagram}
                          className="w-full flex items-center gap-3 p-3 hover:bg-marromescuro/5 rounded-xl transition-colors text-marromescuro font-medium text-sm"
                        >
                          <div className="p-2 bg-pink-600/10 rounded-lg">
                            <Instagram className="w-4 h-4 text-pink-600" />
                          </div>
                          Instagram
                        </button>
                        <button
                          onClick={handleCopyLink}
                          className="w-full flex items-center gap-3 p-3 hover:bg-marromescuro/5 rounded-xl transition-colors text-marromescuro font-medium text-sm"
                        >
                          <div className="p-2 bg-marromescuro/5 rounded-lg">
                            {copied ? <Check className="w-4 h-4 text-green-600" /> : <LinkIcon className="w-4 h-4 text-marromescuro" />}
                          </div>
                          {copied ? 'Copiado!' : 'Copiar Link'}
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>

                <button 
                  onClick={(e) => toggleFavorite(property.id, 'property', e)}
                  className="p-2 hover:bg-terracota/10 rounded-full transition-colors group/fav"
                  title="Favoritar"
                >
                  <Heart 
                    className={`w-6 h-6 transition-all ${favorites.includes(String(property.id)) ? 'fill-marromescuro text-marromescuro' : 'text-terracota fill-terracota/10 group-hover/fav:fill-terracota/30'}`} 
                  />
                </button>
              </div>
            </div>

            {/* Tabs Section */}
            <div className="space-y-4">
              <div className="flex p-1 bg-[#617964]/5 border border-[#617964]/20 rounded-2xl">
                {property.listingType === 'aluguel' ? (
                  <>
                    <button 
                      onClick={() => setActivePriceTab(0)}
                      className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all ${activePriceTab === 0 ? 'bg-[#617964] text-white shadow-sm' : 'text-marromescuro/40 hover:text-marromescuro/60'}`}
                    >
                      Aluguel
                    </button>
                    <button 
                      onClick={() => setActivePriceTab(1)}
                      className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all ${activePriceTab === 1 ? 'bg-[#617964] text-white shadow-sm' : 'text-marromescuro/40 hover:text-marromescuro/60'}`}
                    >
                      Mensal
                    </button>
                    <button 
                      onClick={() => setActivePriceTab(2)}
                      className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all ${activePriceTab === 2 ? 'bg-[#617964] text-white shadow-sm' : 'text-marromescuro/40 hover:text-marromescuro/60'}`}
                    >
                      Total
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => setActivePriceTab(0)}
                      className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all ${activePriceTab === 0 ? 'bg-[#617964] text-white shadow-sm' : 'text-marromescuro/40 hover:text-marromescuro/60'}`}
                    >
                      Imóvel
                    </button>
                    <button 
                      onClick={() => setActivePriceTab(1)}
                      className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all ${activePriceTab === 1 ? 'bg-[#617964] text-white shadow-sm' : 'text-marromescuro/40 hover:text-marromescuro/60'}`}
                    >
                      Mensal
                    </button>
                    <button 
                      onClick={() => setActivePriceTab(2)}
                      className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all ${activePriceTab === 2 ? 'bg-[#617964] text-white shadow-sm' : 'text-marromescuro/40 hover:text-marromescuro/60'}`}
                    >
                      Anual
                    </button>
                  </>
                )}
              </div>

              <div className="space-y-1 min-h-[100px] flex flex-col justify-center p-4 bg-[#617964]/5 rounded-2xl border border-[#617964]/20">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePriceTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-xs uppercase tracking-wider text-marromescuro font-helvetica font-bold">
                      {property.listingType === 'aluguel' ? (
                        activePriceTab === 0 ? 'Valor para alugar' : activePriceTab === 1 ? 'IPTU+Seguro' : 'Total Mensal'
                      ) : (
                        activePriceTab === 0 ? 'Valor do Imóvel' : activePriceTab === 1 ? 'Condomínio' : 'Valor Anual (Total Estimado)'
                      )}
                    </span>
                    <h2 className="text-3xl font-bold text-marromescuro">
                      {property.listingType === 'aluguel' ? (
                        activePriceTab === 0 ? property.price : 
                        activePriceTab === 1 ? `R$ ${(((parseInt(property.iptu?.replace(/\D/g, '') || '0') || 0) + (parseInt(property.insurance?.replace(/\D/g, '') || '0') || 0)) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 
                        `R$ ${(((parseInt(property.price?.replace(/\D/g, '') || '0') || 0) + (parseInt(property.iptu?.replace(/\D/g, '') || '0') || 0) + (parseInt(property.insurance?.replace(/\D/g, '') || '0') || 0) + (parseInt(property.condoFee?.replace(/\D/g, '') || '0') || 0)) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      ) : (
                        activePriceTab === 0 ? property.price : 
                        activePriceTab === 1 ? (property.condoFee || 'R$ 0,00') : 
                        `R$ ${(((parseInt(property.price?.replace(/\D/g, '') || '0') || 0) + (parseInt(property.condoFee?.replace(/\D/g, '') || '0') || 0) * 12 + (parseInt(property.iptu?.replace(/\D/g, '') || '0') || 0)) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      )}
                    </h2>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex items-start gap-2 p-3 bg-[#617964]/5 rounded-xl border border-[#617964]/20">
                <Info className="w-3.5 h-3.5 text-marromescuro/30 shrink-0 mt-0.5" />
                <p className="text-[9px] text-marromescuro/60 leading-relaxed font-medium">
                  Valores sujeitos a variações sem aviso prévio. Taxas como condomínio e IPTU podem sofrer alterações.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => setIsScheduleModalOpen(true)}
                className="w-full py-4 bg-marromescuro text-white rounded-2xl font-bold hover:bg-marromescuro/90 transition-all shadow-xl shadow-marromescuro/10 flex items-center justify-center gap-3"
              >
                <div className="relative flex items-center justify-center">
                  <Home className="w-6 h-6" />
                  <div className="absolute inset-0 flex items-center justify-center pt-1">
                    <User className="w-3 h-3 text-white fill-white" />
                  </div>
                </div>
                Agendar visita
              </button>
              <button 
                onClick={() => navigate(`/proposta-compra/${property.id}`)}
                className="w-full py-4 bg-white text-marromescuro border border-marromescuro/10 rounded-2xl font-bold hover:bg-marromescuro/5 transition-all flex items-center justify-center gap-3 shadow-lg"
              >
                <FileText className="w-6 h-6 text-terracota" />
                Simular financiamento
              </button>

              {property.customButtons && property.customButtons.map((btn, idx) => (
                <a 
                  key={idx}
                  href={btn.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-marromescuro/5 text-marromescuro border border-marromescuro/10 rounded-2xl font-bold hover:bg-marromescuro/10 transition-all flex items-center justify-center gap-3"
                >
                  <ExternalLink className="w-5 h-5 text-terracota" />
                  {btn.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Description & Gallery */}
          <div className="lg:col-span-2 space-y-16">

            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-marromescuro">Sobre o imóvel</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <p className="text-xs font-bold text-marromescuro/40 uppercase tracking-widest">Informações do corretor associado</p>
                </div>
                <p className="text-marromescuro/70 leading-relaxed text-sm">
                  {property.description}
                </p>
                
                {/* Diferenciais Section */}
                {(propertyData.hasGourmetBalcony || propertyData.hasHeatedPool || propertyData.hasSauna) && (
                  <div className="pt-6 border-t border-marromescuro/5">
                    <p className="text-xs font-bold text-marromescuro/40 uppercase tracking-widest mb-4">Diferenciais</p>
                    <div className="flex flex-wrap gap-3">
                      {propertyData.hasGourmetBalcony && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-marromescuro/5 rounded-full text-marromescuro text-xs font-bold">
                          <UtensilsCrossed className="w-3 h-3 text-terracota" />
                          Varanda Gourmet
                        </div>
                      )}
                      {propertyData.hasHeatedPool && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-marromescuro/5 rounded-full text-marromescuro text-xs font-bold">
                          <Waves className="w-3 h-3 text-terracota" />
                          Piscina Aquecida
                        </div>
                      )}
                      {propertyData.hasSauna && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-marromescuro/5 rounded-full text-marromescuro text-xs font-bold">
                          <Wind className="w-3 h-3 text-terracota" />
                          Sauna
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Launch Information Section */}
                {property.listingType === 'lançamento' && (
                  <div className="pt-6 border-t border-marromescuro/5">
                    <div className="flex items-center justify-between mb-6">
                      <p className="text-xs font-bold text-marromescuro/40 uppercase tracking-widest">Informações do Empreendimento</p>
                      {property.projectLogoUrl && (
                        <img 
                          src={property.projectLogoUrl} 
                          alt="Logo do Empreendimento" 
                          className="h-12 w-auto object-contain"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {property.floors > 0 && (
                        <div className="p-4 bg-marromescuro/5 rounded-2xl">
                          <p className="text-[10px] font-bold text-marromescuro/40 uppercase tracking-widest mb-1">Andares</p>
                          <p className="text-lg font-bold text-marromescuro">{property.floors}</p>
                        </div>
                      )}
                      {property.units > 0 && (
                        <div className="p-4 bg-marromescuro/5 rounded-2xl">
                          <p className="text-[10px] font-bold text-marromescuro/40 uppercase tracking-widest mb-1">Unidades</p>
                          <p className="text-lg font-bold text-marromescuro">{property.units}</p>
                        </div>
                      )}
                      {property.frontUnits > 0 && (
                        <div className="p-4 bg-marromescuro/5 rounded-2xl">
                          <p className="text-[10px] font-bold text-marromescuro/40 uppercase tracking-widest mb-1">Aptos. Frente</p>
                          <p className="text-lg font-bold text-marromescuro">{property.frontUnits}</p>
                        </div>
                      )}
                      {property.backUnits > 0 && (
                        <div className="p-4 bg-marromescuro/5 rounded-2xl">
                          <p className="text-[10px] font-bold text-marromescuro/40 uppercase tracking-widest mb-1">Aptos. Fundos</p>
                          <p className="text-lg font-bold text-marromescuro">{property.backUnits}</p>
                        </div>
                      )}
                      {property.lateralUnits > 0 && (
                        <div className="p-4 bg-marromescuro/5 rounded-2xl">
                          <p className="text-[10px] font-bold text-marromescuro/40 uppercase tracking-widest mb-1">Aptos. Lateral</p>
                          <p className="text-lg font-bold text-marromescuro">{property.lateralUnits}</p>
                        </div>
                      )}
                      {property.penthouseUnits > 0 && (
                        <div className="p-4 bg-marromescuro/5 rounded-2xl">
                          <p className="text-[10px] font-bold text-marromescuro/40 uppercase tracking-widest mb-1">Aptos. Cobertura</p>
                          <p className="text-lg font-bold text-marromescuro">{property.penthouseUnits}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-marromescuro/10">
                  <Info className="w-5 h-5 text-marromescuro/30 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-marromescuro/40 leading-relaxed">
                    Estas informações refletem a opinião do corretor associado e não necessariamente da CR Imóveis, que não se responsabiliza por eventuais divergências ou prejuízos decorrentes do uso dessas informações.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-8">
              <h2 className="text-2xl font-bold text-marromescuro">Galeria Completa</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {property.images.slice(0, 5).map((img, idx) => (
                  <div 
                    key={idx} 
                    className="relative aspect-[4/3] rounded-2xl overflow-hidden group cursor-pointer"
                    onClick={() => {
                      setModalImageIndex(idx);
                      setIsModalOpen(true);
                    }}
                  >
                    <img 
                      src={img} 
                      alt={`Gallery ${idx}`} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
                {property.images.length > 5 && (
                  <div 
                    onClick={() => {
                      setModalImageIndex(5);
                      setIsModalOpen(true);
                    }}
                    className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-marromescuro/10 flex flex-col items-center justify-center text-marromescuro/30 gap-2 cursor-pointer hover:bg-marromescuro/5 transition-colors"
                  >
                    <div className="grid grid-cols-2 gap-1">
                      <div className="w-2 h-2 bg-marromescuro/20 rounded-sm"></div>
                      <div className="w-2 h-2 bg-marromescuro/20 rounded-sm"></div>
                      <div className="w-2 h-2 bg-marromescuro/20 rounded-sm"></div>
                      <div className="w-2 h-2 bg-marromescuro/20 rounded-sm"></div>
                    </div>
                    <span className="text-xs font-bold">+{property.images.length - 5}</span>
                    <span className="text-[10px] uppercase tracking-wider">Ver todas as fotos</span>
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-8">
              <h2 className="text-2xl font-bold text-marromescuro">Localização</h2>
              <div className="bg-linear-to-r from-[#132014] to-[#617964] p-8 rounded-[32px] shadow-sm border border-white/10 relative overflow-hidden">
                {/* Action Icons - Top Right */}
                <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
                  <button 
                    onClick={() => setIsMapModalOpen(true)}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm border border-white/10"
                    title="Ver localização exata"
                  >
                    <MapPin className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={(e) => condo && toggleFavorite(condo.id, 'condo', e)}
                    className={`p-3 rounded-full transition-all backdrop-blur-sm border border-white/10 ${
                      condo && favorites.includes(`condo_${condo.id}`) 
                        ? 'bg-brand-rust text-white border-brand-rust' 
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                    title="Favoritar condomínio"
                  >
                    <Heart className={`w-5 h-5 ${condo && favorites.includes(`condo_${condo.id}`) ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div 
                    className="rounded-3xl overflow-hidden shadow-2xl h-[400px] bg-gray-100 relative group"
                  >
                    <AnimatePresence mode="wait">
                      <motion.img 
                        key={locationImageIndex}
                        src={condo && condo.images && condo.images.length > 0 ? condo.images[locationImageIndex] : property.neighborhood.image} 
                        alt={condo ? condo.name : "Neighborhood"} 
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.6 }}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setIsMapModalOpen(true)}
                        referrerPolicy="no-referrer"
                      />
                    </AnimatePresence>

                    {condo && condo.images && condo.images.length > 1 && (
                      <>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocationImageIndex(prev => prev === 0 ? condo.images.length - 1 : prev - 1);
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/40 transition-all z-10"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocationImageIndex(prev => prev === condo.images.length - 1 ? 0 : prev + 1);
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/40 transition-all z-10"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                          {condo.images.map((_, idx) => (
                            <div 
                              key={idx}
                              className={`w-1.5 h-1.5 rounded-full transition-all ${idx === locationImageIndex ? 'bg-white w-4' : 'bg-white/40'}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="space-y-5 flex flex-col justify-center h-full">
                    <div className="space-y-3">
                      <h3 className="text-2xl md:text-3xl font-serif font-bold text-brand-cream italic tracking-tight pr-24">
                        {condo ? condo.name : property.neighborhood.title}
                      </h3>
                      <div className="relative">
                        <p className={`text-brand-cream/70 text-sm leading-relaxed ${!isNeighborhoodExpanded ? 'line-clamp-3 md:line-clamp-4' : ''}`}>
                          {condo ? condo.bio : property.neighborhood.description}
                        </p>
                        {condo ? (
                          <Link 
                            to={`/condominio/${condo.id}`}
                            className="text-[#E5D19E] text-xs font-bold hover:text-white transition-colors mt-2 flex items-center gap-1"
                          >
                            Ler mais sobre o condomínio
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        ) : (
                          <button 
                            onClick={() => setIsNeighborhoodExpanded(!isNeighborhoodExpanded)}
                            className="text-[#E5D19E] text-xs font-bold hover:text-white transition-colors mt-2 flex items-center gap-1"
                          >
                            {isNeighborhoodExpanded ? 'Ler menos' : 'Ler mais'}
                            <motion.div
                              animate={{ rotate: isNeighborhoodExpanded ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <ChevronRight className="w-3 h-3 rotate-90" />
                            </motion.div>
                          </button>
                        )}
                      </div>
                    </div>

                    {condo && condo.leisure && condo.leisure.length > 0 && (
                      <div className="flex flex-wrap gap-4 pt-2">
                        {condo.leisure.slice(0, 5).map((item, index) => {
                          const lowerItem = item.toLowerCase();
                          let Icon = Info;
                          if (lowerItem.includes('piscina')) Icon = Waves;
                          if (lowerItem.includes('academia') || lowerItem.includes('fitness')) Icon = Dumbbell;
                          if (lowerItem.includes('churrasqueira') || lowerItem.includes('gourmet')) Icon = UtensilsCrossed;
                          if (lowerItem.includes('sauna')) Icon = Droplets;
                          if (lowerItem.includes('bicicletário')) Icon = Bike;
                          
                          return (
                            <div key={index} className="flex flex-col items-center gap-1 group">
                              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-brand-cream group-hover:bg-white/20 transition-colors border border-white/5">
                                <Icon className="w-5 h-5" />
                              </div>
                              <span className="text-[8px] text-brand-cream/60 font-bold uppercase tracking-tighter text-center max-w-[60px] leading-none">{item}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {!condo && (
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-brand-cream/40 uppercase tracking-widest">Gastronomia</p>
                          <p className="text-xs text-brand-cream/70 font-medium">{property.neighborhood.gastronomy}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-brand-cream/40 uppercase tracking-widest">Clubes</p>
                          <p className="text-xs text-brand-cream/70 font-medium">{property.neighborhood.clubs}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Sidebar */}
          <div className="space-y-6">
            {/* Agent Card */}
            <div className="bg-white rounded-3xl border border-marromescuro/10 shadow-xl p-8 space-y-6 text-center sticky top-40">
              <div 
                className="relative w-24 h-24 mx-auto group/agent"
                onMouseEnter={() => setIsAgentHovered(true)}
                onMouseLeave={() => setIsAgentHovered(false)}
              >
                {/* Tooltip Message (Speech Bubble Style) */}
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: isAgentHovered ? 1 : 0, y: isAgentHovered ? 0 : 5 }}
                  className={`absolute -top-16 left-1/2 -translate-x-1/2 w-40 ${offline ? 'bg-gray-500' : 'bg-[#25D366]'} text-white text-[11px] p-3 rounded-2xl rounded-bl-none shadow-2xl pointer-events-none z-50 transition-all duration-300`}
                >
                  <div className="relative font-bold leading-tight">
                    {offline ? 'Oi! Deixe sua mensagem que te respondo logo!' : `Oi! Sou a ${property.agent.name.split(' ')[0]}, fale comigo agora!`}
                    {/* Speech Bubble Tail */}
                    <div className={`absolute -bottom-5 left-0 border-[10px] border-transparent ${offline ? 'border-t-gray-500' : 'border-t-[#25D366]'} border-l-transparent`}></div>
                  </div>
                </motion.div>

                <img 
                  src={property.agent.image} 
                  alt={property.agent.name} 
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-0 right-0 w-6 h-6">
                  {!offline && <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-75"></div>}
                  <div className={`relative w-full h-full ${offline ? 'bg-gray-400' : 'bg-[#25D366]'} rounded-full border-4 border-white ${offline ? '' : 'shadow-[0_0_10px_rgba(37,211,102,0.5)]'}`}></div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-marromescuro">{property.agent.name}</h3>
                <p className="text-xs text-marromescuro/40 font-medium">{property.agent.role}</p>
                {property.agent.creci && (
                  <p className="text-[10px] text-marromescuro/30 font-bold mt-1 uppercase tracking-widest">CRECI: {property.agent.creci}</p>
                )}
              </div>
              {property.agent.instagram && (
                <div className="flex justify-center">
                  <button 
                    onClick={() => window.open(`https://instagram.com/${property.agent.instagram}`, '_blank')}
                    className="flex items-center gap-2 text-xs font-bold text-marromescuro/50 hover:text-terracota transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                    @{property.agent.instagram}
                  </button>
                </div>
              )}
              <p className="text-xs text-marromescuro/60 leading-relaxed">
                Conte com atendimento consultivo e total discrição para encontrar o imóvel ideal.
              </p>
              
              <button 
                onClick={() => navigate(`/corretor/${property.agent.id}`)}
                className="w-full py-2 text-xs font-black text-terracota hover:text-marromescuro transition-colors uppercase tracking-widest flex items-center justify-center gap-2 group/profile"
              >
                Ver Perfil Completo
                <ChevronRight className="w-3 h-3 transition-transform group-hover/profile:translate-x-1" />
              </button>

              <div className="space-y-3">
                <button 
                  onClick={() => window.open(`https://wa.me/${property.agent.phone.replace(/\D/g, '')}`, '_blank')}
                  className="w-full py-4 bg-terracota text-white rounded-xl font-bold hover:bg-terracota/90 transition-all shadow-lg shadow-terracota/20"
                >
                  Falar com {property.agent.name.split(' ')[0]}
                </button>
                <button 
                  onClick={() => window.location.href = 'mailto:contato@crimoveis.com.br'}
                  className="w-full py-4 bg-white text-marromescuro border border-marromescuro/5 rounded-xl font-bold hover:bg-marromescuro/5 transition-all flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Falar com a CR
                </button>
              </div>
            </div>

            {/* Financing Card Removed */}
          </div>
        </div>

        {/* Related Properties */}
        <section className="mt-24 space-y-12">
          <h2 className="text-2xl font-helvetica font-bold text-marromescuro">Quem viu este imóvel também se interessou por esses:</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {RELATED_PROPERTIES.map((prop) => (
              <PropertyCard 
                key={prop.id} 
                prop={prop}
                onClick={() => {
                  navigate(`/imovel/${prop.id}`);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                isFavorite={favorites.includes(prop.id)}
                onToggleFavorite={(e) => toggleFavorite(prop.id, 'property', e)}
              />
            ))}
          </div>
        </section>

        {/* Recent Discoveries */}
        <section className="mt-24 space-y-12">
          <h2 className="text-2xl font-helvetica font-bold text-marromescuro">Ainda pensando neles? <span className="text-marromescuro/40 font-sans font-normal">Revisite suas últimas descobertas</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {RELATED_PROPERTIES.map((prop) => (
              <PropertyCard 
                key={prop.id} 
                prop={prop}
                onClick={() => {
                  navigate(`/imovel/${prop.id}`);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                isFavorite={favorites.includes(String(prop.id))}
                onToggleFavorite={(e) => toggleFavorite(prop.id, 'property', e)}
              />
            ))}
          </div>
        </section>

      </div>

        {/* Scheduling Modal */}
        {/* Floor Plan Modal */}
        <AnimatePresence>
          {isFloorPlanModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <button 
                onClick={() => setIsFloorPlanModalOpen(false)}
                className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-50"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative w-full max-w-5xl aspect-[4/3] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-marromescuro">Plantas do Imóvel</h3>
                    <p className="text-xs text-marromescuro/40">Visualizando planta {modalFloorPlanIndex + 1} de {(property.floorPlanUrls || [property.floorPlanUrl]).length}</p>
                  </div>
                </div>

                <div className="flex-1 relative bg-white p-8">
                  <img 
                    src={(property.floorPlanUrls || [property.floorPlanUrl])[modalFloorPlanIndex]} 
                    alt="Planta" 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                  
                  {(property.floorPlanUrls || [property.floorPlanUrl]).length > 1 && (
                    <>
                      <button 
                        onClick={() => setModalFloorPlanIndex(prev => prev > 0 ? prev - 1 : (property.floorPlanUrls || []).length - 1)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-marromescuro/5 hover:bg-marromescuro/10 text-marromescuro rounded-full transition-all"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button 
                        onClick={() => setModalFloorPlanIndex(prev => prev < (property.floorPlanUrls || []).length - 1 ? prev + 1 : 0)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-marromescuro/5 hover:bg-marromescuro/10 text-marromescuro rounded-full transition-all"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>

                {(property.floorPlanUrls || []).length > 1 && (
                  <div className="p-6 bg-gray-50 flex justify-center gap-4 overflow-x-auto">
                    {(property.floorPlanUrls || []).map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => setModalFloorPlanIndex(idx)}
                        className={`w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${modalFloorPlanIndex === idx ? 'border-brand-rust scale-105' : 'border-transparent opacity-50'}`}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 360 Tour Modal */}
        <AnimatePresence>
          {isTour360ModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <button 
                onClick={() => setIsTour360ModalOpen(false)}
                className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-50"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative w-full max-w-6xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl">
                <iframe 
                  src={property.tour360Url} 
                  className="w-full h-full border-none"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isScheduleModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsScheduleModalOpen(false)}
                className="absolute inset-0 bg-marromescuro/60 backdrop-blur-sm"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-[32px] overflow-hidden shadow-2xl"
              >
                {/* Header */}
                <div className="bg-brand-rust p-6 text-white flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Agendar Visita</h3>
                      <p className="text-white/70 text-xs">Passo {scheduleStep} de 2</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsScheduleModalOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-8">
                  {scheduleStep === 1 ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-marromescuro/50 uppercase tracking-wider ml-1">Data da Visita</label>
                          <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-marromescuro/30" />
                            <input 
                              type="date" 
                              value={scheduleData.date}
                              onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                              className="w-full pl-12 pr-4 py-4 bg-white border border-marromescuro/10 rounded-2xl focus:ring-2 focus:ring-brand-rust/20 transition-all text-marromescuro font-medium"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-marromescuro/50 uppercase tracking-wider ml-1">Horário</label>
                          <div className="relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-marromescuro/30" />
                            <input 
                              type="time" 
                              value={scheduleData.time}
                              onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })}
                              className="w-full pl-12 pr-4 py-4 bg-white border border-marromescuro/10 rounded-2xl focus:ring-2 focus:ring-brand-rust/20 transition-all text-marromescuro font-medium"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-4">
                        <div className="p-2 bg-amber-100 rounded-xl h-fit">
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                        </div>
                        <p className="text-xs text-amber-800 leading-relaxed font-medium">
                          As datas disponíveis podem variar. A próxima data disponível será confirmada pelo corretor junto ao proprietário.
                        </p>
                      </div>

                      <button
                        onClick={handleScheduleNext}
                        disabled={!scheduleData.date || !scheduleData.time}
                        className="w-full py-4 bg-brand-rust text-white rounded-2xl font-bold shadow-xl hover:bg-brand-rust/90 transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>Continuar</span>
                        <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleScheduleSubmit} className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-marromescuro/50 uppercase tracking-wider ml-1">Nome Completo</label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-marromescuro/30" />
                            <input 
                              required
                              type="text" 
                              placeholder="Seu nome completo"
                              value={scheduleData.name}
                              onChange={(e) => setScheduleData({ ...scheduleData, name: e.target.value })}
                              className="w-full pl-12 pr-4 py-4 bg-marromescuro/5 border-none rounded-2xl focus:ring-2 focus:ring-brand-rust/20 transition-all text-marromescuro font-medium"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-marromescuro/50 uppercase tracking-wider ml-1">E-mail</label>
                            <div className="relative">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-marromescuro/30" />
                              <input 
                                required
                                type="email" 
                                placeholder="seu@email.com"
                                value={scheduleData.email}
                                onChange={(e) => setScheduleData({ ...scheduleData, email: e.target.value })}
                                className="w-full pl-12 pr-4 py-4 bg-marromescuro/5 border-none rounded-2xl focus:ring-2 focus:ring-brand-rust/20 transition-all text-marromescuro font-medium"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-marromescuro/50 uppercase tracking-wider ml-1">Telefone</label>
                            <div className="relative">
                              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-marromescuro/30" />
                              <input 
                                required
                                type="tel" 
                                placeholder="(00) 00000-0000"
                                value={scheduleData.phone}
                                onChange={(e) => setScheduleData({ ...scheduleData, phone: formatPhone(e.target.value) })}
                                className="w-full pl-12 pr-4 py-4 bg-white border border-marromescuro/10 rounded-2xl focus:ring-2 focus:ring-brand-rust/20 transition-all text-marromescuro font-medium"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-marromescuro/50 uppercase tracking-wider ml-1">Onde quer nos encontrar?</label>
                          <div className="grid grid-cols-2 gap-4">
                            <button
                              type="button"
                              onClick={() => setScheduleData({ ...scheduleData, location: 'property' })}
                              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 text-center ${scheduleData.location === 'property' ? 'border-brand-rust bg-brand-rust/5 text-brand-rust' : 'border-marromescuro/5 text-marromescuro/40 hover:border-marromescuro/10'}`}
                            >
                              <MapPin className="w-6 h-6" />
                              <span className="text-xs font-bold">No endereço do imóvel</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setScheduleData({ ...scheduleData, location: 'office' })}
                              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 text-center ${scheduleData.location === 'office' ? 'border-brand-rust bg-brand-rust/5 text-brand-rust' : 'border-marromescuro/5 text-marromescuro/40 hover:border-marromescuro/10'}`}
                            >
                              <Building2 className="w-6 h-6" />
                              <span className="text-xs font-bold">Na imobiliária</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-marromescuro/5 rounded-2xl cursor-pointer hover:bg-marromescuro/10 transition-colors" onClick={() => setAgreedToTerms(!agreedToTerms)}>
                          <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${agreedToTerms ? 'bg-brand-rust border-brand-rust' : 'border-marromescuro/20 bg-white'}`}>
                            {agreedToTerms && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <div className="flex-1 text-xs text-marromescuro/70 leading-relaxed">
                            Declaro que li e concordo com o{' '}
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowTermsModal(true);
                              }}
                              className="text-brand-rust font-bold hover:underline"
                            >
                              termo de responsabilidade
                            </button>
                            {' '}para o agendamento.
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setScheduleStep(1)}
                          className="flex-1 py-4 bg-marromescuro/5 text-marromescuro rounded-2xl font-bold hover:bg-marromescuro/10 transition-all"
                        >
                          Voltar
                        </button>
                        <button
                          type="submit"
                          disabled={!agreedToTerms}
                          className="flex-[2] py-4 bg-brand-rust text-white rounded-2xl font-bold shadow-xl hover:bg-brand-rust/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Confirmar Agendamento
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Terms of Responsibility Modal */}
        <AnimatePresence>
          {showTermsModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowTermsModal(false)}
                className="absolute inset-0 bg-marromescuro/80 backdrop-blur-md"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-2xl bg-white rounded-[32px] overflow-hidden shadow-2xl max-h-[80vh] flex flex-col"
              >
                <div className="p-6 border-b border-marromescuro/5 flex items-center justify-between bg-marromescuro/5">
                  <h3 className="font-bold text-marromescuro">Termo de Responsabilidade</h3>
                  <button 
                    onClick={() => setShowTermsModal(false)}
                    className="p-2 hover:bg-marromescuro/10 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-marromescuro" />
                  </button>
                </div>
                
                <div className="p-8 overflow-y-auto custom-scrollbar text-sm text-marromescuro/80 leading-relaxed space-y-6">
                  <h4 className="font-bold text-marromescuro text-center uppercase tracking-wider">
                    TERMO DE RESPONSABILIDADE PARA AGENDAMENTO DE VISITA IMOBILIÁRIA
                  </h4>
                  
                  <p>
                    Ao realizar o agendamento de visita a um imóvel por meio deste site, o(a) cliente declara estar ciente e de acordo com as condições abaixo:
                  </p>
                  
                  <div className="space-y-4">
                    <section>
                      <h5 className="font-bold text-marromescuro">1. Compromisso com o agendamento</h5>
                      <p>O(a) cliente se compromete a estar disponível na data e horário selecionados para a visita ao imóvel, conforme previamente agendado.</p>
                    </section>
                    
                    <section>
                      <h5 className="font-bold text-marromescuro">2. Cancelamento ou reagendamento</h5>
                      <p>Em caso de impossibilidade de comparecimento, o(a) cliente deverá comunicar o cancelamento ou solicitar o reagendamento com antecedência mínima de 24 horas antes do horário marcado.</p>
                    </section>
                    
                    <section>
                      <h5 className="font-bold text-marromescuro">3. Confirmação do agendamento</h5>
                      <p>O agendamento estará sujeito à confirmação no dia da visita. Nossa equipe entrará em contato previamente, por meio do aplicativo WhatsApp, para validar a presença do(a) cliente.</p>
                    </section>
                    
                    <section>
                      <h5 className="font-bold text-marromescuro">4. Falta de confirmação</h5>
                      <p>Caso não haja retorno à tentativa de contato para confirmação, o agendamento poderá ser automaticamente cancelado.</p>
                    </section>
                    
                    <section>
                      <h5 className="font-bold text-marromescuro">5. Pontualidade</h5>
                      <p>Solicitamos que o(a) cliente esteja disponível no horário combinado. Atrasos poderão impactar a realização da visita e/ou exigir novo agendamento.</p>
                    </section>
                    
                    <section>
                      <h5 className="font-bold text-marromescuro">6. Concordância</h5>
                      <p>Ao prosseguir com o agendamento, o(a) cliente declara que leu, compreendeu e concorda com os termos acima estabelecidos.</p>
                    </section>
                  </div>
                </div>
                
                <div className="p-6 border-t border-marromescuro/5 bg-marromescuro/5 flex justify-end">
                  <button
                    onClick={() => {
                      setAgreedToTerms(true);
                      setShowTermsModal(false);
                    }}
                    className="px-8 py-3 bg-brand-rust text-white rounded-xl font-bold hover:bg-brand-rust/90 transition-all"
                  >
                    Entendido e Concordo
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Map Modal */}
        <AnimatePresence>
          {isMapModalOpen && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMapModalOpen(false)}
                className="absolute inset-0 bg-marromescuro/95 backdrop-blur-xl"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-6xl aspect-video bg-white rounded-[40px] overflow-hidden shadow-2xl flex flex-col"
              >
                <div className="p-6 border-b border-marromescuro/5 flex justify-between items-center bg-white">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-marromescuro/5 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-terracota" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-marromescuro">Localização Exata</h3>
                      <p className="text-xs text-marromescuro/40 font-medium uppercase tracking-widest">{property.location}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsMapModalOpen(false)}
                    className="p-3 hover:bg-marromescuro/5 rounded-full transition-colors text-marromescuro"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="flex-1 bg-gray-100 relative">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    loading="lazy" 
                    allowFullScreen 
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(property.location)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                    title="Localização do Imóvel"
                  />
                  
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-8 right-8 bg-white px-8 py-4 rounded-2xl text-xs font-bold text-marromescuro shadow-2xl hover:bg-gray-50 transition-all flex items-center gap-3 border border-marromescuro/10"
                  >
                    <ExternalLink className="w-4 h-4 text-terracota" />
                    ABRIR NO GOOGLE MAPS COMPLETO
                  </a>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Success Modal */}
        <AnimatePresence>
          {showSuccessModal && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSuccessModal(false)}
                className="absolute inset-0 bg-marromescuro/80 backdrop-blur-md"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm bg-white rounded-[40px] p-10 text-center shadow-2xl"
              >
                <div className="mb-8 flex justify-center">
                  <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                      <Check className="w-10 h-10 text-white stroke-[3]" />
                    </div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-helvetica font-bold text-marromescuro mb-4">
                  Agendamento Confirmado!
                </h3>
                
                <p className="text-marromescuro/60 text-sm leading-relaxed mb-8">
                  Ficamos felizes com seu interesse. Nosso time entrará em contato o mais breve possível para validar os detalhes da sua visita.
                </p>
                
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full py-4 bg-brand-rust text-white rounded-2xl font-bold shadow-xl hover:bg-brand-rust/90 transition-all"
                >
                  Entendido
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
  );
}
