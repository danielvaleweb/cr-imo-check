import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Lock, Eye, EyeOff, Check, Mail, Phone, IdCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'register' : 'login');
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onClose();
      navigate('/dashboard-corretor');
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de login com email/senha (não implementado no Firebase por padrão)
    alert("Por favor, use o login com Google.");
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
              >
                <X className="w-6 h-6" />
              </button>

              <div className="mt-6 md:mt-8 space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight uppercase">ÁREA DO CORRETOR</h2>
                <p className="text-white/70 text-sm">
                  {mode === 'login' 
                    ? 'Olá corretor! Faça seu login.' 
                    : 'Preencha seus dados para se associar.'}
                </p>
              </div>

              <div className="mt-8 md:mt-10">
                <form className="space-y-4 md:space-y-5" onSubmit={handleLogin}>
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
                          placeholder="Nome Completo"
                          className="w-full bg-white/5 border border-white/20 rounded-xl py-3.5 pl-6 pr-12 text-white placeholder:text-white/40 focus:border-[#617964] transition-all outline-none"
                        />
                        <User className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      </div>

                      {/* Phone Input */}
                      <div className="relative group">
                        <input 
                          type="tel" 
                          placeholder="Telefone / WhatsApp"
                          className="w-full bg-white/5 border border-white/20 rounded-xl py-3.5 pl-6 pr-12 text-white placeholder:text-white/40 focus:border-[#617964] transition-all outline-none"
                        />
                        <Phone className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      </div>

                      {/* CRECI Input */}
                      <div className="relative group">
                        <input 
                          type="text" 
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
                      placeholder="E-mail"
                      className="w-full bg-white/5 border border-white/20 rounded-xl py-3.5 pl-6 pr-12 text-white placeholder:text-white/40 focus:border-[#617964] transition-all outline-none"
                    />
                    <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  </div>

                  {/* Password Input */}
                  <div className="relative group">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Senha"
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
                    className="w-full bg-gradient-to-r from-[#617964] to-[#374001] text-white py-3.5 md:py-4 rounded-xl font-bold text-lg shadow-xl hover:opacity-90 transition-all active:scale-[0.98]"
                  >
                    {mode === 'login' ? 'Entrar com Email' : 'Enviar Solicitação'}
                  </button>

                </form>

                <div className="relative flex items-center py-6">
                  <div className="flex-grow border-t border-white/20"></div>
                  <span className="flex-shrink-0 mx-4 text-white/40 text-sm">ou</span>
                  <div className="flex-grow border-t border-white/20"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 bg-white text-black py-3.5 md:py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-gray-100 transition-all active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continuar com Google
                </button>
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
        </div>
      )}
    </AnimatePresence>
  );
}
