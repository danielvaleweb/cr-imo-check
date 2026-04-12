import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home } from 'lucide-react';

export default function SiteLoader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if the site has already been loaded in this session
    const hasLoaded = sessionStorage.getItem('site_loaded');
    if (hasLoaded) {
      setIsLoading(false);
      return;
    }

    const finishLoading = () => {
      // Add a small delay to ensure rendering is smooth
      setTimeout(() => {
        setIsLoading(false);
        sessionStorage.setItem('site_loaded', 'true');
      }, 800);
    };

    // Function to check if all current images in the DOM are loaded
    const checkImages = () => {
      const images = Array.from(document.images);
      const unloadedImages = images.filter(img => !img.complete);
      
      if (unloadedImages.length === 0) {
        finishLoading();
      } else {
        let loadedCount = 0;
        const onImageLoad = () => {
          loadedCount++;
          if (loadedCount === unloadedImages.length) {
            finishLoading();
          }
        };

        unloadedImages.forEach(img => {
          img.addEventListener('load', onImageLoad, { once: true });
          img.addEventListener('error', onImageLoad, { once: true });
        });
      }
    };

    // Wait a bit for React to render the initial DOM and image tags
    const initialTimer = setTimeout(() => {
      checkImages();
    }, 500);

    // Fallback maximum loading time (e.g., 4 seconds) so the user is never stuck
    const fallbackTimer = setTimeout(() => {
      finishLoading();
    }, 4000);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="w-20 h-20 bg-[#617964] rounded-3xl flex items-center justify-center shadow-2xl shadow-[#617964]/30 mb-8 relative overflow-hidden"
          >
            <motion.div 
              className="absolute inset-0 bg-white/20"
              animate={{ y: ['100%', '-100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <Home className="text-white w-10 h-10 relative z-10" />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex gap-2">
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} 
                transition={{ duration: 1, repeat: Infinity, delay: 0 }} 
                className="w-2.5 h-2.5 rounded-full bg-[#617964]" 
              />
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} 
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} 
                className="w-2.5 h-2.5 rounded-full bg-[#617964]" 
              />
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} 
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} 
                className="w-2.5 h-2.5 rounded-full bg-[#617964]" 
              />
            </div>
            <span className="text-[10px] font-bold text-[#617964] uppercase tracking-[0.3em]">Carregando</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
