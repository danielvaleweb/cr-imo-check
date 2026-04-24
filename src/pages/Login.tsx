import React, { useState, useEffect } from 'react';
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
  Loader2,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  KeyRound
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

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  
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

  // Redirect if already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/admin');
      }
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, [navigate]);

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
    } catch (error) {
      console.error("Error checking user status:", error);
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
      
      // Administrador entra direto
      const adminEmail = 'danielvaleweb@gmail.com';
      if (email.toLowerCase() === adminEmail.toLowerCase()) {
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

      navigate('/admin');
    } catch (error: any) {
      console.error("Auth error:", error);
      const errorCode = error.code || error.message;
      
      if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-login-credentials') {
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
      
      // Administrador entra direto
      const adminEmail = 'danielvaleweb@gmail.com';
      const isExplicitAdmin = userEmail === adminEmail.toLowerCase() || user.uid === 'xgp4kEuc66UbGXIMcBVAa4fykus2';

      if (isExplicitAdmin) {
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

      navigate('/admin');
    } catch (error: any) {
      console.error("Google Auth error:", error);
      setErrorHeader('Falha na autenticação com o Google.');
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
      
      await updateProfile(userCredential.user, {
        displayName: formData.name.trim()
      });

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

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#617964] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100"
      >
        {/* Header Section */}
        <div className="p-10 pt-12 text-center bg-gray-50/50 border-b border-gray-100 relative">
          <button 
            onClick={() => navigate('/')}
            className="absolute top-8 left-8 p-2 text-gray-400 hover:text-[#617964] transition-colors"
            title="Voltar ao site"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="w-20 h-20 bg-[#617964] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#617964]/20">
            {mode === 'register' ? (
              <User className="w-10 h-10 text-white" />
            ) : (
              <Lock className="w-10 h-10 text-white" />
            )}
          </div>
          
          <h1 className="text-2xl font-black text-gray-900 mb-2 font-display">
            {mode === 'register' ? 'Seja um Parceiro' : 'Painel do Corretor'}
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            {mode === 'register' 
              ? 'Preencha os dados para solicitar seu acesso.' 
              : 'Acesse sua conta para gerenciar seus imóveis.'}
          </p>
        </div>

        {/* Form Section */}
        <form 
          onSubmit={mode === 'register' ? handleRegister : handleLogin} 
          className="p-10 space-y-6"
        >
          {errorHeader && (
            <div className="p-4 bg-red-50 rounded-2xl flex items-center gap-3 border border-red-100">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-xs font-bold text-red-600">{errorHeader}</p>
            </div>
          )}

          <div className="space-y-4">
            {mode === 'register' && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#617964] transition-all font-bold text-gray-900"
                      placeholder="Seu nome"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Telefone</label>
                    <div className="relative">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#617964] transition-all font-bold text-gray-900"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CRECI</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text"
                        name="creci"
                        required
                        value={formData.creci}
                        onChange={handleInputChange}
                        className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#617964] transition-all font-bold text-gray-900"
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
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#617964] transition-all font-bold text-gray-900"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Senha</label>
                {mode === 'login' && (
                  <button 
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[10px] font-black text-[#617964] uppercase tracking-widest hover:underline"
                  >
                    Esqueceu?
                  </button>
                )}
              </div>
              <div className="relative">
                <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-14 pr-12 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#617964] transition-all font-bold text-gray-900"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#617964]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirmar Senha</label>
                <div className="relative">
                  <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#617964] transition-all font-bold text-gray-900"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#617964] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#4a5d4d] transition-all shadow-lg shadow-[#617964]/20"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'register' ? 'Enviar Solicitação' : 'Entrar no Painel'}
            </button>

            {mode === 'login' && (
              <button 
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full bg-white border border-gray-200 text-gray-700 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                Continuar com Google
              </button>
            )}
          </div>
        </form>

        <button 
          onClick={toggleMode}
          className="w-full p-10 py-6 bg-gray-50 text-sm font-bold text-[#617964] hover:bg-gray-100 transition-all border-t border-gray-100"
        >
          {mode === 'register' ? 'Já tem uma conta? Fazer Login' : 'Não tem conta? Se associar agora'}
        </button>
      </motion.div>

      {/* Success Modal */}
      <AnimatePresence>
        {customError.showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] p-8 md:p-12 w-full max-w-[500px] text-center space-y-8"
            >
              <div className="w-20 h-20 bg-[#617964]/10 rounded-3xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-[#617964]" />
              </div>

              <div className="space-y-4">
                <h3 className="text-3xl font-black text-gray-900">{customError.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  {customError.message}
                </p>
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <button 
                  onClick={() => setCustomError({...customError, showModal: false})}
                  className="w-full flex items-center justify-center gap-3 bg-[#617964] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#4a5d4d] transition-all"
                >
                  Entendido!
                </button>
                
                <a 
                  href="https://wa.me/5532988184518"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#128C7E] transition-all"
                >
                  <MessageCircle className="w-6 h-6" />
                  Suporte via WhatsApp
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
