import { useState } from 'react';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';

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
    starColor: 'text-[#FF5A36]'
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
    starColor: 'text-[#FFB800]'
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
    starColor: 'text-[#FF5A36]'
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
    starColor: 'text-[#FFB800]'
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
    starColor: 'text-[#FF5A36]'
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
    starColor: 'text-[#FFB800]'
  }
];

export default function Testimonials() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <section className="bg-white py-20 md:py-32 overflow-hidden">
      <div className="max-w-[1800px] mx-auto px-6">
        <div className="mb-16 md:mb-24 text-center md:text-left">
          <h2 className="text-5xl md:text-7xl font-bold text-brand-dark leading-tight tracking-tight">
            Aprovado por<br />
            <span className="text-[#E5E5D8]">+500 clientes</span>
          </h2>
        </div>

        <div className="flex justify-start md:justify-center items-center min-h-[550px] overflow-x-auto md:overflow-visible py-10 no-scrollbar px-10 md:px-0">
          <div className="flex items-center justify-start md:justify-center min-w-max md:min-w-0 pb-10">
            {TESTIMONIALS.map((t, i) => {
              const isHovered = hoveredId === t.id;
              
              return (
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
                  className={`relative w-[260px] md:w-[340px] h-[420px] md:h-[480px] rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col justify-between cursor-pointer shrink-0 ${t.color} ${t.textColor} ${i === 0 ? '' : '-ml-32 md:-ml-40'}`}
                  style={{
                    transformOrigin: 'bottom center'
                  }}
                >
                  <div>
                    <div className="flex items-center gap-1 mb-6 md:mb-8">
                      {[...Array(5)].map((_, index) => (
                        <Star key={index} className={`w-4 h-4 md:w-5 md:h-5 fill-current ${t.starColor}`} />
                      ))}
                    </div>
                    
                    <p className="text-base md:text-lg font-medium leading-relaxed">
                      "{t.text}"
                    </p>
                  </div>

                  <div className="flex items-center gap-4 mt-6 md:mt-8">
                    <img 
                      src={t.image} 
                      alt={t.name}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-white/20"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-bold text-xs md:text-sm">{t.name}</h4>
                      <p className="text-[10px] md:text-xs text-brand-dark/70">
                        Comprou: {t.property}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
