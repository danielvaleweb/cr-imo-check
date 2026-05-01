import { motion, AnimatePresence, useInView } from 'motion/react';
import { Diamond, ArrowDown, Play, Pause, ChevronLeft, ChevronRight, MapPin, MessageCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import GalleryItem from '../components/GalleryItem';
import PremiumSlider from '../components/PremiumSlider';
import Testimonials from '../components/Testimonials';
import { CATEGORIES } from '../constants/categories';
import { useNavigate } from 'react-router-dom';
import { useProperties } from '../context/PropertyContext';
import { useBrokers } from '../context/BrokerContext';
import { PartnersSection } from '../components/PartnersSection';

const TypewriterVerse = () => {
  const text = '"Mas busquem em primeiro lugar o Reino de Deus e a sua justiça, e todas estas coisas lhes serão acrescentadas"';
  const [displayedText, setDisplayedText] = useState('');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedText(text.slice(0, i + 1));
        i++;
        if (i >= text.length) clearInterval(interval);
      }, 40);
      return () => clearInterval(interval);
    }
  }, [isInView]);

  return (
    <p ref={ref} className="font-script text-3xl md:text-4xl text-marromescuro/80 italic mb-4 min-h-[90px] md:min-h-[80px]">
      {displayedText}
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="inline-block w-[2px] h-[1em] bg-marromescuro/80 ml-1 align-middle"
      />
    </p>
  );
};

