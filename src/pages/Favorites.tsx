import { motion } from 'motion/react';
import { Heart, ChevronLeft, Trash2, MapPin, Building2, Waves, Dumbbell, UtensilsCrossed, ShieldCheck, ChevronRight } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import React, { useState } from 'react';
import { useProperties } from '../context/PropertyContext';
import { useCondos } from '../context/CondoContext';
import PropertyCard from '../components/PropertyCard';

import { playAlertSound } from '../lib/audio';

export default function Favorites() {
  const navigate = useNavigate();
  const { properties } = useProperties();
  const { condos } = useCondos();
  const { favorites, toggleFavorite, clearFavorites } = useOutletContext<{ 
    favorites: (string | number)[], 
    toggleFavorite: (id: string | number, type?: 'property' | 'condo') => void,
    clearFavorites: () => void 
  }>();
  
  const favoritedProperties = properties.filter(p => favorites.includes(String(p.id)));
  const favoritedCondos = condos.filter(c => favorites.includes(`condo_${c.id}`));

  const [isTrashAnimating, setIsTrashAnimating] = useState(false);

  const handleClear = () => {
    playAlertSound();
    setIsTrashAnimating(true);
    clearFavorites();
    setTimeout(() => setIsTrashAnimating(false), 1000);
  };

  return (
    <div className="pt-32 pb-20 px-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm font-bold text-marromescuro hover:opacity-80 transition-all group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Voltar</span>
            </button>
          </div>

          {(favoritedProperties.length > 0 || favoritedCondos.length > 0) && (
            <button
              onClick={handleClear}
              className="group flex items-center gap-2 px-6 py-3 bg-[#132014] text-white rounded-2xl text-sm font-bold hover:bg-[#1a2b1b] transition-all border border-[#617964]/20"
            >
              <motion.div
                animate={isTrashAnimating ? { 
                  rotate: [0, -20, 20, -20, 20, 0],
                  scale: [1, 1.2, 1.2, 1.2, 1.2, 1],
                } : {}}
                transition={{ duration: 0.5 }}
              >
                <Trash2 className={`w-4 h-4 transition-colors ${isTrashAnimating ? 'text-red-400' : 'text-white'}`} />
              </motion.div>
              <span>Limpar tudo</span>
            </button>
          )}
        </div>

        {/* Properties Section - NOW FIRST */}
        <div className="space-y-8">
          {favoritedProperties.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-marromescuro rounded-full" />
              <h2 className="text-3xl font-helvetica text-marromescuro tracking-tight">
                <span className="font-light">Imóveis</span> <span className="font-bold">favoritos</span>
              </h2>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {favoritedProperties.length > 0 ? (
              favoritedProperties.map((prop) => (
                <PropertyCard 
                  key={prop.id} 
                  prop={prop} 
                  onClick={() => navigate(`/imovel/${prop.id}`)} 
                  isFavorite={true}
                  onToggleFavorite={() => toggleFavorite(prop.id)}
                />
              ))
            ) : favoritedCondos.length === 0 ? (
              <div className="col-span-full py-20 text-center space-y-4">
                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Heart className="w-8 h-8 text-gray-200" />
                </div>
                <h3 className="text-xl font-bold text-marromescuro">Você ainda não tem favoritos</h3>
                <p className="text-marromescuro/60">Explore nossos imóveis e clique no coração para salvar os que mais gostar.</p>
                <button 
                  onClick={() => navigate('/comprar')}
                  className="bg-marromescuro text-white px-8 py-3 rounded-full font-bold shadow-xl hover:bg-marromescuro/90 transition-all"
                >
                  Explorar Imóveis
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Condos Section - NOW SECOND */}
        {favoritedCondos.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-marromescuro rounded-full" />
              <h2 className="text-3xl font-helvetica text-marromescuro tracking-tight">
                <span className="font-light">Condomínios</span> <span className="font-bold">favoritos</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {favoritedCondos.map((condo) => {
                const condoPropertiesCount = properties.filter(p => p.condoId === condo.id || p.location.includes(condo.name)).length;
                
                return (
                  <motion.div 
                    key={condo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group relative bg-[#132014] rounded-xl overflow-hidden border border-white/10 hover:shadow-xl transition-all cursor-pointer"
                    onClick={() => navigate(`/condominio/${condo.id}`)}
                  >
                    <div className="aspect-video overflow-hidden relative">
                      <img 
                        src={condo.images[0]} 
                        alt={condo.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="text-xl font-bold text-white">{condo.name}</h3>
                          <div className="flex items-center gap-1 text-white/60 text-xs">
                            <MapPin className="w-3 h-3" />
                            <span>{condo.location}</span>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(condo.id, 'condo');
                          }}
                          className="p-2 rounded-full transition-colors hover:bg-white/10"
                        >
                          <Heart className="w-6 h-6 fill-[#617964] text-[#617964]" />
                        </button>
                      </div>

                      {/* Info Pills */}
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/80 uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-full">
                          <Building2 className="w-3 h-3" />
                          {condoPropertiesCount} Imóveis
                        </div>
                        {condo.portariaType && condo.portariaType !== 'Não possui' && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/80 uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-full">
                            <ShieldCheck className="w-3 h-3" />
                            {condo.portariaType}
                          </div>
                        )}
                      </div>

                      {/* Leisure Icons */}
                      {condo.leisure && condo.leisure.length > 0 && (
                        <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                          {condo.leisure.slice(0, 4).map((item, idx) => {
                            const lower = item.toLowerCase();
                            let Icon = Building2;
                            if (lower.includes('piscina')) Icon = Waves;
                            if (lower.includes('academia') || lower.includes('fitness')) Icon = Dumbbell;
                            if (lower.includes('churrasqueira') || lower.includes('gourmet')) Icon = UtensilsCrossed;
                            
                            return (
                              <div key={idx} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40" title={item}>
                                <Icon className="w-4 h-4" />
                              </div>
                            );
                          })}
                          {condo.leisure.length > 4 && (
                            <span className="text-[10px] font-bold text-white/30">+{condo.leisure.length - 4}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
