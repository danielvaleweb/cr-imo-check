import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Check, 
  Mail, 
  Phone, 
  IdCard, 
  AlertCircle, 
  MessageCircle, 
  RotateCcw,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, query, collection, where, getDocs } from 'firebase/firestore';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form States
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    creci: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Error/Success States
  const [errorHeader, setErrorHeader] = useState<string | null>(null);
  const [customError, setCustomError] = useState<{
    title: string;
    message: string;
    showModal: boolean;
    type: 'auth_pending' | 'invalid_creds';
  }>({
    title: '',
    message: '',
    showModal: false,
    type: 'invalid_creds'
  });

  const navigate = useNavigate();

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'register' : 'login');
    setErrorHeader(null);
    setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const checkUserStatus = async (uid: string) => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data().status;
    }
    return null;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorHeader(null);

    const email = formData.email.trim();
    const password = formData.password.trim();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Administrador entra direto
      const adminEmail = 'danielvaleweb@gmail.com';
      if (email.toLowerCase() === adminEmail.toLowerCase()) {
        onClose();
        navigate('/dashboard-corretor');
        return;
      }

      const status = await checkUserStatus(userCredential.user.uid);

      if (status === 'pending') {
        await signOut(auth);
        setCustomError({
          title: 'Aguardando Aprovação',
          message: 'Seu cadastro foi recebido! Estamos analisando seus dados. Você receberá uma notificação assim que for autorizado.',
          showModal: true,
          type: 'auth_pending'
        });
        return;
      }

      if (status === 'rejected') {
        await signOut(auth);
        setErrorHeader('Seu acesso foi recusado. Entre em contato com o suporte.');
        return;
      }

      if (!status) {
        // Caso estranho onde Auth existe mas Firestore não
        await signOut(auth);
        setErrorHeader('Perfil não encontrado no sistema.');
        return;
      }

      onClose();
      navigate('/dashboard-corretor');
    } catch (error: any) {
      console.error("Auth error full:", error);
      const errorCode = error.code || error.message;
      await signOut(auth); // Garantir logout se houver erro ou falta de permissão
      
      if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
        setErrorHeader('E-mail ou senha incorretos.');
      } else if (errorCode === 'auth/invalid-email') {
        setErrorHeader('O e-mail digitado não é válido.');
      } else if (errorCode === 'auth/too-many-requests') {
        setErrorHeader('Muitas tentativas sem sucesso. Tente novamente mais tarde.');
      } else {
        setErrorHeader(`Erro ao tentar fazer login (${errorCode}). Tente novamente.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const email = formData.email.trim();
    const password = formData.password.trim();

    if (password !== formData.confirmPassword.trim()) {
      setErrorHeader('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setErrorHeader('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    setErrorHeader(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user) {
        throw new Error('Não foi possível criar o usuário.');
      }

      // Update Auth Profile
      await updateProfile(userCredential.user, {
        displayName: formData.name.trim()
      });

      // Create Firestore Doc
      const userEmail = email.toLowerCase();
      const registrationData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        creci: formData.creci.trim(),
        email: userEmail,
        status: 'pending',
        role: 'user',
        createdAt: new Date().toISOString()
      };

      console.log("Attempting to save user document:", {
        uid: userCredential.user.uid,
        data: registrationData
      });

      await setDoc(doc(db, 'users', userCredential.user.uid), registrationData);

      // Show success wait modal
      await signOut(auth);
      setCustomError({
        title: 'Solicitação Enviada',
        message: 'Seu cadastro foi recebido com sucesso! Um administrador irá revisar sua conta. Você será avisado quando puder logar.',
        showModal: true,
        type: 'auth_pending'
      });
      
    } catch (error: any) {
      console.error("Registration error full:", error);
      const errorCode = error.code || error.message;
      
      if (errorCode === 'auth/email-already-in-use') {
        setErrorHeader('Este e-mail já está sendo usado por outra conta. Tente fazer login.');
      } else if (errorCode === 'auth/weak-password') {
        setErrorHeader('A senha é muito fraca. Use pelo menos 6 caracteres.');
      } else if (errorCode === 'auth/invalid-email') {
        setErrorHeader('O e-mail digitado não é válido.');
      } else if (error.message?.includes('permission-denied') || errorCode === 'permission-denied' || error.message?.includes('Missing or insufficient permissions')) {
        setErrorHeader('O seu navegador está bloqueando a conexão com o banco de dados (ERR_BLOCKED_BY_CLIENT). Por favor, desative extensões como AdBlock ou o Shield do Brave para concluir o cadastro.');
      } else {
        setErrorHeader(`Erro ao realizar cadastro (${errorCode}). Verifique os dados e tente novamente de forma manual.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const closeCustomModal = () => {
    setCustomError(prev => ({ ...prev, showModal: false }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[450px] min-h-[70vh] sm:min-h-[600px] max-h-[95vh] sm:max-h-none overflow-y-auto sm:overflow-visible rounded-t-[32px] sm:rounded-[32px] shadow-2xl border border-white/10 flex flex-col bg-[#1A1A1A]/90 backdrop-blur-[40px]"
          >
            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col p-6 md:p-10 text-white">
              {/* Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
                disabled={isLoading}
              >
                <X className="w-6 h-6" />
              </button>

              <div className="mt-6 md:mt-8 space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight uppercase italic font-serif">ÁREA DO CORRETOR</h2>
                <p className="text-white/70 text-sm">
                  {mode === 'login' 
                    ? 'Olá corretor! Faça seu login.' 
                    : 'Preencha seus dados para se associar.'}
                </p>
              </div>

              {errorHeader && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <p className="text-sm text-red-100">{errorHeader}</p>
                </motion.div>
              )}

              <div className="mt-8 md:mt-10">
                <form 
                  className="space-y-4 md:space-y-5" 
                  onSubmit={mode === 'login' ? handleLogin : handleRegister}
                >
                  {mode === 'register' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-5"
                    >
                      {/* Name Input */}
                      <div className="relative group">
                        <input 
                          type="text" 
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Nome Completo"
                          className="w-full bg-white/5 border border-white/20 rounded-xl py-3.5 pl-6 pr-12 text-white placeholder:text-white/40 focus:border-[#617964] transition-all outline-none"
                        />
                        <User className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      </div>

                      {/* Phone Input */}
                      <div className="relative group">
                        <input 
                          type="tel" 
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Telefone / WhatsApp"
                          className="w-full bg-white/5 border border-white/20 rounded-xl py-3.5 pl-6 pr-12 text-white placeholder:text-white/40 focus:border-[#617964] transition-all outline-none"
                        />
                        <Phone className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      </div>

                      {/* CRECI Input */}
                      <div className="relative group">
                        <input 
                          type="text" 
                          name="creci"
                          required
                          value={formData.creci}
                          onChange={handleInputChange}
                          placeholder="CRECI"
                          className="w-full bg-white/5 border border-white/20 rounded-xl py-3.5 pl-6 pr-12 text-white placeholder:text-white/40 focus:border-[#617964] transition-all outline-none"
                        />
                        <IdCard className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      </div>
                    </motion.div>
                  )}

                  {/* Email Input */}
                  <div className="relative group">
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="E-mail"
                      className="w-full bg-white/5 border border-white/20 rounded-xl py-3.5 pl-6 pr-12 text-white placeholder:text-white/40 focus:border-[#617964] transition-all outline-none"
                    />
                    <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  </div>

                  {/* Password Input */}
                  <div className="relative group">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder={mode === 'register' ? "Criar Senha (mín. 6 caracteres)" : "Senha"}
                      className="w-full bg-white/5 border border-white/20 rounded-xl py-3.5 pl-6 pr-12 text-white placeholder:text-white/40 focus:border-[#617964] transition-all outline-none"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {mode === 'register' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="relative group"
                    >
                      <input 
                        type={showPassword ? "text" : "password"} 
                        name="confirmPassword"
                        required
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Repetir Senha"
                        className="w-full bg-white/5 border border-white/20 rounded-xl py-3.5 pl-6 pr-12 text-white placeholder:text-white/40 focus:border-[#617964] transition-all outline-none"
                      />
                      <Lock className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    </motion.div>
                  )}

                  {mode === 'login' && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button 
                          type="button"
                          onClick={() => setRememberMe(!rememberMe)}
                          className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${rememberMe ? 'bg-[#617964] border-[#617964]' : 'border-white/30 bg-transparent'}`}
                        >
                          {rememberMe && <Check className="w-3 h-3 text-white stroke-[4px]" />}
                        </button>
                        <span className="text-sm text-white/70">Lembrar de mim</span>
                      </div>
                      <button type="button" className="text-xs text-white/50 hover:text-white transition-colors">Esqueceu a senha?</button>
                    </div>
                  )}

                  {/* Action Button */}
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-terracota to-marromescuro text-white py-3.5 md:py-4 rounded-xl font-bold text-lg shadow-xl hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                    {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {mode === 'login' ? 'Entrar com Email' : 'Enviar Solicitação'}
                  </button>

                </form>
              </div>

              {/* Footer Links */}
              <div className="mt-auto pt-6 md:pt-8 text-center">
                <p className="text-sm text-white/60">
                  {mode === 'login' ? 'Ainda não é parceiro?' : 'Já possui uma conta?'}
                  <button 
                    onClick={toggleMode} 
                    className="ml-2 text-white font-bold hover:underline"
                  >
                    {mode === 'login' ? 'Me associar' : 'Fazer Login'}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Custom Error/Status Modal */}
          <AnimatePresence>
            {customError.showModal && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-[#222] border border-white/10 rounded-[40px] p-8 md:p-12 w-full max-w-[500px] text-center space-y-8"
                >
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto">
                    {customError.type === 'auth_pending' ? (
                      <Loader2 className="w-10 h-10 text-white animate-spin" />
                    ) : (
                      <AlertCircle className="w-10 h-10 text-terracota" />
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-3xl font-serif font-bold italic tracking-tight">{customError.title}</h3>
                    <p className="text-white/60 text-lg leading-relaxed">
                      {customError.message}
                    </p>
                  </div>

                  <div className="flex flex-col gap-4 pt-4">
                    <a 
                      href="https://api.whatsapp.com/send?phone=5532988184518&text=Ol%C3%A1%2C%20gostaria%20de%20falar%20com%20um%20especialista%20da%20CR%20Im%C3%B3veis%20de%20Luxo!"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all active:scale-[0.98]"
                    >
                      <MessageCircle className="w-6 h-6" />
                      Falar com a CR
                    </a>
                    
                    <button 
                      onClick={closeCustomModal}
                      className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all active:scale-[0.98]"
                    >
                      <RotateCcw className="w-6 h-6" />
                      Tentar de novo
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}
