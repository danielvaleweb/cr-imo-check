import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Bed, Bath, Car, Maximize, DoorOpen, Heart, ArrowUpRight, Home } from 'lucide-react';
import { Property } from '../context/PropertyContext';

interface PropertyCardProps {
  prop: Property;
  onClick: () => void | Promise<void>;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ prop, onClick, isFavorite, onToggleFavorite }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer border border-marromescuro/5"
    >
      <div className="relative h-72 overflow-hidden bg-brancobg">
        {prop.listingType === 'lançamento' && (
          <div className="absolute top-4 left-4 z-20 bg-[#8FA603] text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg shadow-xl">
            Lançamento
          </div>
        )}
        {prop.listingType === 'permuta' && (
          <div className="absolute top-4 left-4 z-20 bg-[#8FA603] text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg shadow-xl">
            Permuta
          </div>
        )}
        {(!prop.image || prop.image.includes('pe07Ikg.png')) && (!prop.images || prop.images.length === 0 || prop.images[0] === '') ? (
          <motion.div 
            className="w-full h-full flex flex-col items-center justify-center relative"
            animate={{ 
              filter: isHovered ? "blur(6px)" : "blur(0px)"
            }}
            transition={{ duration: 0.4 }}
          >
            <img 
              src="https://i.imgur.com/egg4k7M.png" 
              alt="CR Imóveis" 
              className="absolute inset-0 w-full h-full object-contain opacity-5 p-8"
              referrerPolicy="no-referrer"
            />
            <Home className="w-10 h-10 text-marromescuro/20 mb-3 relative z-10" />
            <span className="text-sm font-bold text-marromescuro/40 relative z-10 uppercase tracking-wider">Imóvel sem foto</span>
          </motion.div>
        ) : (
          <motion.img 
            src={prop.images && prop.images.length > 0 && prop.images[0] !== '' ? prop.images[0] : prop.image} 
            alt={prop.title} 
            className="w-full h-full object-cover"
            animate={{ 
              filter: isHovered ? "blur(6px)" : "blur(0px)"
            }}
            transition={{ duration: 0.4 }}
            referrerPolicy="no-referrer"
          />
        )}
        
        <AnimatePresence>
          {isHovered && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/10"
            >
              <button className="bg-white text-marromescuro px-8 py-3 rounded-full flex items-center gap-2 font-bold shadow-2xl transition-all hover:bg-brancobg cursor-pointer group/btn">
                <DoorOpen className="w-5 h-5 text-terracota transition-transform group-hover/btn:scale-125" />
                <span>Ver de perto</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-marromescuro tracking-tight">{prop.title}</h3>
          <div className="flex items-center gap-1.5 text-marromescuro/40 text-sm">
            <MapPin className="w-4 h-4 text-terracota" />
            <span>{prop.location}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-4 border-t border-marromescuro/5">
          <div className="flex items-center gap-2 text-marromescuro/60 text-sm font-medium">
            <Bed className="w-4 h-4 text-terracota" />
            <span>{prop.beds} Suítes</span>
          </div>
          <div className="flex items-center gap-2 text-marromescuro/60 text-sm font-medium">
            <Car className="w-4 h-4 text-terracota" />
            <span>{prop.parking} Vagas</span>
          </div>
          <div className="flex items-center gap-2 text-marromescuro/60 text-sm font-medium">
            <Bath className="w-4 h-4 text-terracota" />
            <span>{prop.baths} Banheiros</span>
          </div>
          <div className="flex items-center gap-2 text-marromescuro/60 text-sm font-medium">
            <Maximize className="w-4 h-4 text-terracota" />
            <span>{prop.area}</span>
          </div>
          {prop.elevators !== undefined && prop.elevators > 0 && (
            <div className="flex items-center gap-2 text-marromescuro/60 text-sm font-medium">
              <ArrowUpRight className="w-4 h-4 text-terracota" />
              <span>{prop.elevators} Elevador{prop.elevators > 1 ? 'es' : ''}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-marromescuro/10">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-marromescuro/30 font-bold">Valor do Investimento</span>
            <span className="text-2xl font-bold text-marromescuro">{prop.price}</span>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(e);
            }}
            className="p-2 rounded-full hover:bg-marromescuro/5 transition-colors group/fav"
          >
            <Heart 
              className={`w-6 h-6 transition-all transform group-hover/fav:scale-125 ${isFavorite ? 'fill-[#435B45] text-[#435B45]' : 'text-marromescuro/20 group-hover/fav:text-marromescuro/40'}`} 
            />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;
