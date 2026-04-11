import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Bed, Bath, Car, Maximize, DoorOpen, Heart, ArrowUpRight, Home } from 'lucide-react';
import { Property } from '../context/PropertyContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

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
      <div className="relative aspect-[9/16] md:aspect-auto md:h-72 overflow-hidden bg-brancobg">
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
          <>
            {/* Mobile Swiper */}
            <div className="block md:hidden w-full h-full">
              <Swiper
                modules={[Pagination]}
                pagination={{ clickable: true }}
                className="w-full h-full"
              >
                {(prop.images && prop.images.length > 0 && prop.images[0] !== '' ? prop.images : [prop.image]).map((img, idx) => (
                  <SwiperSlide key={idx}>
                    <img 
                      src={img} 
                      alt={`${prop.title} - ${idx + 1}`} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
            
            {/* Desktop Single Image */}
            <motion.img 
              src={prop.images && prop.images.length > 0 && prop.images[0] !== '' ? prop.images[0] : prop.image} 
              alt={prop.title} 
              className="hidden md:block w-full h-full object-cover"
              animate={{ 
                filter: isHovered ? "blur(6px)" : "blur(0px)"
              }}
              transition={{ duration: 0.4 }}
              referrerPolicy="no-referrer"
            />
          </>
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

      <div className="p-6 space-y-6 relative">
        {/* Always visible title for accessibility/SEO but styled to be hidden or subtle if needed */}
        <div className="space-y-1 transition-all duration-500 group-hover:opacity-0">
          <h3 className="text-xl font-bold text-marromescuro tracking-tight line-clamp-1">{prop.title}</h3>
          <div className="flex items-center gap-1.5 text-marromescuro/40 text-sm">
            <MapPin className="w-4 h-4 text-terracota" />
            <span className="line-clamp-1">{prop.location}</span>
          </div>
        </div>

        {/* Hover Information Overlay */}
        <div className="absolute inset-x-6 bottom-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 space-y-4 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-marromescuro/5 z-10">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-marromescuro tracking-tight leading-tight">{prop.title}</h3>
            <div className="flex items-center gap-1.5 text-marromescuro/40 text-[10px] font-bold uppercase tracking-wider">
              <MapPin className="w-3 h-3 text-terracota" />
              <span>{prop.location}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-3 gap-x-2 pt-3 border-t border-marromescuro/5">
            <div className="flex items-center gap-2 text-marromescuro/60 text-[10px] font-bold uppercase tracking-wider">
              <Bed className="w-3 h-3 text-terracota" />
              <span>{prop.beds} Suítes</span>
            </div>
            <div className="flex items-center gap-2 text-marromescuro/60 text-[10px] font-bold uppercase tracking-wider">
              <Car className="w-3 h-3 text-terracota" />
              <span>{prop.parking} Vagas</span>
            </div>
            <div className="flex items-center gap-2 text-marromescuro/60 text-[10px] font-bold uppercase tracking-wider">
              <Bath className="w-3 h-3 text-terracota" />
              <span>{prop.baths} Banheiros</span>
            </div>
            <div className="flex items-center gap-2 text-marromescuro/60 text-[10px] font-bold uppercase tracking-wider">
              <Maximize className="w-3 h-3 text-terracota" />
              <span>{prop.area}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-marromescuro/10">
            <div className="flex flex-col">
              <span className="text-[8px] uppercase tracking-widest text-marromescuro/30 font-bold">Investimento</span>
              <span className="text-lg font-bold text-marromescuro">{prop.price}</span>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(e);
              }}
              className="p-2 rounded-full hover:bg-marromescuro/5 transition-colors group/fav"
            >
              <Heart 
                className={`w-5 h-5 transition-all transform group-hover/fav:scale-125 ${isFavorite ? 'fill-[#435B45] text-[#435B45]' : 'text-marromescuro/20 group-hover/fav:text-marromescuro/40'}`} 
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-4 border-t border-marromescuro/5 group-hover:opacity-0 transition-opacity duration-500">
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
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-marromescuro/10 group-hover:opacity-0 transition-opacity duration-500">
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