export default function Home() {
  const navigate = useNavigate();
  const { publishedProperties: properties } = useProperties();
  const { brokers } = useBrokers();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isGalleryPaused, setIsGalleryPaused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Use properties for slides, fallback to empty if none
  // Reverse to show latest properties first
  // Show only the primary image of each property
  const latestProperties = [...properties].reverse();
  const slides = latestProperties.length > 0 ? latestProperties.map(p => ({
    id: p.id,
    image: p.images && p.images.length > 0 && p.images[0] !== '' ? p.images[0] : p.image,
    title: p.title,
    subtitle: p.location
  })) : [];

  const renderGalleryGroup = (items: any[]) => {
    const groups = [];
    for (let i = 0; i < items.length; i += 6) {
      const group = items.slice(i, i + 6);
      groups.push(
        <div key={`group-${i}`} className="flex gap-4 md:gap-6 items-center pr-4 md:pr-6">
          {group[0] && <GalleryItem src={group[0].image} className="w-[45vw] md:w-[400px] aspect-[9/16] md:aspect-auto md:h-[450px] shrink-0 snap-center" onClick={() => handleGalleryClick(i + 0)} />}
          {group.length > 1 && (
            <div className="flex flex-row md:flex-col gap-4 md:gap-6 shrink-0">
              {group[1] && <GalleryItem src={group[1].image} className="w-[45vw] md:w-[350px] aspect-[9/16] md:aspect-auto md:h-[213px] shrink-0 snap-center" onClick={() => handleGalleryClick(i + 1)} />}
              {group[2] && <GalleryItem src={group[2].image} className="w-[45vw] md:w-[350px] aspect-[9/16] md:aspect-auto md:h-[213px] shrink-0 snap-center" onClick={() => handleGalleryClick(i + 2)} />}
            </div>
          )}
          {group[3] && <GalleryItem src={group[3].image} className="w-[45vw] md:w-[320px] aspect-[9/16] md:aspect-auto md:h-[450px] shrink-0 snap-center" onClick={() => handleGalleryClick(i + 3)} />}
          {group.length > 4 && (
            <div className="flex flex-row md:flex-col gap-4 md:gap-6 shrink-0">
              {group[4] && <GalleryItem src={group[4].image} className="w-[45vw] md:w-[340px] aspect-[9/16] md:aspect-auto md:h-[213px] shrink-0 snap-center" onClick={() => handleGalleryClick(i + 4)} />}
              {group[5] && <GalleryItem src={group[5].image} className="w-[45vw] md:w-[340px] aspect-[9/16] md:aspect-auto md:h-[213px] shrink-0 snap-center" onClick={() => handleGalleryClick(i + 5)} />}
            </div>
          )}
        </div>
      );
    }
    return groups;
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth, scrollWidth } = scrollContainerRef.current;
      const maxScroll = scrollWidth - clientWidth;
      
      let scrollTo;
      if (direction === 'left') {
        if (scrollLeft <= 10) { // Near the start
          scrollTo = maxScroll;
        } else {
          scrollTo = scrollLeft - clientWidth / 2;
        }
      } else {
        if (scrollLeft >= maxScroll - 10) { // Near the end
          scrollTo = 0;
        } else {
          scrollTo = scrollLeft + clientWidth / 2;
        }
      }
      
      scrollContainerRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 9000);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const handleGalleryClick = (index: number) => {
    if (slides[index]) {
      navigate(`/imovel/${slides[index].id}`);
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            {slides.length > 0 && (
              <motion.div 
                key={activeSlide}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <img 
                  src={slides[activeSlide]?.image} 
                  alt={slides[activeSlide]?.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Bottom Gradient Overlay */}
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-white to-transparent pointer-events-none z-1" />
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-6">
          <div className="absolute bottom-8 flex flex-col items-center gap-2 text-[#2D1B0D] opacity-80 animate-bounce">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Role para explorar</span>
            <ArrowDown className="w-5 h-5" />
          </div>

          <div className="absolute bottom-12 right-6 md:right-12">
            <button 
              onClick={() => setIsPaused(!isPaused)}
              className="bg-white/10 backdrop-blur-md p-3 rounded-full text-white/90 hover:bg-white/20 transition-all border border-white/20 shadow-xl"
            >
              {isPaused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5 fill-current" />}
            </button>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="bg-white pt-20 pb-10 overflow-hidden">
        <div className="max-w-[1800px] mx-auto px-6 mb-6">
          <div className="flex items-center gap-3 text-brand-dark">
            <div className="bg-linear-to-br from-[#617964] to-[#617964] p-2 rounded-lg shadow-sm border border-white/20">
              <Diamond className="w-5 h-5 text-[#E5D19E]" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-medium opacity-70">Imóveis destaque que</span>
              <span className="text-sm font-bold uppercase tracking-wider text-brand-rust">Acabaram de chegar!</span>
            </div>
          </div>
        </div>

        <div className="relative flex overflow-x-auto md:overflow-visible no-scrollbar snap-x snap-mandatory md:snap-none">
          <div 
            className={`flex w-max animate-infinite-scroll ${isGalleryPaused ? 'pause-animation' : ''}`}
            onMouseEnter={() => setIsGalleryPaused(true)}
            onMouseLeave={() => setIsGalleryPaused(false)}
            onTouchStart={() => setIsGalleryPaused(true)}
            onTouchEnd={() => setIsGalleryPaused(false)}
          >
            {/* Render the actual items */}
            {renderGalleryGroup(slides)}
            {/* Duplicate for infinite scroll */}
            {renderGalleryGroup(slides)}
            {/* Triplicate for smoother infinite scroll on large screens */}
            {renderGalleryGroup(slides)}
          </div>
        </div>
      </section>
      
      <section className="bg-white pb-20 pl-0 md:pl-10 flex items-center relative">
        <div className="w-full max-w-[1850px] ml-auto relative">
          {/* Plant Decoration - Now relative to the menu container */}
          <div className="absolute left-[-200px] bottom-[-10px] z-30 pointer-events-none hidden xl:block">
            <motion.img 
              initial={{ opacity: 0, x: -150 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              src="https://i.imgur.com/E2ufewr.png" 
              alt="Plant decoration" 
              className="w-[500px] h-auto select-none"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="relative bg-gradient-to-r from-[#132014] to-[#617964] rounded-l-[40px] md:rounded-l-[100px] py-8 px-8 md:py-10 md:px-16 flex flex-col md:flex-row items-center gap-10 md:gap-16 shadow-2xl">
            {/* Title Section */}
            <div className="flex flex-col w-full md:w-auto text-center md:text-left min-w-0 md:min-w-[200px] shrink-0">
              <span className="text-[#FFE39D]/90 text-lg md:text-[26px] font-medium leading-tight pl-0 md:pl-[52px] md:pr-[-5px] md:pt-[4px] ml-0 md:ml-[10px] md:mr-[13px] md:mt-[-3px] md:mb-[-12px]">O que você está</span>
              <h2 className="text-[#FFE39D] text-2xl md:text-4xl font-bold leading-tight pl-0 md:pl-[59px] ml-0 md:ml-[9px] md:mr-[-22px] mb-0">procurando?</h2>
            </div>

            {/* Categories Wrapper for Mobile Layout - Using md:contents to restore original desktop spacing */}
            <div className="flex items-center w-full md:contents gap-2 md:gap-0">
              {/* Navigation Left */}
              <button 
                onClick={() => scroll('left')}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-full text-[#FFE39D] transition-all z-20 cursor-pointer pt-[8px] ml-0 md:ml-[-14px] shrink-0"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Categories */}
              <div 
                ref={scrollContainerRef}
                className="flex-1 flex items-center md:items-end gap-6 md:gap-2 overflow-x-auto no-scrollbar py-6 md:py-0 md:pb-[7px] md:ml-[-43px] md:w-[1196.83px] md:h-[111.5px] scroll-smooth"
              >
                {CATEGORIES.map((item) => (
                  <button 
                    key={item.id} 
                    onClick={() => navigate(`/categoria/${item.slug}`)}
                    className="flex flex-col items-center justify-center md:justify-end gap-4 md:gap-3 min-w-[110px] md:min-w-[130px] cursor-pointer shrink-0 transition-all group"
                  >
                    <div className="text-[#FFE39D] transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-2 md:group-hover:-translate-y-1 group-hover:drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)]">
                      <item.icon className="w-12 h-12 md:w-14 md:h-14 stroke-[1.2px] md:stroke-[1.5px]" />
                    </div>
                    <div className="text-center leading-tight transition-all duration-300 flex flex-col items-center group-hover:translate-y-[-2px]">
                      <p className="text-[#FFE39D]/70 text-[9px] md:text-[10px] uppercase tracking-wider group-hover:text-[#FFE39D] line-clamp-1">{item.label1}</p>
                      <p className="text-[#FFE39D] text-xs md:text-sm font-bold group-hover:text-[#FFE39D]/80 whitespace-nowrap">{item.label2}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Navigation Right */}
              <button 
                onClick={() => scroll('right')}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-full text-[#FFE39D] transition-all z-20 cursor-pointer shrink-0"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          </div>
        </section>
      
      <PremiumSlider />
      <Testimonials />

      {/* Verse Section */}
      <section className="bg-white pt-16 pb-4 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <style>
            {`
              @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap');
              .font-script { font-family: 'Dancing Script', cursive; }
            `}
          </style>
          <TypewriterVerse />
          <p className="text-marromescuro font-bold text-lg">Mateus 6:33</p>
        </div>
      </section>

      {/* Location Section */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex flex-col xl:flex-row xl:items-center gap-6 justify-between">
                <div className="space-y-4">
                  <h2 className="text-3xl md:text-5xl font-bold text-marromescuro tracking-tight">Nossa imobiliária</h2>
                  <p className="text-lg text-marromescuro/60 font-medium">Venha nos fazer uma visita e tomar um café conosco.</p>
                </div>
                
                {/* Overlapping Avatars (Cover Flow Style) */}
                <div className="flex items-center relative h-20 w-[240px] shrink-0 pb-[42px] pt-0 px-0">
                  {[...brokers]
                    .sort((a, b) => {
                      const aIsCEO = a.role.toLowerCase().includes('ceo') || a.role.toLowerCase().includes('diretor');
                      const bIsCEO = b.role.toLowerCase().includes('ceo') || b.role.toLowerCase().includes('diretor');
                      if (aIsCEO && !bIsCEO) return -1;
                      if (!aIsCEO && bIsCEO) return 1;
                      return 0;
                    })
                    .slice(0, 6)
                    .map((broker, index) => {
                      const positions = [
                        "left-16 z-50 w-16 h-16 border-[3px] border-[#617964] shadow-2xl scale-110 hover:scale-125 opacity-100", // 0: Center Left
                        "left-28 z-40 w-16 h-16 border-[3px] border-[#617964] shadow-xl scale-105 hover:scale-110 opacity-100", // 1: Center Right
                        "left-8 z-20 w-14 h-14 border-2 border-white shadow-md scale-95 hover:scale-105 opacity-90", // 2: Mid Left
                        "left-40 z-20 w-14 h-14 border-2 border-white shadow-md scale-95 hover:scale-105 opacity-90", // 3: Mid Right
                        "left-0 z-10 w-12 h-12 border-2 border-white shadow-sm scale-90 hover:scale-100 opacity-80", // 4: Back Left
                        "left-48 z-10 w-12 h-12 border-2 border-white shadow-sm scale-90 hover:scale-100 opacity-80", // 5: Back Right
                      ];
                      
                      const posClass = positions[index] || positions[positions.length - 1];
                      
                      return (
                        <div 
                          key={broker.id}
                          className={`absolute rounded-full overflow-visible transform hover:z-[60] hover:opacity-100 transition-all duration-300 group ${posClass}`}
                        >
                          <img src={broker.photo} alt={`${broker.name} - ${broker.role}`} className="w-full h-full object-cover rounded-full bg-gray-100" />
                          
                          {/* Custom Tooltip */}
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-marromescuro text-white text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-lg flex flex-col items-center">
                            <span className="font-bold">{broker.name}</span>
                            <span className="text-white/80 text-[10px]">{broker.role}</span>
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-marromescuro rotate-45"></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
              
              <div className="space-y-2 bg-marromescuro/5 p-8 rounded-[32px] border border-marromescuro/10">
                <h3 className="text-xl font-bold text-marromescuro flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-[#617964]" />
                  Endereço
                </h3>
                <p className="text-marromescuro/80 font-medium leading-relaxed pl-8">
                  R. Prof. Virgilio Pereira da Silva, 370<br />
                  Vina Del Mar, Juiz de Fora - MG<br />
                  CEP: 36037-720
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a 
                  href="https://www.google.com/maps/dir//''/data=!4m7!4m6!1m1!4e2!1m2!1m1!1s0x989bd5a25fab87:0x5644e0c1399c88ed!3e0?g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYASAA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-marromescuro text-white px-8 py-4 rounded-2xl font-bold hover:bg-marromescuro/90 transition-all shadow-xl text-center flex items-center justify-center gap-2"
                >
                  <MapPin className="w-5 h-5" />
                  Me leve até lá
                </a>
                <a 
                  href="https://wa.me/5532999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-[#25D366] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#25D366]/90 transition-all shadow-xl text-center flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Nosso whatsapp
                </a>
              </div>
            </div>

            <div className="w-full h-[450px] lg:h-[500px] rounded-[32px] overflow-hidden shadow-xl border border-marromescuro/5">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d231.56330324088535!2d-43.40570320773288!3d-21.779763607186677!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x989bd5a25fab87%3A0x5644e0c1399c88ed!2sR.%20Prof.%20Virgilio%20Pereira%20da%20Silva%2C%20370%20-%20Vina%20Del%20Mar%2C%20Juiz%20de%20Fora%20-%20MG%2C%2036037-720!5e0!3m2!1spt-BR!2sbr!4v1776010855030!5m2!1spt-BR!2sbr" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      <PartnersSection />

      </div>
    );
  }
