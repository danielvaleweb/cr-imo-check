import React from 'react';
import { motion } from 'motion/react';
import { Rocket, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProperties } from '../context/PropertyContext';

export default function PremiumSlider() {
  const navigate = useNavigate();
  const { properties } = useProperties();
  const launchProperties = properties.filter(p => p.listingType === 'lançamento');

  if (launchProperties.length === 0) return null;

  return (
    <section 
      className="bg-[#132014] py-20 overflow-hidden relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url("https://storage.robustcrm.com.br/souzagomes/files/imoveis__empreendimentos/41/attach/8cb9cd30-43d9-48c6-aec3-a31a856353cd.png")` }}
    >
      {/* Dark Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-[#132014]/80 pointer-events-none"></div>

      {/* Grain Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-overlay" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      ></div>

      <div className="max-w-[1800px] mx-auto px-6 mb-10 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3 text-white group/title">
          <div className="bg-linear-to-br from-[#132014] to-[#617964] p-2 rounded-lg shadow-sm border border-white/20 transition-all duration-300 group-hover/title:shadow-[0_0_15px_rgba(229,209,158,0.4)] group-hover/title:scale-110">
            <Rocket className="w-5 h-5 text-[#E5D19E] transition-all duration-300 group-hover/title:drop-shadow-[0_0_8px_rgba(229,209,158,0.6)]" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-medium opacity-70">Confira os nossos</span>
            <span className="text-sm font-bold uppercase tracking-wider text-[#E5D19E]">Lançamentos em 2026</span>
          </div>
        </div>
        <button 
          onClick={() => navigate('/lancamentos')}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors group"
        >
          Ver todos
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      <div className="flex gap-8 overflow-x-auto no-scrollbar px-6 pb-12 relative z-10">
        {launchProperties.map((prop) => (
          <motion.div
            key={prop.id}
            onClick={() => navigate(`/imovel/${prop.id}`)}
            className="min-w-[320px] md:min-w-[420px] h-[500px] md:h-[600px] group cursor-pointer relative rounded-2xl overflow-hidden shadow-xl bg-gray-100"
          >
            {/* Background Image */}
            <img 
              src={prop.images && prop.images.length > 0 ? prop.images[0] : prop.image} 
              alt={prop.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            
            {/* Hover Overlay Content */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
              <div className="space-y-6 transform translate-y-8 group-hover:translate-y-0 transition-all duration-500">
                <h4 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                  {prop.title}
                </h4>
                
                <div className="flex gap-3">
                  <button className="flex-1 bg-[#617964] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#617964]/90 transition-colors">
                    Ver Detalhes
                  </button>
                </div>
              </div>
            </div>

            {/* Subtle Location Badge (Always visible but minimal) */}
            <div className="absolute top-6 right-6 z-10 group-hover:opacity-0 transition-opacity">
              <span className="px-3 py-1 bg-black/20 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-white">
                {prop.location}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
