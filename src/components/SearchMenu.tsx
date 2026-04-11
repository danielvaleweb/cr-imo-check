import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { X, Info, Check, ChevronDown, Eraser, Target, Search, ArrowUpRight, ThumbsUp, GripVertical, MapPin, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProperties } from '../context/PropertyContext';

interface SearchMenuProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  isDesktop: boolean;
  negotiation: 'comprar' | 'alugar' | 'permuta';
  setNegotiation: (neg: 'comprar' | 'alugar' | 'permuta') => void;
}

const PROPERTY_STYLES = [
  'Apartamento 1 quarto', 'Apartamento 2 quartos', 'Apartamento 3 quartos', 'Apartamento 4 quartos',
  'Apartamento 5 quartos', 'Casa 2 quartos', 'Casa 3 quartos', 'Casa 4 quartos',
  'Casa 5 quartos', 'Casa 11 quartos', 'Casa Pet', 'Cobertura',
  'Flat', 'Loja', 'Lote / Terreno', 'Prédio',
  'Quitinete', 'Sala', 'Sobrado', 'Studio',
  'Suíte de hotel', 'Vaga de Garagem'
];

const MOCK_LOCATIONS = [
  'São Paulo, SP',
  'Rio de Janeiro, RJ',
  'Belo Horizonte, MG',
  'Curitiba, PR',
  'Porto Alegre, RS',
  'Salvador, BA',
  'Fortaleza, CE',
  'Brasília, DF',
  'Campinas, SP',
  'Santos, SP'
];

