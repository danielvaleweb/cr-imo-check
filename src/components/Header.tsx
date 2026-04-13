import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Search, Heart, User, ChevronDown, ChevronRight } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useCondos } from '../context/CondoContext';
import { useProperties } from '../context/PropertyContext';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface HeaderProps {
  isScrolled: boolean;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;
  favoritesCount: number;
  onLoginClick: () => void;
}

export default function Header({ isScrolled, isMenuOpen, setIsMenuOpen, isMobileNavOpen, setIsMobileNavOpen, favoritesCount, onLoginClick }: HeaderProps) {
  const navigate = useNavigate();
  const { condos } = useCondos();
  const { properties } = useProperties();
  const [hasScrolledOnce, setHasScrolledOnce] = useState(false);
  const [isCondoMenuOpen, setIsCondoMenuOpen] = useState(false);
  const [isLaunchMenuOpen, setIsLaunchMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const condoButtonRef = useRef<HTMLAnchorElement>(null);
  const launchButtonRef = useRef<HTMLAnchorElement>(null);
  const [dropdownLeft, setDropdownLeft] = useState(0);
  const [launchDropdownLeft, setLaunchDropdownLeft] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const launchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isPropertyDetail = location.pathname.startsWith('/imovel/');
  const isCondosList = location.pathname === '/condominios';
  const isCondoDetail = location.pathname.startsWith('/condominio/');
  const isTransparentPage = true;
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setHasScrolledOnce(false);
  }, [location.pathname]);

  const handleUserClick = async () => {
    if (user) {
      navigate('/dashboard-corretor');
    } else {
      onLoginClick();
    }
  };

  const handleCondoMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsCondoMenuOpen(true);
  };

  const handleCondoMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsCondoMenuOpen(false);
    }, 100);
  };

  const closeCondoMenu = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsCondoMenuOpen(false);
  };

  const handleLaunchMouseEnter = () => {
    if (launchTimeoutRef.current) clearTimeout(launchTimeoutRef.current);
    setIsLaunchMenuOpen(true);
  };

  const handleLaunchMouseLeave = () => {
    launchTimeoutRef.current = setTimeout(() => {
      setIsLaunchMenuOpen(false);
    }, 100);
  };

  const closeLaunchMenu = () => {
    if (launchTimeoutRef.current) clearTimeout(launchTimeoutRef.current);
    setIsLaunchMenuOpen(false);
  };

  useEffect(() => {
    const updatePosition = () => {
      if (isCondoMenuOpen && condoButtonRef.current && headerRef.current) {
        const buttonRect = condoButtonRef.current.getBoundingClientRect();
        const headerRect = headerRef.current.getBoundingClientRect();
        setDropdownLeft(buttonRect.left - headerRect.left + buttonRect.width / 2);
      }
      if (isLaunchMenuOpen && launchButtonRef.current && headerRef.current) {
        const buttonRect = launchButtonRef.current.getBoundingClientRect();
        const headerRect = headerRef.current.getBoundingClientRect();
        setLaunchDropdownLeft(buttonRect.left - headerRect.left + buttonRect.width / 2);
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [isCondoMenuOpen, isLaunchMenuOpen]);

  useEffect(() => {
    if (isScrolled && !hasScrolledOnce) {
      setHasScrolledOnce(true);
    }
  }, [isScrolled, hasScrolledOnce]);

  const [isHeartHovered, setIsHeartHovered] = useState(false);
  const [isUserHovered, setIsUserHovered] = useState(false);
  const [isDeepScrolled, setIsDeepScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsDeepScrolled(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // The user requested that on first load the navbar does not appear, only when scrolling.
  // Once it appears, it stays visible even when returning to top.
  // This behavior resets on page change.
  const shouldShow = isScrolled || hasScrolledOnce;

  const navbarBg = isCondoDetail
    ? (shouldShow ? (isDeepScrolled ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.1)") : "rgba(255, 255, 255, 0)")
    : (isTransparentPage 
        ? (shouldShow ? "rgba(55, 64, 1, 0.3)" : "rgba(55, 64, 1, 0)")
        : (shouldShow ? "#617964" : "transparent"));

  return (
    <header ref={headerRef} className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[98%] max-w-[1800px] flex items-center gap-4">
      <motion.nav 
        initial={false}
        animate={{
          backgroundColor: navbarBg,
          backdropFilter: shouldShow ? "blur(16px)" : "blur(0px)",
          borderColor: shouldShow ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0)",
          borderWidth: "1px",
          boxShadow: shouldShow ? "0 25px 50px -12px rgba(0, 0, 0, 0.25)" : "0 0px 0px 0px rgba(0, 0, 0, 0)",
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="relative z-10 flex-1 rounded-full py-3 px-8 flex items-center justify-between border-transparent"
      >
        {/* Logo Section - Fade in on scroll */}
        <AnimatePresence>
          {shouldShow && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link to="/" className="flex items-center gap-3 shrink-0">
                <img 
                  src="https://i.imgur.com/egg4k7M.png" 
                  alt="CR Imóveis" 
                  className="h-10 w-auto"
                  referrerPolicy="no-referrer"
                />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Menu - Fade in on scroll */}
        <AnimatePresence>
          {shouldShow && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="hidden lg:flex items-center gap-8 text-brand-cream/90 text-sm font-medium tracking-wide mx-8 group/nav"
            >
              <Link to="/comprar" className="transition-all duration-300 group-hover/nav:opacity-40 hover:!opacity-100 hover:!text-white cursor-pointer">Imóveis</Link>
              
              {/* Condomínios Dropdown Trigger */}
              <div 
                className="relative group/condo"
                onMouseEnter={handleCondoMouseEnter}
                onMouseLeave={handleCondoMouseLeave}
              >
                <Link 
                  to="/condominios"
                  ref={condoButtonRef}
                  className="flex items-center gap-1 transition-all duration-300 group-hover/nav:opacity-40 group-hover/condo:!opacity-100 group-hover/condo:!text-white cursor-pointer"
                >
                  Condomínios
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isCondoMenuOpen ? 'rotate-180' : ''}`} />
                </Link>
              </div>
              
              {/* Lançamentos Dropdown Trigger */}
              <div 
                className="relative group/launch"
                onMouseEnter={handleLaunchMouseEnter}
                onMouseLeave={handleLaunchMouseLeave}
              >
                <Link 
                  to="/lancamentos"
                  ref={launchButtonRef}
                  className="flex items-center gap-1 transition-all duration-300 group-hover/nav:opacity-40 group-hover/launch:!opacity-100 group-hover/launch:!text-white cursor-pointer"
                >
                  Lançamentos
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isLaunchMenuOpen ? 'rotate-180' : ''}`} />
                </Link>
              </div>

              <Link to="/sobre" className="transition-all duration-300 group-hover/nav:opacity-40 hover:!opacity-100 hover:!text-white cursor-pointer">Sobre</Link>
              <Link to="/contato" className="transition-all duration-300 group-hover/nav:opacity-40 hover:!opacity-100 hover:!text-white cursor-pointer">Contato</Link>
              <Link to="/vender" className="transition-all duration-300 group-hover/nav:opacity-40 hover:!opacity-100 hover:!text-white cursor-pointer">Quero vender</Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons - Fade in on scroll */}
        <AnimatePresence>
          {shouldShow && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 md:gap-4 shrink-0"
            >
              {/* Desktop Search Button */}
              <button 
                onClick={() => setIsMenuOpen(true)}
                className={`hidden lg:flex items-center gap-2 bg-white text-brand-dark px-6 py-2 rounded-full text-sm font-bold ${isTransparentPage ? 'hover:bg-[#617964]' : 'hover:bg-[#617964]'} hover:text-white transition-all shadow-lg cursor-pointer group`}
              >
                <Search className="w-4 h-4 text-[#617964] group-hover:text-white group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                <span>Buscar imóvel</span>
              </button>

              {/* Mobile Action Group (Search + Favorites + Menu) */}
              <div className="flex lg:hidden items-center gap-1 md:gap-2">
                {/* Search Button */}
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-brand-cream p-2 hover:bg-white/10 rounded-full transition-colors relative z-[60] cursor-pointer group/search"
                >
                  <Search className="w-6 h-6 transition-transform group-hover/search:scale-125" />
                </button>

                {/* Favorites Button (Mobile) */}
                <button 
                  onClick={() => navigate('/favoritos')}
                  onMouseEnter={() => setIsHeartHovered(true)}
                  onMouseLeave={() => setIsHeartHovered(false)}
                  className="text-brand-cream p-2 hover:bg-white/10 rounded-full transition-colors relative z-[60] cursor-pointer"
                >
                  <div className="relative">
                    <Heart className="w-6 h-6 fill-white" />
                    {favoritesCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-[#617964] text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white/20">
                        {favoritesCount}
                      </div>
                    )}
                  </div>
                </button>

                {/* Login/Dashboard Button (Mobile) */}
                <button 
                  onClick={handleUserClick}
                  className="text-brand-cream p-2 hover:bg-white/10 rounded-full transition-colors relative z-[60] cursor-pointer group/login"
                >
                  {user ? (
                    <div className="relative">
                      <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-6 h-6 rounded-full border border-white/20" />
                      <div className="absolute -bottom-1 -right-1 bg-[#25D366] w-2.5 h-2.5 rounded-full border-2 border-[#617964]" />
                    </div>
                  ) : (
                    <User className="w-6 h-6 transition-transform group-hover/login:scale-125" />
                  )}
                </button>

                {/* Menu Button (Three lines) */}
                <button 
                  onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                  className="text-brand-cream p-2 hover:bg-white/10 rounded-full transition-colors relative z-[60] cursor-pointer"
                >
                  <motion.div
                    animate={isMobileNavOpen ? { rotate: 90 } : { rotate: 0 }}
                    whileHover={{ scale: 1.25 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isMobileNavOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                  </motion.div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

          {/* Action Icons - Desktop Only (Outside to the right) */}
          <AnimatePresence>
            {shouldShow && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`hidden lg:flex items-center gap-2 shrink-0 ${isCondoDetail ? 'drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]' : ''}`}
              >
                {/* Favorites Icon */}
                <button 
                  onClick={() => navigate('/favoritos')}
                  onMouseEnter={() => setIsHeartHovered(true)}
                  onMouseLeave={() => setIsHeartHovered(false)}
                  className="relative group cursor-pointer p-2"
                >
                  <div className="relative">
                    <Heart className="w-7 h-7 text-white fill-white transition-all group-hover:scale-125 group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]" />
                    
                    {/* Badge with pulsing green effect */}
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5">
                      {/* Pulse background */}
                      <motion.div
                        animate={isHeartHovered ? {
                          scale: [1, 1.6, 1],
                          opacity: [0.7, 0, 0.7],
                        } : {
                          scale: 1,
                          opacity: 0
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute inset-0 bg-[#617964] rounded-full"
                      />
                      {/* Main badge circle */}
                      <div className="relative bg-[#617964] text-white text-[10px] font-bold w-full h-full rounded-full flex items-center justify-center border border-white/20 shadow-sm">
                        {favoritesCount}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Login/Dashboard Icon */}
                <div className="relative group/user">
                  <button 
                    onClick={handleUserClick}
                    onMouseEnter={() => setIsUserHovered(true)}
                    onMouseLeave={() => setIsUserHovered(false)}
                    className="relative group cursor-pointer p-2"
                  >
                    {user ? (
                      <div className="relative">
                        <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-8 h-8 rounded-full border-2 border-white/20 group-hover:border-white transition-all shadow-lg group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.5)]" />
                        <div className="absolute -bottom-0.5 -right-0.5 bg-[#25D366] w-3 h-3 rounded-full border-2 border-[#617964]" />
                      </div>
                    ) : (
                      <User className="w-7 h-7 text-white transition-all group-hover:scale-125 group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]" />
                    )}
                  </button>
                  
                  {user && (
                    <div className="absolute top-full right-0 mt-2 opacity-0 group-hover/user:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-[#617964] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                        Acessar Dashboard
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

      {/* Condomínios Dropdown (Sibling of nav to appear behind it) */}
      <AnimatePresence>
        {isCondoMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              backgroundColor: navbarBg,
              backdropFilter: isTransparentPage 
                ? (shouldShow ? "blur(16px)" : "blur(0px)")
                : "blur(16px)",
            }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            style={{ left: dropdownLeft, top: '100%' }}
            className="absolute -translate-x-1/2 mt-2 w-64 rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden p-2 z-0"
            onMouseEnter={handleCondoMouseEnter}
            onMouseLeave={handleCondoMouseLeave}
          >
            <div className="space-y-1">
              {condos
                .filter(condo => !properties.some(p => p.condoId === condo.id && p.listingType === 'lançamento'))
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((condo) => (
                <Link
                  key={condo.id}
                  to={`/condominio/${condo.id}`}
                  onClick={closeCondoMenu}
                  className="block px-4 py-3 text-brand-cream/80 hover:text-white hover:bg-white/10 rounded-2xl transition-all font-medium text-xs group/item"
                >
                  <div className="flex items-center justify-between">
                    <span>{condo.name}</span>
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover/item:opacity-100 transition-all group-hover/item:translate-x-1" />
                  </div>
                </Link>
              ))}
              <div className="border-t border-white/10 mt-1 pt-1">
                <Link
                  to="/condominios"
                  onClick={closeCondoMenu}
                  className="block px-4 py-3 text-white bg-white/5 hover:bg-white/10 rounded-2xl transition-all font-bold text-[10px] uppercase tracking-widest text-center"
                >
                  Ver todos condomínios
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lançamentos Dropdown */}
      <AnimatePresence>
        {isLaunchMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              backgroundColor: navbarBg,
              backdropFilter: isTransparentPage 
                ? (shouldShow ? "blur(16px)" : "blur(0px)")
                : "blur(16px)",
            }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            style={{ left: launchDropdownLeft, top: '100%' }}
            className="absolute -translate-x-1/2 mt-2 w-72 rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden p-2 z-0"
            onMouseEnter={handleLaunchMouseEnter}
            onMouseLeave={handleLaunchMouseLeave}
          >
            <div className="space-y-1">
              {properties
                .filter(p => p.listingType === 'lançamento')
                .slice()
                .sort((a, b) => a.title.localeCompare(b.title))
                .map((prop) => (
                <Link
                  key={prop.id}
                  to={`/imovel/${prop.id}`}
                  onClick={closeLaunchMenu}
                  className="block px-4 py-3 text-brand-cream/80 hover:text-white hover:bg-white/10 rounded-2xl transition-all font-medium text-xs group/item"
                >
                  <div className="flex items-center justify-between">
                    <span>{prop.title}</span>
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover/item:opacity-100 transition-all group-hover/item:translate-x-1" />
                  </div>
                </Link>
              ))}
              <div className="border-t border-white/10 mt-1 pt-1">
                <Link
                  to="/lancamentos"
                  onClick={closeLaunchMenu}
                  className="block px-4 py-3 text-white bg-white/5 hover:bg-white/10 rounded-2xl transition-all font-bold text-[10px] uppercase tracking-widest text-center"
                >
                  Ver todos lançamentos
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
