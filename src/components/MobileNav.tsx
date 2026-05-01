import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, Home, Diamond, Rocket, Info, Phone, BadgeDollarSign, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCondos } from '../context/CondoContext';
import { useProperties } from '../context/PropertyContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const MENU_ITEMS = [
  { label: 'Imóveis', path: '/comprar', icon: Home },
  { label: 'Condomínios', path: '#', icon: Diamond, isDropdown: true, dropdownType: 'condos' },
  { label: 'Lançamentos', path: '#', icon: Rocket, isDropdown: true, dropdownType: 'launches' },
  { label: 'Sobre', path: '/sobre', icon: Info },
  { label: 'Contato', path: '/contato', icon: Phone },
  { label: 'Quero vender', path: '/vender', icon: BadgeDollarSign },
];

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const { condos } = useCondos();
  const { publishedProperties: properties } = useProperties();
  const [isCondosOpen, setIsCondosOpen] = useState(false);
  const [isLaunchesOpen, setIsLaunchesOpen] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[70] cursor-pointer"
          />

          {/* Menu Content */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[85%] max-w-[400px] bg-gradient-to-b from-[#132014] to-[#435B45] z-[71] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-white/10">
              <img 
                src="https://i.imgur.com/egg4k7M.png" 
                alt="CR Imóveis" 
                className="h-8 w-auto"
                referrerPolicy="no-referrer"
              />
              <button 
                onClick={onClose}
                className="p-2 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Links */}
            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              {MENU_ITEMS.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {item.isDropdown ? (
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          if (item.dropdownType === 'condos') setIsCondosOpen(!isCondosOpen);
                          if (item.dropdownType === 'launches') setIsLaunchesOpen(!isLaunchesOpen);
                        }}
                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-white/10 text-brand-cream group-hover:bg-[#617964] group-hover:text-white transition-all transform group-hover:scale-125">
                            <item.icon className="w-5 h-5" />
                          </div>
                          <span className="text-brand-cream font-medium">{item.label}</span>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-white/30 group-hover:text-white transition-transform duration-300 ${
                          (item.dropdownType === 'condos' && isCondosOpen) || (item.dropdownType === 'launches' && isLaunchesOpen) 
                            ? 'rotate-180' 
                            : ''
                        }`} />
                      </button>
                      <AnimatePresence>
                        {item.dropdownType === 'condos' && isCondosOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-14 pr-4 py-2 space-y-2">
                              {condos
                                .filter(condo => !properties.some(p => p.condoId === condo.id && p.listingType === 'lançamento'))
                                .slice()
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map(condo => (
                                <Link
                                  key={condo.id}
                                  to={`/condominio/${condo.id}`}
                                  onClick={onClose}
                                  className="block py-2 text-brand-cream/70 hover:text-[#617964] transition-colors text-sm font-medium"
                                >
                                  {condo.name}
                                </Link>
                              ))}
                              <div className="pt-2 border-t border-white/10">
                                <Link
                                  to="/condominios"
                                  onClick={onClose}
                                  className="block py-2 text-[#617964] font-bold text-xs uppercase tracking-widest"
                                >
                                  Ver todos condomínios
                                </Link>
                              </div>
                            </div>
                          </motion.div>
                        )}
                        {item.dropdownType === 'launches' && isLaunchesOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-14 pr-4 py-2 space-y-2">
                              {properties
                                .filter(p => p.listingType === 'lançamento')
                                .slice()
                                .sort((a, b) => a.title.localeCompare(b.title))
                                .map(prop => (
                                <Link
                                  key={prop.id}
                                  to={`/imovel/${prop.id}`}
                                  onClick={onClose}
                                  className="block py-2 text-brand-cream/70 hover:text-[#617964] transition-colors text-sm font-medium"
                                >
                                  {prop.title}
                                </Link>
                              ))}
                              <div className="pt-2 border-t border-white/10">
                                <Link
                                  to="/lancamentos"
                                  onClick={onClose}
                                  className="block py-2 text-[#617964] font-bold text-xs uppercase tracking-widest"
                                >
                                  Ver todos lançamentos
                                </Link>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      onClick={onClose}
                      className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-white/10 text-brand-cream group-hover:bg-[#617964] group-hover:text-white transition-all transform group-hover:scale-125">
                          <item.icon className="w-5 h-5" />
                        </div>
                        <span className="text-brand-cream font-medium">{item.label}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white transition-colors" />
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 space-y-4">
              <div className="text-white/40 text-xs uppercase tracking-widest font-bold">Contato Direto</div>
              <a 
                href="https://wa.me/5524981000306" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#617964] to-[#435B45] text-white font-bold hover:opacity-90 transition-all text-center justify-center shadow-lg shadow-[#617964]/20"
              >
                Falar no WhatsApp
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
