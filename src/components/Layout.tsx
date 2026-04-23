import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import SearchMenu from './SearchMenu';
import MobileNav from './MobileNav';
import LoginModal from './LoginModal';
import { useProperties } from '../context/PropertyContext';
import { useCondos } from '../context/CondoContext';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // We don't necessarily want to crash the whole app for a favorite sync error
  // but we log it for debugging.
}

export default function Layout() {
  const { properties } = useProperties();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [negotiation, setNegotiation] = useState<'comprar' | 'alugar' | 'permuta'>('comprar');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [favorites, setFavorites] = useState<(string | number)[]>(() => {
    try {
      const saved = localStorage.getItem('assiss_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const playSound = (type: 'pop' | 'trash') => {
    const sounds = {
      pop: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      trash: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'
    };
    const audio = new Audio(sounds[type]);
    audio.volume = 0.4;
    audio.play().catch(() => {}); // Ignore autoplay blocks
  };

  // Filter favorites to only include properties or condos that actually exist
  const { condos } = useCondos();
  const activeFavorites = useMemo(() => {
    return favorites.filter(id => {
      const idStr = String(id);
      if (idStr.startsWith('condo_')) {
        const actualId = idStr.replace('condo_', '');
        return condos.some(c => String(c.id) === actualId);
      }
      return properties.some(p => String(p.id) === idStr);
    });
  }, [favorites, properties, condos]);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Sync favorites with Firestore when logged in
  useEffect(() => {
    if (!currentUser) return;

    const userDocRef = doc(db, 'users', currentUser.uid);
    
    // Listen for changes in Firestore
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        
        // Sincronizar favoritos
        if (userData.favorites) {
          setFavorites(userData.favorites);
        }
      }
    }, (err) => {
      // Se der erro de permissão ao tentar ler o próprio doc, algo está errado com o vínculo do UID
      if (err.message.includes('permission')) {
        console.error('Erro de permissão no Layout para o UID:', currentUser.uid);
      } else {
        handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Save to localStorage (fallback/guest) and Firestore (if logged in)
  useEffect(() => {
    localStorage.setItem('assiss_favorites', JSON.stringify(favorites));

    if (currentUser) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      setDoc(userDocRef, { favorites }, { merge: true })
        .catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`));
    }
  }, [favorites, currentUser]);

  const clearFavorites = () => {
    playSound('trash');
    setFavorites([]);
    setToast({ message: 'Lista de favoritos limpa', type: 'info' });
  };

  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [whatsappForm, setWhatsappForm] = useState({ name: '', message: '' });
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/admin');

  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const phone = "5524981000306";
    const siteRef = window.location.href;
    const text = `Olá me chamo *${whatsappForm.name}*, estou no site e ${whatsappForm.message}\n\nRef: ${siteRef}`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/${phone}?text=${encodedText}`, '_blank');
    setIsWhatsAppModalOpen(false);
    setWhatsappForm({ name: '', message: '' });
  };

  const toggleFavorite = (id: string | number, type: 'property' | 'condo' = 'property') => {
    const favId = type === 'condo' ? `condo_${id}` : String(id);
    
    setFavorites(prev => {
      const isFavorited = prev.includes(favId);
      if (!isFavorited) {
        playSound('pop');
        setToast({ 
          message: type === 'condo' ? 'Condomínio adicionado aos favoritos' : 'Imóvel adicionado aos favoritos', 
          type: 'success' 
        });
      }
      return isFavorited ? prev.filter(f => f !== favId) : [...prev, favId];
    });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    setIsMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen selection:bg-brand-rust/20 font-sans overflow-x-hidden">
      {!isDashboard && (
        <>
          <Header 
            isScrolled={isScrolled} 
            isMenuOpen={isMenuOpen} 
            setIsMenuOpen={setIsMenuOpen} 
            isMobileNavOpen={isMobileNavOpen}
            setIsMobileNavOpen={setIsMobileNavOpen}
            favoritesCount={activeFavorites.length}
            onLoginClick={() => setIsLoginModalOpen(true)}
          />
          
          <SearchMenu 
            isMenuOpen={isMenuOpen} 
            setIsMenuOpen={setIsMenuOpen} 
            isDesktop={isDesktop} 
            negotiation={negotiation} 
            setNegotiation={setNegotiation} 
          />

          <MobileNav 
            isOpen={isMobileNavOpen} 
            onClose={() => setIsMobileNavOpen(false)} 
          />
        </>
      )}

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <Outlet context={{ favorites: activeFavorites, toggleFavorite, clearFavorites }} />
        </motion.main>
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[500] bg-[#132014] text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-[#617964]/20"
          >
            <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-[#617964]' : 'bg-blue-400'}`} />
            <span className="text-sm font-bold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {!isDashboard && <Footer />}

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />

      {/* WhatsApp Modal */}
      <AnimatePresence>
        {isWhatsAppModalOpen && (
          <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWhatsAppModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl max-h-[95vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="bg-[#075E54] p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Atendimento WhatsApp</h3>
                    <p className="text-white/70 text-xs">Online agora</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsWhatsAppModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleWhatsAppSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-marromescuro/40 uppercase tracking-widest">Seu Nome</label>
                  <input
                    required
                    type="text"
                    value={whatsappForm.name}
                    onChange={(e) => setWhatsappForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Como podemos te chamar?"
                    className="w-full bg-marromescuro/5 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#25D366] transition-all outline-none text-marromescuro font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-marromescuro/40 uppercase tracking-widest">O que você precisa?</label>
                  <textarea
                    required
                    value={whatsappForm.message}
                    onChange={(e) => setWhatsappForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Digite sua mensagem aqui..."
                    rows={4}
                    className="w-full bg-marromescuro/5 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#25D366] transition-all outline-none text-marromescuro font-medium resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-[#128C7E] transition-all flex items-center justify-center gap-3 group"
                >
                  <span>Enviar Mensagem</span>
                  <MessageCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
                </button>
                <p className="text-center text-[10px] text-marromescuro/30 font-medium">
                  Ao clicar em enviar, você será redirecionado para o WhatsApp.
                </p>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp Button */}
      {!isDashboard && (
        <motion.button
          onClick={() => setIsWhatsAppModalOpen(true)}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-8 right-8 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:bg-[#128C7E] transition-colors flex items-center justify-center group cursor-pointer"
        >
          <div className="relative">
            <MessageCircle className="w-8 h-8" />
            {/* Notification Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, type: "spring" }}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#25D366] shadow-lg"
            >
              1
            </motion.div>
          </div>
          <span className="absolute right-full mr-4 bg-white text-brand-dark px-4 py-2 rounded-xl text-sm font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Fale conosco no WhatsApp
          </span>
        </motion.button>
      )}
    </div>
  );
}
