import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  auth, 
  db 
} from '../firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  getDoc 
} from 'firebase/firestore';
import { 
  ArrowLeft, 
  AlertCircle, 
  Loader2,
  CheckCircle2,
  MessageCircle
} from 'lucide-react';

export default function GoogleLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState<{
    title: string;
    message: string;
    type: 'pending' | 'rejected' | 'not_found';
  } | null>(null);
  
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
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

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        await signOut(auth);
        setShowStatusModal({
          title: 'Perfil não encontrado',
          message: 'Este e-mail Google não está cadastrado como corretor parceiro. Por favor, solicite seu acesso através do formulário de registro no site.',
          type: 'not_found'
        });
        return;
      }

      const status = userDoc.data().status;

      if (status === 'pending') {
        setShowStatusModal({
          title: 'Aguardando Aprovação',
          message: 'Seu cadastro Google já existe e está aguardando revisão de um administrador. Em breve você terá acesso.',
          type: 'pending'
        });
        return;
      }

      if (status === 'rejected') {
        await signOut(auth);
        setShowStatusModal({
          title: 'Acesso Recusado',
          message: 'Seu acesso foi recusado por um administrador. Entre em contato com o suporte para mais informações.',
          type: 'rejected'
        });
        return;
      }

      if (status === 'approved') {
        navigate('/admin');
      } else {
        await signOut(auth);
        setError('Status de conta desconhecido. Entre em contato com o suporte.');
      }
    } catch (err: any) {
      console.error("Google Auth error:", err);
      setError('Falha na autenticação com o Google. Tente novamente.');
      await signOut(auth);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#111] border border-white/10 rounded-[40px] p-10 text-center relative shadow-2xl"
      >
        <button 
          onClick={() => navigate('/')}
          className="absolute top-8 left-8 p-2 text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="mt-8 space-y-8">
          <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mx-auto border border-white/10">
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              alt="Google" 
              className="w-12 h-12"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-serif font-bold italic text-white uppercase tracking-tight">LOGIN GOOGLE</h1>
            <p className="text-white/50 text-sm">
              Use sua conta corporativa Google para acessar o painel administrativo.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-left">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-100 font-medium">{error}</p>
            </div>
          )}

          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white text-black py-5 rounded-2xl font-black text-lg hover:bg-gray-100 transition-all active:scale-[0.98] flex items-center justify-center gap-4 group"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <img 
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                  alt="Google" 
                  className="w-6 h-6"
                />
                Entrar com Google
              </>
            )}
          </button>

          <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em]">
            EXCLUSIVO PARA CORRETORES PARCEIROS
          </p>
        </div>
      </motion.div>

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#222] border border-white/10 rounded-[40px] p-10 w-full max-w-[500px] text-center space-y-8"
          >
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto border border-white/10">
              {showStatusModal.type === 'pending' ? (
                <CheckCircle2 className="w-10 h-10 text-[#617964]" />
              ) : (
                <AlertCircle className="w-10 h-10 text-red-500" />
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-3xl font-serif font-bold italic tracking-tight text-white uppercase">{showStatusModal.title}</h3>
              <p className="text-white/60 text-lg leading-relaxed">
                {showStatusModal.message}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={() => {
                  setShowStatusModal(null);
                  navigate('/');
                }}
                className="w-full bg-white text-black py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all"
              >
                Voltar ao Início
              </button>

              <a 
                href="https://api.whatsapp.com/send?phone=5532988184518"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-3"
              >
                <MessageCircle className="w-6 h-6" />
                Suporte WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
