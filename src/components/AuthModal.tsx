import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, User, Lock, Eye, EyeOff, Mail, Phone, AlertCircle, MessageCircle, Loader2, CheckCircle2, ShieldCheck, KeyRound
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  
  // Form States
  const [formData, setFormData] = useState({
    name: '', phone: '', creci: '', email: '', password: '', confirmPassword: ''
  });

  // Error/Success States
  const [errorHeader, setErrorHeader] = useState<string | null>(null);
  const [customError, setCustomError] = useState<{
    title: string;
    message: string;
    showModal: boolean;
    type: 'auth_pending' | 'invalid_creds';
  }>({
    title: '', message: '', showModal: false, type: 'invalid_creds'
  });

  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        onClose();
        navigate('/admin');
      }
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, [navigate, isOpen, onClose]);

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
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data().status;
      }
      return null;
    } catch (error: any) {
      console.error("Error checking user status:", error);
      if (error.message && error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
        setErrorHeader('AdBlocker Detectado. Desative seu AdBlocker (ex: Brave Shields) para fazer o login.');
      }
      return null;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorHeader(null);

    const email = formData.email.trim();
    const password = formData.password.trim();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      const adminEmail = 'danielvaleweb@gmail.com';
      if (email.toLowerCase() === adminEmail.toLowerCase()) {
        onClose();
        navigate('/admin');
        return;
      }

      const status = await checkUserStatus(userCredential.user.uid);

      if (status === 'pending') {
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
        await signOut(auth);
        setErrorHeader('Perfil não encontrado no sistema.');
        return;
      }

      onClose();
      navigate('/admin');
    } catch (error: any) {
      console.error("Auth error:", error);
      const errorCode = error.code || error.message;
      
      if (errorCode.includes('ERR_BLOCKED_BY_CLIENT')) {
        setErrorHeader('AdBlocker Detectado. Por favor, desative o bloqueador de anúncios (ex: Brave Shields).');
      } else if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-login-credentials') {
        setErrorHeader('E-mail ou senha incorretos.');
      } else if (errorCode === 'auth/invalid-email') {
        setErrorHeader('O e-mail digitado não é válido.');
      } else if (errorCode === 'auth/too-many-requests') {
        setErrorHeader('Muitas tentativas sem sucesso. Tente novamente mais tarde.');
      } else {
        setErrorHeader(`Erro ao tentar fazer login. Tente novamente.`);
      }
      await signOut(auth);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorHeader(null);
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userEmail = user.email?.toLowerCase() || '';
      
      const adminEmail = 'danielvaleweb@gmail.com';
      const isExplicitAdmin = userEmail === adminEmail.toLowerCase() || user.uid === 'xgp4kEuc66UbGXIMcBVAa4fykus2';

      if (isExplicitAdmin) {
        onClose();
        navigate('/admin');
        return;
      }

      const status = await checkUserStatus(user.uid);

      if (!status) {
        await signOut(auth);
        setErrorHeader('Este e-mail não está cadastrado como corretor. Por favor, preencha a ficha abaixo.');
        setFormData(prev => ({
          ...prev,
          name: user.displayName || '',
          email: userEmail
        }));
        setMode('register');
        return;
      }

      if (status === 'pending') {
        setCustomError({
          title: 'Aguardando Aprovação',
          message: 'Seu cadastro está aguardando revisão. Em breve você terá acesso.',
          showModal: true,
          type: 'auth_pending'
        });
        return;
      }

      if (status === 'rejected') {
        await signOut(auth);
        setErrorHeader('Seu acesso foi recusado por um administrador.');
        return;
      }

      onClose();
      navigate('/admin');
    } catch (error: any) {
      console.error("Google Auth error:", error);
      if (error.message && error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
        setErrorHeader('AdBlocker Detectado. Desative bloqueadores para usar o Google Auth.');
      } else {
        setErrorHeader('Falha na autenticação. Verifique se popups estão permitidos.');
      }
      await signOut(auth);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = formData.email.trim();
    if (!email) {
      setErrorHeader('Digite seu e-mail para recuperar a senha.');
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      alert('E-mail de recuperação enviado!');
    } catch (error: any) {
      setErrorHeader('Não foi possível enviar o e-mail de recuperação.');
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
      await updateProfile(userCredential.user, { displayName: formData.name.trim() });

      const registrationData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        creci: formData.creci.trim(),
        email: email.toLowerCase(),
        status: 'pending',
        role: 'corretor',
        photo: 'https://i.imgur.com/2mOeELD.jpeg',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), registrationData);

      setCustomError({
        title: 'Solicitação Enviada',
        message: 'Seu cadastro foi recebido! Em breve você terá acesso ao painel.',
        showModal: true,
        type: 'auth_pending'
      });
      
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.code === 'auth/email-already-in-use') {
        setErrorHeader('Este e-mail já está em uso.');
      } else {
        setErrorHeader('Erro ao realizar cadastro. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col flex-shrink-0"
          >
            <div className="flex-shrink-0 p-8 text-center bg-gray-50/50 border-b border-gray-100 relative">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-[#617964] transition-colors bg-white rounded-full shadow-sm"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-16 h-16 bg-[#617964] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-[#617964]/20">
                {mode === 'register' ? (
                  <User className="w-8 h-8 text-white" />
                ) : (
                  <Lock className="w-8 h-8 text-white" />
                )}
              </div>
              
              <h1 className="text-xl font-black text-gray-900 mb-1 font-display">
                {mode === 'register' ? 'Seja um Parceiro' : 'Acesso ao Painel'}
              </h1>
              <p className="text-xs text-gray-500 font-medium px-4">
                {mode === 'register' 
                  ? 'Preencha os dados e solicite acesso.' 
                  : 'Acesse como corretor ou administrador.'}
              </p>
            </div>

            <div className="overflow-y-auto flex-1">
              <form 
                onSubmit={mode === 'register' ? handleRegister : handleLogin} 
                className="p-8 space-y-5"
              >
                {errorHeader && (
                  <div className="p-4 bg-red-50 rounded-2xl flex items-start gap-3 border border-red-100">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-red-600">{errorHeader}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {mode === 'register' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input 
                            type="text" name="name" required value={formData.name} onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#617964] transition-all font-bold text-gray-900 text-sm"
                            placeholder="Seu nome"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Telefone</label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                              type="tel" name="phone" required value={formData.phone} onChange={handleInputChange}
                              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#617964] transition-all font-bold text-gray-900 text-sm"
                              placeholder="(00) 00000-0000"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CRECI</label>
                          <div className="relative">
                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                              type="text" name="creci" required value={formData.creci} onChange={handleInputChange}
                              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#617964] transition-all font-bold text-gray-900 text-sm"
                              placeholder="00.000"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="email" name="email" required value={formData.email} onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#617964] transition-all font-bold text-gray-900 text-sm"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Senha</label>
                      {mode === 'login' && (
                        <button 
                          type="button" onClick={handleForgotPassword}
                          className="text-[10px] font-black text-[#617964] uppercase tracking-widest hover:underline"
                        >
                          Esqueceu?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type={showPassword ? "text" : "password"} name="password" required value={formData.password} onChange={handleInputChange}
                        className="w-full pl-12 pr-12 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#617964] transition-all font-bold text-gray-900 text-sm"
                        placeholder="••••••••"
                      />
                      <button 
                        type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#617964]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {mode === 'register' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirmar Senha</label>
                      <div className="relative">
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                          type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#617964] transition-all font-bold text-gray-900 text-sm"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    type="submit" disabled={isLoading}
                    className="w-full bg-[#617964] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#4a5d4d] transition-all shadow-lg shadow-[#617964]/20 text-sm"
                  >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {mode === 'register' ? 'Enviar Solicitação' : 'Entrar no Painel'}
                  </button>

                  {mode === 'login' && (
                    <button 
                      type="button" onClick={handleGoogleLogin} disabled={isLoading}
                      className="w-full bg-white border border-gray-200 text-gray-700 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all text-sm"
                    >
                      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
                      Continuar com Google
                    </button>
                  )}
                </div>
              </form>
            </div>

            <button 
              onClick={toggleMode}
              className="flex-shrink-0 w-full p-6 bg-gray-50 text-xs font-bold text-[#617964] hover:bg-gray-100 transition-all border-t border-gray-100"
            >
              {mode === 'register' ? 'Já tem uma conta? Fazer Login' : 'Não tem conta? Solicite Acesso'}
            </button>
            
            {/* Success Modal internally inside the AuthModal */}
            <AnimatePresence>
              {customError.showModal && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 z-[600] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white rounded-3xl p-8 w-full text-center space-y-6"
                  >
                    <div className="w-16 h-16 bg-[#617964]/10 rounded-2xl flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8 text-[#617964]" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-gray-900">{customError.title}</h3>
                      <p className="text-sm text-gray-500 font-medium leading-relaxed">
                        {customError.message}
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 pt-2">
                      <button 
                        onClick={() => setCustomError({...customError, showModal: false})}
                        className="w-full flex items-center justify-center gap-2 bg-[#617964] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#4a5d4d] transition-all"
                      >
                        Entendido!
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
