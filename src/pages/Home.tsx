import { motion, AnimatePresence } from 'motion/react';
import { Diamond, ArrowDown, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import GalleryItem from '../components/GalleryItem';
import PremiumSlider from '../components/PremiumSlider';
import { CATEGORIES } from '../constants/categories';
import { useNavigate } from 'react-router-dom';
import { useProperties } from '../context/PropertyContext';

export default function Home() {
  const navigate = useNavigate();
  const { properties } = useProperties();
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
      <section className="bg-white py-20 overflow-hidden">
        <div className="max-w-[1800px] mx-auto px-6 mb-10">
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
            <div className="flex flex-col w-full md:w-auto text-center md:text-left min-w-0 md:min-w-[200px]">
              <span className="text-[#FFE39D]/90 text-lg md:text-[26px] font-medium leading-tight pl-0 md:pl-[52px] pr-[-5px] pt-[4px] ml-0 md:ml-[10px] mr-[13px] mt-[-3px] mb-[-12px]">O que você está</span>
              <h2 className="text-[#FFE39D] text-2xl md:text-4xl font-bold leading-tight pl-0 md:pl-[59px] ml-0 md:ml-[9px] mr-[-22px] mb-0">procurando?</h2>
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
                className="flex-1 flex items-end gap-4 md:gap-2 overflow-x-auto no-scrollbar pb-[7px] ml-[-43px] w-[1196.83px] h-[111.5px] scroll-smooth"
              >
                {CATEGORIES.map((item) => (
                  <button 
                    key={item.id} 
                    onClick={() => navigate(`/categoria/${item.slug}`)}
                    className="flex flex-col items-center gap-3 min-w-[100px] md:min-w-[130px] cursor-pointer shrink-0 transition-all group"
                  >
                    <div className="text-[#FFE39D] transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1 group-hover:drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)]">
                      <item.icon className="w-10 h-10 md:w-14 md:h-14 stroke-[1.5px]" />
                    </div>
                    <div className="text-center leading-tight transition-all duration-300 group-hover:translate-y-[-2px]">
                      <p className="text-[#FFE39D]/70 text-[8px] md:text-[10px] uppercase tracking-wider group-hover:text-[#FFE39D]">{item.label1}</p>
                      <p className="text-[#FFE39D] text-xs md:text-sm font-bold group-hover:text-[#FFE39D]/80">{item.label2}</p>
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

      </div>
    );
  }
