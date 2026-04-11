import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { DoorOpen, Home } from 'lucide-react';

interface GalleryItemProps {
  src: string;
  width?: string;
  height?: string;
  className?: string;
  onClick: () => void;
}

export default function GalleryItem({ src, width, height, className = '', onClick }: GalleryItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`relative rounded-[32px] overflow-hidden shadow-xl group bg-brancobg ${className}`}
      style={width && height ? { width, height } : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {(!src || src.includes('pe07Ikg.png')) ? (
        <motion.div 
          className="w-full h-full flex flex-col items-center justify-center relative"
          animate={{ 
            filter: isHovered ? "blur(4px)" : "blur(0px)"
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
          src={src} 
          className="w-full h-full object-cover" 
          animate={{ 
            filter: isHovered ? "blur(4px)" : "blur(0px)"
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
            className="absolute inset-0 flex items-center justify-center bg-black/20"
          >
              <button 
                onClick={onClick}
                className="bg-white text-brand-dark px-6 py-3 rounded-full flex items-center gap-2 font-bold shadow-2xl transition-all hover:bg-brand-cream cursor-pointer group/btn"
              >
                <DoorOpen className="w-5 h-5 text-brand-rust transition-transform group-hover/btn:scale-125" />
                <span>Ver de perto</span>
              </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