export default function SearchMenu({ isMenuOpen, setIsMenuOpen, isDesktop, negotiation, setNegotiation }: SearchMenuProps) {
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [suites, setSuites] = useState<string[]>([]);
  const [vagas, setVagas] = useState<string[]>([]);
  const [isInteractingMin, setIsInteractingMin] = useState(false);
  const [isInteractingMax, setIsInteractingMax] = useState(false);
  const [isPriceTouched, setIsPriceTouched] = useState(false);
  const [isMinFocused, setIsMinFocused] = useState(false);
  const [isMaxFocused, setIsMaxFocused] = useState(false);
  const [isInfoHovered, setIsInfoHovered] = useState(false);
  const [codeSearch, setCodeSearch] = useState('');
  const { properties } = useProperties();
  const navigate = useNavigate();
  
  const MIN_PRICE = 50000;
  const MAX_PRICE = 100000000;
  const [priceRange, setPriceRange] = useState({ min: MIN_PRICE, max: MAX_PRICE });

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const [minPriceInput, setMinPriceInput] = useState(formatCurrency(MIN_PRICE));
  const [maxPriceInput, setMaxPriceInput] = useState(formatCurrency(MAX_PRICE));

  useEffect(() => {
    if (isPriceTouched && !isMinFocused) {
      setMinPriceInput(formatCurrency(priceRange.min));
    }
  }, [priceRange.min, isPriceTouched, isMinFocused]);

  useEffect(() => {
    if (isPriceTouched && !isMaxFocused) {
      setMaxPriceInput(formatCurrency(priceRange.max));
    }
  }, [priceRange.max, isPriceTouched, isMaxFocused]);

  const handlePriceInputChange = (type: 'min' | 'max', value: string) => {
    setIsPriceTouched(true);
    const numericValue = parseInt(value.replace(/\D/g, '')) || 0;
    // Format as you type (thousands separator only)
    const formatted = numericValue.toLocaleString('pt-BR');
    
    if (type === 'min') {
      setMinPriceInput(formatted);
      setPriceRange(prev => ({ ...prev, min: Math.min(numericValue, prev.max - 1) }));
    } else {
      setMaxPriceInput(formatted);
      setPriceRange(prev => ({ ...prev, max: Math.max(numericValue, prev.min + 1) }));
    }
  };
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const leftThumbX = useMotionValue(0);
  const rightThumbX = useMotionValue(0);
  
  const rightPos = useTransform(rightThumbX, x => {
    if (!sliderRef.current) return 0;
    return sliderRef.current.offsetWidth - x;
  });

  useEffect(() => {
    const updatePositions = () => {
      if (isMenuOpen && sliderRef.current) {
        const width = sliderRef.current.offsetWidth;
        if (width > 0) {
          const leftPos = ((priceRange.min - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * width;
          const rightPos = ((priceRange.max - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * width;
          leftThumbX.set(leftPos);
          rightThumbX.set(rightPos);
        }
      }
    };

    updatePositions();
    // Re-run after a short delay to ensure layout is stable
    const timer = setTimeout(updatePositions, 100);
    return () => clearTimeout(timer);
  }, [isMenuOpen]);

  const handleClearFilters = () => {
    setNegotiation('comprar');
    setSelectedStyles([]);
    setSelectedLocations([]);
    setSuites([]);
    setVagas([]);
    setIsPriceTouched(false);
    setPriceRange({ min: MIN_PRICE, max: MAX_PRICE });
    setCodeSearch('');
    if (sliderRef.current) {
      const width = sliderRef.current.offsetWidth;
      leftThumbX.set(0);
      rightThumbX.set(width);
    }
  };

  const updatePrice = (type: 'min' | 'max', x: number) => {
    if (!sliderRef.current) return;
    setIsPriceTouched(true);
    const width = sliderRef.current.offsetWidth;
    if (width <= 0) return;
    
    const percentage = Math.max(0, Math.min(1, x / width));
    let value = Math.round(MIN_PRICE + percentage * (MAX_PRICE - MIN_PRICE));
    
    // Snap to min/max at the edges
    if (percentage < 0.01) value = MIN_PRICE;
    if (percentage > 0.99) value = MAX_PRICE;
    
    setPriceRange(prev => {
      if (type === 'min') {
        return { ...prev, min: Math.min(value, prev.max - 100000) };
      } else {
        return { ...prev, max: Math.max(value, prev.min + 100000) };
      }
    });
  };

  const filteredLocations = locationSearch.length > 0 
    ? MOCK_LOCATIONS.filter(loc => loc.toLowerCase().includes(locationSearch.toLowerCase()))
    : [];

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev => 
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };
  const handleSearch = () => {
    if (codeSearch) {
      const cleanCode = codeSearch.trim().toUpperCase();
      
      // Check if it's a single code and if it matches a property
      if (!cleanCode.includes(',')) {
        const property = properties.find(p => p.code?.toUpperCase() === cleanCode);
        if (property) {
          navigate(`/imovel/${property.id}`);
          setIsMenuOpen(false);
          return;
        }
      }
      
      navigate(`/buy?codes=${codeSearch.replace(/\s/g, '')}`);
      setIsMenuOpen(false);
    } else {
      const path = negotiation === 'alugar' ? '/alugar' : (negotiation === 'permuta' ? '/permuta' : '/comprar');
      navigate(path);
      setIsMenuOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] cursor-pointer"
          />
          
          {/* Menu Content */}
          <motion.div
            initial={isDesktop ? { x: "100%" } : { y: "100%" }}
            animate={isDesktop ? { x: 0 } : { y: 0 }}
            exit={isDesktop ? { x: "100%" } : { y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed z-[56] overflow-y-auto p-6 ${
              isDesktop 
                ? "top-0 right-0 h-full w-[480px] rounded-none" 
                : "bottom-0 left-0 right-0 rounded-t-[20px] max-h-[90vh]"
            }`}
          >
            {/* Sticky Close Button for Desktop - Positioned outside the modal on the left, centered vertically */}
            {isDesktop && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="fixed top-1/2 -translate-y-1/2 right-[500px] z-[60] flex flex-col items-center gap-2"
              >
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-full shadow-lg hover:bg-[#617964] hover:text-white transition-all cursor-pointer group relative"
                >
                  <X className="w-5 h-5 text-[#617964] group-hover:text-white group-hover:rotate-90 group-hover:scale-125 transition-transform" />
                  <span className="text-sm font-bold text-[#617964] group-hover:text-white tracking-widest">FECHAR</span>
                </button>
              </motion.div>
            )}

            {!isDesktop && (
              <div className="flex justify-center mb-4">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>
            )}

            <div className={`space-y-4 ${isDesktop ? 'mt-4' : 'mt-0'}`}>
              {/* Card 1: Quick Search */}
              <div className="bg-[#F5F5ED] rounded-2xl p-6 space-y-4 relative overflow-visible">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                      <Target className="w-6 h-6 text-[#617964]" />
                    </motion.div>
                    <motion.h2 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                      className="text-xl font-bold text-[#617964]"
                    >
                      Busca rápida por código
                    </motion.h2>
                  </div>

                  {/* Info Icon with Tooltip */}
                  <div className="relative">
                    <button
                      onMouseEnter={() => setIsInfoHovered(true)}
                      onMouseLeave={() => setIsInfoHovered(false)}
                      className="p-1 rounded-full hover:bg-[#617964]/10 transition-colors cursor-help"
                    >
                      <Info className="w-5 h-5 text-[#617964]" />
                    </button>

                    <AnimatePresence>
                      {isInfoHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="absolute top-full right-0 mt-3 w-64 bg-[#617964] text-white p-4 rounded-xl shadow-2xl z-50 text-xs leading-relaxed"
                        >
                          <div className="absolute top-0 right-4 -translate-y-1/2 rotate-45 w-2 h-2 bg-[#617964]" />
                          <p className="font-medium mb-1">Dica de Busca:</p>
                          Você pode buscar por um único código ou vários ao mesmo tempo separando-os por vírgula.
                          <div className="mt-2 pt-2 border-t border-white/10 text-white/60 italic">
                            Ex: 1316, 1317, 2418
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="relative group">
                  <input 
                    type="text" 
                    value={codeSearch}
                    onChange={(e) => setCodeSearch(e.target.value)}
                    placeholder="cod. 1316, 1317, 2418, ..." 
                    className="w-full bg-white border-none rounded-xl pl-4 pr-16 py-4 focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all"
                  />
                  <button 
                    onClick={handleSearch}
                    className="absolute right-2 top-6 -translate-y-1/2 bg-[#617964] p-2.5 rounded-lg hover:bg-[#617964]/90 transition-all flex items-center gap-1.5 overflow-hidden cursor-pointer group/search"
                  >
                    <motion.div 
                      className="flex flex-col gap-0.5 opacity-60"
                      animate={{ x: [0, -2, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    >
                      <div className="w-2 h-[1.5px] bg-white rounded-full translate-x-1" />
                      <div className="w-3 h-[1.5px] bg-white rounded-full" />
                      <div className="w-2 h-[1.5px] bg-white rounded-full translate-x-1" />
                    </motion.div>
                    <Search className="w-6 h-6 md:w-5 md:h-5 text-white -scale-x-100 transition-transform group-hover/search:scale-125" />
                  </button>
                </div>
              </div>

              {/* Card 2: Custom Search */}
              <div className="bg-[#F5F5ED] rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ 
                      x: 0, 
                      opacity: 1,
                      rotate: 360 
                    }}
                    transition={{ 
                      x: { duration: 0.6, ease: "easeOut" },
                      opacity: { duration: 0.6, ease: "easeOut" },
                      rotate: { repeat: Infinity, duration: 4, ease: "linear" }
                    }}
                  >
                    <Settings className="w-6 h-6 text-[#617964]" />
                  </motion.div>
                  <motion.h2 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                    className="text-xl font-bold text-[#617964]"
                  >
                    Busca personalizada
                  </motion.h2>
                </div>
                
                {/* Negotiation Toggle */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-brand-dark/70 block text-left">Negociação</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['comprar', 'alugar', 'permuta'].map((type) => (
                      <button 
                        key={type}
                        onClick={() => setNegotiation(type as any)}
                        className={`relative flex items-center justify-center py-3.5 rounded-lg md:rounded-xl text-[10px] md:text-sm font-bold transition-all overflow-hidden cursor-pointer ${
                          negotiation === type 
                            ? 'bg-[#617964] text-white' 
                            : 'bg-white text-brand-dark/60 hover:bg-[#617964]/10 hover:text-[#617964]'
                        }`}
                      >
                        <span className="relative z-10 uppercase">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selects */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-brand-dark/70 block text-left">Estilo de imóvel</label>
                    <button 
                      onClick={() => setIsStyleModalOpen(true)}
                      className="w-full bg-white rounded-lg md:rounded-xl px-4 py-4 flex items-center justify-between text-brand-dark/60 text-xs md:text-sm cursor-pointer hover:bg-gray-100 transition-colors group"
                    >
                      <span>{selectedStyles.length > 0 ? `${selectedStyles.length} selecionado(s)` : 'Escolher'}</span>
                      <ArrowUpRight className="w-5 h-5 group-hover:text-[#617964] transition-colors" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-brand-dark/70 block text-left">Localização</label>
                    <button 
                      onClick={() => setIsLocationModalOpen(true)}
                      className="w-full bg-white rounded-lg md:rounded-xl px-4 py-4 flex items-center justify-between text-brand-dark/60 text-xs md:text-sm cursor-pointer hover:bg-gray-100 transition-colors group"
                    >
                      <span className="truncate pr-4">
                        {selectedLocations.length > 0 
                          ? selectedLocations.join(', ') 
                          : 'Escolher'}
                      </span>
                      <ArrowUpRight className="w-5 h-5 group-hover:text-[#617964] transition-colors shrink-0" />
                    </button>
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-4">
                  <label className="text-base font-medium text-[#7A756E] block text-left">Faixa de preço</label>
                  <div className="relative pt-6 pb-2 px-2">
                    <div ref={sliderRef} className="h-1.5 bg-[#E5E5E0] rounded-full relative">
                      {/* Active track */}
                      <motion.div 
                        className="absolute h-full bg-[#617964] rounded-full"
                        style={{
                          left: leftThumbX,
                          right: rightPos
                        }}
                      />
                      
                      {/* Left Thumb */}
                      <motion.div
                        drag="x"
                        dragMomentum={false}
                        dragElastic={0}
                        dragConstraints={sliderRef}
                        onDragStart={() => {
                          setIsInteractingMin(true);
                          setIsPriceTouched(true);
                        }}
                        onDragEnd={() => setIsInteractingMin(false)}
                        onDrag={(_, info) => updatePrice('min', leftThumbX.get())}
                        style={{ x: leftThumbX }}
                        className="absolute top-1/2 -translate-y-1/2 -ml-3 w-6 h-6 bg-[#617964] border-2 border-white rounded-full flex items-center justify-center cursor-pointer z-20"
                      />

                      {/* Right Thumb */}
                      <motion.div
                        drag="x"
                        dragMomentum={false}
                        dragElastic={0}
                        dragConstraints={sliderRef}
                        onDragStart={() => {
                          setIsInteractingMax(true);
                          setIsPriceTouched(true);
                        }}
                        onDragEnd={() => setIsInteractingMax(false)}
                        onDrag={(_, info) => updatePrice('max', rightThumbX.get())}
                        style={{ x: rightThumbX }}
                        className="absolute top-1/2 -translate-y-1/2 -ml-3 w-6 h-6 bg-[#617964] border-2 border-white rounded-full flex items-center justify-center cursor-pointer z-20"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-brand-dark/40 uppercase tracking-widest block text-left">Valor Mínimo</label>
                      <div className="w-full bg-white rounded-2xl px-3 py-4 text-brand-dark font-bold text-center flex items-center justify-center gap-1">
                        {(isPriceTouched || isMinFocused) && <span className="text-[#617964]">R$</span>}
                        <input 
                          type="text"
                          value={isMinFocused ? minPriceInput : (isPriceTouched ? minPriceInput : 'Sem valor mínimo')}
                          onChange={(e) => handlePriceInputChange('min', e.target.value)}
                          onFocus={() => {
                            setIsPriceTouched(true);
                            setIsMinFocused(true);
                            setMinPriceInput(''); // Clear on focus
                          }}
                          onBlur={() => {
                            setIsMinFocused(false);
                            const numericValue = parseInt(minPriceInput.replace(/\D/g, '')) || priceRange.min;
                            setMinPriceInput(formatCurrency(numericValue));
                            setPriceRange(prev => ({ ...prev, min: numericValue }));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                          className={`bg-transparent border-none outline-none w-full text-center p-0 ${!(isPriceTouched || isMinFocused) ? 'text-brand-dark/30' : ''}`}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-brand-dark/40 uppercase tracking-widest block text-left">Valor Máximo</label>
                      <div className="w-full bg-white rounded-2xl px-3 py-4 text-brand-dark font-bold text-center flex items-center justify-center gap-1">
                        {(isPriceTouched || isMaxFocused) && <span className="text-[#617964]">R$</span>}
                        <input 
                          type="text"
                          value={isMaxFocused ? maxPriceInput : (isPriceTouched ? maxPriceInput : 'Sem valor máximo')}
                          onChange={(e) => handlePriceInputChange('max', e.target.value)}
                          onFocus={() => {
                            setIsPriceTouched(true);
                            setIsMaxFocused(true);
                            setMaxPriceInput(''); // Clear on focus
                          }}
                          onBlur={() => {
                            setIsMaxFocused(false);
                            const numericValue = parseInt(maxPriceInput.replace(/\D/g, '')) || priceRange.max;
                            setMaxPriceInput(formatCurrency(numericValue));
                            setPriceRange(prev => ({ ...prev, max: numericValue }));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                          className={`bg-transparent border-none outline-none w-full text-center p-0 ${!(isPriceTouched || isMaxFocused) ? 'text-brand-dark/30' : ''}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Suites & Vagas */}
                <div className="space-y-4">
                  {[
                    { id: 'suites', label: 'Suítes', options: ['1', '2', '3', '4', '5+'], state: suites, setState: setSuites },
                    { id: 'vagas', label: 'Vagas de garagem', options: ['1', '2', '3', '4', '5+'], state: vagas, setState: setVagas }
                  ].map((group) => (
                    <div key={group.id} className="space-y-2">
                      <label className="text-sm font-semibold text-brand-dark/70 block text-left">{group.label}</label>
                      <div className="grid grid-cols-5 gap-2">
                        {group.options.map((opt) => (
                          <button 
                            key={opt} 
                            onClick={() => {
                              if (group.state.includes(opt)) {
                                group.setState(group.state.filter(o => o !== opt));
                              } else {
                                group.setState([...group.state, opt]);
                              }
                            }}
                            className={`py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                              group.state.includes(opt) 
                                ? 'bg-[#617964] text-white' 
                                : 'bg-white text-brand-dark/80 hover:bg-[#617964] hover:text-white'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Actions INSIDE Card 2 */}
                <div className="pt-4 flex items-center justify-between border-t border-brand-dark/5">
                  <button 
                    onClick={handleClearFilters}
                    className="flex items-center gap-2 text-brand-dark/60 font-bold text-sm hover:text-[#617964] transition-colors cursor-pointer group"
                  >
                    <div className="bg-white p-2 rounded-lg shadow-sm group-hover:bg-[#617964] group-hover:text-white transition-all">
                      <Eraser className="w-4 h-4" />
                    </div>
                    Limpar filtros
                  </button>
                  <motion.button 
                    onClick={handleSearch}
                    whileHover="hover"
                    whileTap="tap"
                    variants={{
                      hover: { 
                        scale: 1.05,
                        backgroundColor: "#617964",
                      },
                      tap: { scale: 0.95 }
                    }}
                    className="relative bg-[#617964] text-white px-12 py-4 rounded-full font-bold transition-all cursor-pointer overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Buscar
                      <Search className="hidden md:block w-5 h-5 transition-transform group-hover:scale-125" />
                    </span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Location Modal */}
          <AnimatePresence>
            {isLocationModalOpen && (
              <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsLocationModalOpen(false)}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[80vh]"
                >
                  {/* Drag Handle for Mobile */}
                  <div className="md:hidden flex justify-center pt-4 -mb-2">
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
                  </div>

                  {/* Header */}
                  <div className="p-6 md:p-8 border-b border-gray-50">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-brand-dark">Localização</h2>
                    </div>
                  </div>

                  {/* Scrollable Content */}
                  <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 md:w-5 md:h-5 text-gray-400" />
                      <input 
                        type="text" 
                        value={locationSearch}
                        onChange={(e) => setLocationSearch(e.target.value)}
                        placeholder="Digite a rua, bairro ou cidade..."
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#617964] rounded-2xl pl-12 pr-4 py-4 outline-none transition-all font-medium"
                        autoFocus
                      />
                    </div>

                    <div className="space-y-1">
                      {filteredLocations.length > 0 ? (
                        filteredLocations.map((loc) => (
                          <button
                            key={loc}
                            onClick={() => {
                              setSelectedLocations(prev => 
                                prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
                              );
                            }}
                            className={`w-full flex items-center gap-4 p-4 rounded-lg md:rounded-xl transition-colors text-left group cursor-pointer ${
                              selectedLocations.includes(loc) ? 'bg-[#617964]/10' : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className={`p-2 rounded-lg transition-colors ${
                              selectedLocations.includes(loc) ? 'bg-[#617964] text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-white'
                            }`}>
                              {selectedLocations.includes(loc) ? <Check className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                            </div>
                            <span className={`font-semibold transition-colors ${
                              selectedLocations.includes(loc) ? 'text-[#617964]' : 'text-brand-dark'
                            }`}>{loc}</span>
                          </button>
                        ))
                      ) : locationSearch.length > 0 ? (
                        <div className="py-8 text-center text-gray-400 font-medium">
                          Nenhum local encontrado para "{locationSearch}"
                        </div>
                      ) : (
                        <div className="py-8 text-center text-gray-400 font-medium">
                          Comece a digitar para ver sugestões
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-6 md:p-8 border-t border-gray-50 flex justify-center">
                    <button 
                      onClick={() => setIsLocationModalOpen(false)}
                      className={`px-10 py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        selectedLocations.length > 0 
                          ? 'bg-[#617964] text-white hover:bg-[#617964]/90' 
                          : 'bg-gray-100 text-brand-dark hover:bg-gray-200'
                      }`}
                    >
                      Pronto
                      <ThumbsUp className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Property Style Modal */}
          <AnimatePresence>
            {isStyleModalOpen && (
              <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsStyleModalOpen(false)}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh]"
                >
                  {/* Drag Handle for Mobile */}
                  <div className="md:hidden flex justify-center pt-4 -mb-2">
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
                  </div>

                  {/* Header */}
                  <div className="p-6 md:p-8 border-b border-gray-50">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-brand-dark">Tipo de Imóvel</h2>
                      <div className="flex items-center gap-6">
                        <button 
                          onClick={() => setSelectedStyles([])}
                          className="text-sm font-bold text-gray-400 hover:text-[#617964] transition-colors cursor-pointer"
                        >
                          Limpar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Scrollable Content */}
                  <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {PROPERTY_STYLES.map((style) => (
                        <button
                          key={style}
                          onClick={() => toggleStyle(style)}
                          className={`w-full py-4 px-4 rounded-lg md:rounded-xl border text-[10px] md:text-sm font-bold transition-all cursor-pointer text-center ${
                            selectedStyles.includes(style)
                              ? 'bg-[#617964] text-white border-[#617964] shadow-md'
                              : 'bg-white text-brand-dark border-gray-200 hover:border-[#617964] hover:text-[#617964]'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-6 md:p-8 border-t border-gray-50 flex justify-center">
                    <button 
                      onClick={() => setIsStyleModalOpen(false)}
                      className={`px-10 py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        selectedStyles.length > 0 
                          ? 'bg-[#617964] text-white hover:bg-[#617964]/90' 
                          : 'bg-gray-100 text-brand-dark hover:bg-gray-200'
                      }`}
                    >
                      Pronto
                      <ThumbsUp className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
