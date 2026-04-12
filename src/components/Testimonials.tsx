import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Carlos Eduardo',
    property: 'Apto no Leblon',
    text: 'A experiência de compra foi incrível. A equipe entendeu exatamente o que eu procurava e encontrou o apartamento dos meus sonhos em tempo recorde. Profissionalismo do início ao fim.',
    image: 'https://i.pravatar.cc/150?img=11',
    rotation: -8,
    color: 'bg-[#F5F5ED]',
    textColor: 'text-brand-dark',
    starColor: 'text-[#617964]'
  },
  {
    id: 2,
    name: 'Mariana Silva',
    property: 'Casa em Alphaville',
    text: 'Vender minha casa com eles foi a melhor decisão. O processo foi transparente, rápido e o suporte jurídico me deu muita segurança. Recomendo de olhos fechados!',
    image: 'https://i.pravatar.cc/150?img=5',
    rotation: -4,
    color: 'bg-[#E5E5D8]',
    textColor: 'text-brand-dark',
    starColor: 'text-[#617964]'
  },
  {
    id: 3,
    name: 'Roberto Costa',
    property: 'Cobertura nos Jardins',
    text: 'O atendimento personalizado fez toda a diferença. Eles não apenas me mostraram imóveis, mas me ajudaram a entender o potencial de valorização de cada região. Excelente consultoria.',
    image: 'https://i.pravatar.cc/150?img=68',
    rotation: 0,
    color: 'bg-[#F5F5ED]',
    textColor: 'text-brand-dark',
    starColor: 'text-[#617964]'
  },
  {
    id: 4,
    name: 'Ana Paula',
    property: 'Terreno em Condomínio',
    text: 'Comprar um terreno para construir exige muita pesquisa, e a equipe me forneceu todos os dados necessários sobre topografia e regras do condomínio. Serviço impecável.',
    image: 'https://i.pravatar.cc/150?img=44',
    rotation: 4,
    color: 'bg-[#E5E5D8]',
    textColor: 'text-brand-dark',
    starColor: 'text-[#617964]'
  },
  {
    id: 5,
    name: 'Fernando Souza',
    property: 'Sala Comercial',
    text: 'Precisava de um espaço para minha nova clínica e eles encontraram o local perfeito, com a metragem ideal e excelente localização. Negociação ágil e sem burocracia.',
    image: 'https://i.pravatar.cc/150?img=60',
    rotation: 8,
    color: 'bg-[#F5F5ED]',
    textColor: 'text-brand-dark',
    starColor: 'text-[#617964]'
  },
  {
    id: 6,
    name: 'Juliana Mendes',
    property: 'Casa de Praia',
    text: 'Encontrar a casa de praia ideal para a família parecia impossível, mas eles superaram as expectativas. O suporte pós-venda também foi excepcional. Muito obrigada!',
    image: 'https://i.pravatar.cc/150?img=32',
    rotation: 12,
    color: 'bg-[#E5E5D8]',
    textColor: 'text-brand-dark',
    starColor: 'text-[#617964]'
  }
];

export default function Testimonials() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.8 
        : scrollLeft + clientWidth * 0.8;
      
      scrollRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="bg-white py-20 md:py-32 overflow-hidden">
      <div className="max-w-[1800px] mx-auto px-6 relative">
        <div className="mb-16 md:mb-24 text-center">
          <h2 className="text-5xl md:text-7xl font-bold text-brand-dark leading-tight tracking-tight">
            Aprovado por<br />
            <span className="text-[#E5E5D8]">+500 clientes</span>
          </h2>
        </div>

        <div className="flex justify-start md:justify-center items-center min-h-[550px] overflow-x-auto md:overflow-visible py-10 no-scrollbar px-6 md:px-0 snap-x snap-mandatory" ref={scrollRef}>
          <div className="flex items-center justify-start md:justify-center min-w-max md:min-w-0 pb-10 gap-6 md:gap-0">
            {TESTIMONIALS.map((t, i) => {
              const isHovered = hoveredId === t.id;
              
              return isMobile ? (
                <motion.div
                  key={t.id}
                  onClick={() => setHoveredId(isHovered ? null : t.id)}
                  animate={{
                    zIndex: isHovered ? 50 : i,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`relative w-[75vw] h-[380px] shrink-0 snap-center cursor-pointer`}
                  style={{
                    transformOrigin: 'bottom center',
                    perspective: 1200
                  }}
                >
                  <motion.div
                    animate={{ rotateY: isHovered ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="w-full h-full relative"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Front Face */}
                    <div 
                      className={`absolute inset-0 w-full h-full rounded-3xl p-6 shadow-none flex flex-col items-center justify-center gap-6 ${t.color} ${t.textColor}`}
                      style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                    >
                      <img 
                        src={t.image} 
                        alt={t.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-center">
                        <h4 className="font-bold text-xl mb-1">{t.name}</h4>
                        <p className="text-sm text-brand-dark/70 font-medium mb-4">
                          Comprou: {t.property}
                        </p>
                        <div className="flex items-center justify-center gap-1">
                          {[...Array(5)].map((_, index) => (
                            <Star key={index} className={`w-5 h-5 fill-current ${t.starColor}`} />
                          ))}
                        </div>
                      </div>
                      <div className="absolute bottom-6 text-[10px] font-bold uppercase tracking-widest opacity-40">
                        Toque para ler
                      </div>
                    </div>

                    {/* Back Face */}
                    <div 
                      className={`absolute inset-0 w-full h-full rounded-3xl p-6 shadow-none flex flex-col items-center justify-center text-center ${t.color} ${t.textColor}`}
                      style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      <Star className={`w-8 h-8 fill-current ${t.starColor} mb-6 opacity-50`} />
                      <p className="text-base font-medium leading-relaxed italic">
                        "{t.text}"
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key={t.id}
                  onMouseEnter={() => setHoveredId(t.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  animate={{
                    rotate: isHovered ? 0 : t.rotation,
                    y: isHovered ? -40 : 0,
                    scale: isHovered ? 1.05 : 1,
                    zIndex: isHovered ? 50 : i,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`relative w-[340px] h-[480px] rounded-3xl p-8 shadow-2xl flex flex-col justify-between cursor-pointer shrink-0 snap-center ${t.color} ${t.textColor} ${i === 0 ? '' : '-ml-40'}`}
                  style={{
                    transformOrigin: 'bottom center'
                  }}
                >
                  <div>
                    <div className="flex items-center gap-1 mb-8">
                      {[...Array(5)].map((_, index) => (
                        <Star key={index} className={`w-5 h-5 fill-current ${t.starColor}`} />
                      ))}
                    </div>
                    
                    <p className="text-lg font-medium leading-relaxed">
                      "{t.text}"
                    </p>
                  </div>

                  <div className="flex items-center gap-4 mt-8">
                    <img 
                      src={t.image} 
                      alt={t.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-bold text-sm">{t.name}</h4>
                      <p className="text-xs text-brand-dark/70">
                        Comprou: {t.property}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobile Navigation Arrows */}
        <div className="flex md:hidden justify-center items-center gap-8 mt-4">
          <button 
            onClick={() => scroll('left')}
            className="p-4 rounded-full bg-gray-100 text-brand-dark hover:bg-[#617964] hover:text-white transition-all active:scale-90 shadow-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="p-4 rounded-full bg-gray-100 text-brand-dark hover:bg-[#617964] hover:text-white transition-all active:scale-90 shadow-lg"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
}
