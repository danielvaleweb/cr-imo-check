import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Check, 
  ChevronRight, 
  FileText, 
  HelpCircle, 
  Info, 
  MessageCircle, 
  X,
  DollarSign,
  CreditCard,
  User,
  Phone,
  Mail,
  Building2,
  Calendar,
  Clock,
  AlertCircle,
  ShieldCheck,
  Send
} from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { useBrokers } from '../context/BrokerContext';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { formatPhone } from '../lib/utils';

const FAQ_ITEMS = [
  {
    question: "Posso financiar a compra?",
    answer: "Sim! Aceitamos financiamento por qualquer banco. Se já tiver crédito aprovado, informe no registro — isso agiliza o processo."
  },
  {
    question: "Posso usar o FGTS?",
    answer: "Sim, desde que atenda aos requisitos legais: ter mais de 3 anos de carteira assinada e não possuir imóvel financiado pelo SFH na mesma cidade. No registro você informa esses dados"
  },
  {
    question: "É possível fazer permuta?",
    answer: "Sim! Avaliamos permutas com imóveis devidamente registrados. Permutas parciais (imóvel + financiamento ou recursos próprios) também são aceitas"
  },
  {
    question: "Enviar a proposta me obriga a comprar?",
    answer: "Não. A proposta é uma intenção de compra para iniciar a negociação. O compromisso legal só ocorre após a aceitação de ambas as partes e assinatura do contrato"
  },
  {
    question: "Quanto tempo demora para ter uma resposta?",
    answer: "Geralmente entre 24h e 48h úteis. O proprietário avalia as condições e pode aceitar, recusar ou enviar uma contraproposta"
  },
  {
    question: "Quais documentos vou precisar?",
    answer: "Inicialmente, apenas seus dados básicos. Se a proposta for aceita, solicitaremos RG, CPF, comprovante de residência, estado civil e comprovante de renda"
  }
];

export default function PurchaseProposal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties } = useProperties();
  const { brokers } = useBrokers();
  
  const property = properties.find(p => p.id.toString() === id);
  const broker = brokers.find(b => b.name === property?.broker);

  const [step, setStep] = useState(1);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    value: '',
    paymentMethod: 'vista',
    fgts: false,
    financing: false,
    permuta: false,
    userName: '',
    userEmail: '',
    userPhone: '',
    observations: ''
  });

  useEffect(() => {
    if (!property) {
      navigate('/');
    }
  }, [property, navigate]);

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'proposals'), {
        propertyId: id,
        propertyName: property?.title,
        propertyCode: property?.code,
        brokerId: broker?.id || 'unknown',
        brokerName: broker?.name || 'unknown',
        userId: auth.currentUser?.uid || 'anonymous',
        ...formData,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      setIsSuccess(true);
      // Play success sound
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Audio play failed:', err));
    } catch (error) {
      console.error('Error submitting proposal:', error);
      alert('Erro ao enviar proposta. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!property) return null;

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-marromescuro/60 hover:text-marromescuro transition-colors font-bold text-sm uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold text-marromescuro/40 uppercase tracking-widest">Imóvel</p>
              <p className="text-sm font-bold text-marromescuro">{property.title}</p>
            </div>
            <img 
              src={property.image} 
              alt={property.title} 
              className="w-12 h-12 rounded-xl object-cover border border-marromescuro/10"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between mb-4">
            {[1, 2, 3, 4].map((s) => (
              <div 
                key={s}
                className={`flex flex-col items-center gap-2 transition-all duration-500 ${step >= s ? 'opacity-100' : 'opacity-30'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step === s ? 'bg-terracota text-white shadow-lg shadow-terracota/20' : step > s ? 'bg-marromescuro text-white' : 'bg-marromescuro/10 text-marromescuro'}`}>
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-marromescuro">
                  {s === 1 ? 'Valor' : s === 2 ? 'Pagamento' : s === 3 ? 'Dados' : 'Revisão'}
                </span>
              </div>
            ))}
          </div>
          <div className="h-1 bg-white border border-marromescuro/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-terracota"
              initial={{ width: '0%' }}
              animate={{ width: `${((step - 1) / 3) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-[40px] shadow-2xl shadow-marromescuro/5 border border-marromescuro/5 overflow-hidden">
          {isSuccess ? (
            <div className="p-12 text-center space-y-8">
              <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                  <Check className="w-10 h-10 text-white stroke-[3]" />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-serif font-bold text-marromescuro italic">Proposta Enviada com Sucesso!</h2>
                <p className="text-marromescuro/60 leading-relaxed max-w-md mx-auto">
                  Sua proposta para o imóvel <span className="font-bold text-marromescuro">{property.title}</span> foi registrada. O corretor <span className="font-bold text-marromescuro">{broker?.name}</span> entrará em contato em breve.
                </p>
              </div>
              <button 
                onClick={() => navigate('/')}
                className="px-12 py-4 bg-marromescuro text-white rounded-2xl font-bold hover:bg-marromescuro/90 transition-all shadow-xl"
              >
                Voltar ao Início
              </button>
            </div>
          ) : (
            <div className="p-8 md:p-12">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="space-y-2">
                      <h2 className="text-2xl font-serif font-bold text-marromescuro italic">Qual o valor da sua proposta?</h2>
                      <p className="text-marromescuro/40 text-sm">O valor anunciado é {property.price}</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-marromescuro/30">R$</span>
                        <input 
                          type="text"
                          placeholder="0,00"
                          value={formData.value}
                          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                          className="w-full pl-16 pr-8 py-6 bg-white border border-marromescuro/10 rounded-3xl text-3xl font-bold text-marromescuro focus:ring-2 focus:ring-terracota/20 transition-all"
                        />
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800 leading-relaxed">
                          Propostas com valores muito abaixo do anunciado podem ter menor chance de aceitação imediata, mas serão todas apresentadas ao proprietário.
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button 
                        onClick={handleNext}
                        disabled={!formData.value}
                        className="px-12 py-4 bg-marromescuro text-white rounded-2xl font-bold hover:bg-marromescuro/90 transition-all shadow-xl disabled:opacity-50 flex items-center gap-2"
                      >
                        Continuar
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="space-y-2">
                      <h2 className="text-2xl font-serif font-bold text-marromescuro italic">Como pretende pagar?</h2>
                      <p className="text-marromescuro/40 text-sm">Selecione as opções que se aplicam à sua negociação</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button 
                        onClick={() => setFormData({ ...formData, paymentMethod: 'vista' })}
                        className={`p-6 rounded-3xl border-2 transition-all text-left space-y-2 ${formData.paymentMethod === 'vista' ? 'border-terracota bg-terracota/5' : 'border-marromescuro/5 hover:border-marromescuro/10'}`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.paymentMethod === 'vista' ? 'bg-terracota text-white' : 'bg-marromescuro/5 text-marromescuro/40'}`}>
                          <DollarSign className="w-6 h-6" />
                        </div>
                        <p className="font-bold text-marromescuro">À Vista</p>
                        <p className="text-[10px] text-marromescuro/40 uppercase tracking-widest font-bold">Recursos Próprios</p>
                      </button>

                      <button 
                        onClick={() => setFormData({ ...formData, paymentMethod: 'financiamento' })}
                        className={`p-6 rounded-3xl border-2 transition-all text-left space-y-2 ${formData.paymentMethod === 'financiamento' ? 'border-terracota bg-terracota/5' : 'border-marromescuro/5 hover:border-marromescuro/10'}`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.paymentMethod === 'financiamento' ? 'bg-terracota text-white' : 'bg-marromescuro/5 text-marromescuro/40'}`}>
                          <CreditCard className="w-6 h-6" />
                        </div>
                        <p className="font-bold text-marromescuro">Financiamento</p>
                        <p className="text-[10px] text-marromescuro/40 uppercase tracking-widest font-bold">Bancário / Consórcio</p>
                      </button>
                    </div>

                    <div className="space-y-4">
                      <p className="text-xs font-bold text-marromescuro/40 uppercase tracking-widest ml-1">Opções Adicionais</p>
                      <div className="space-y-3">
                        <label className="flex items-center gap-4 p-4 bg-white border border-marromescuro/10 rounded-2xl cursor-pointer hover:bg-marromescuro/5 transition-colors">
                          <input 
                            type="checkbox" 
                            checked={formData.fgts}
                            onChange={(e) => setFormData({ ...formData, fgts: e.target.checked })}
                            className="w-5 h-5 rounded border-marromescuro/20 text-terracota focus:ring-terracota"
                          />
                          <div>
                            <p className="text-sm font-bold text-marromescuro">Usar FGTS</p>
                            <p className="text-[10px] text-marromescuro/40 uppercase tracking-widest font-bold">Como parte do pagamento</p>
                          </div>
                        </label>

                        <label className="flex items-center gap-4 p-4 bg-white border border-marromescuro/10 rounded-2xl cursor-pointer hover:bg-marromescuro/5 transition-colors">
                          <input 
                            type="checkbox" 
                            checked={formData.permuta}
                            onChange={(e) => setFormData({ ...formData, permuta: e.target.checked })}
                            className="w-5 h-5 rounded border-marromescuro/20 text-terracota focus:ring-terracota"
                          />
                          <div>
                            <p className="text-sm font-bold text-marromescuro">Oferecer Permuta</p>
                            <p className="text-[10px] text-marromescuro/40 uppercase tracking-widest font-bold">Imóvel ou Veículo</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <button 
                        onClick={handleBack}
                        className="px-8 py-4 text-marromescuro font-bold hover:bg-marromescuro/5 rounded-2xl transition-all"
                      >
                        Voltar
                      </button>
                      <button 
                        onClick={handleNext}
                        className="px-12 py-4 bg-marromescuro text-white rounded-2xl font-bold hover:bg-marromescuro/90 transition-all shadow-xl flex items-center gap-2"
                      >
                        Continuar
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div 
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="space-y-2">
                      <h2 className="text-2xl font-serif font-bold text-marromescuro italic">Quase lá! Seus dados de contato</h2>
                      <p className="text-marromescuro/40 text-sm">Para que o corretor possa retornar sobre sua proposta</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-marromescuro/40 uppercase tracking-widest ml-1">Nome Completo</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-marromescuro/30" />
                          <input 
                            type="text"
                            placeholder="Seu nome completo"
                            value={formData.userName}
                            onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                            className="w-full pl-12 pr-6 py-4 bg-white border border-marromescuro/10 rounded-2xl text-marromescuro font-medium focus:ring-2 focus:ring-terracota/20 transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-marromescuro/40 uppercase tracking-widest ml-1">E-mail</label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-marromescuro/30" />
                            <input 
                              type="email"
                              placeholder="seu@email.com"
                              value={formData.userEmail}
                              onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                              className="w-full pl-12 pr-6 py-4 bg-white border border-marromescuro/10 rounded-2xl text-marromescuro font-medium focus:ring-2 focus:ring-terracota/20 transition-all"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-marromescuro/40 uppercase tracking-widest ml-1">Telefone</label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-marromescuro/30" />
                            <input 
                              type="tel"
                              placeholder="(00) 00000-0000"
                              value={formData.userPhone}
                              onChange={(e) => setFormData({ ...formData, userPhone: formatPhone(e.target.value) })}
                              className="w-full pl-12 pr-6 py-4 bg-white border border-marromescuro/10 rounded-2xl text-marromescuro font-medium focus:ring-2 focus:ring-terracota/20 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-marromescuro/40 uppercase tracking-widest ml-1">Observações (Opcional)</label>
                        <textarea 
                          placeholder="Ex: Tenho pressa na mudança, gostaria de incluir os móveis planejados..."
                          value={formData.observations}
                          onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                          rows={4}
                          className="w-full p-6 bg-white border border-marromescuro/10 rounded-3xl text-marromescuro font-medium focus:ring-2 focus:ring-terracota/20 transition-all resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <button 
                        onClick={handleBack}
                        className="px-8 py-4 text-marromescuro font-bold hover:bg-marromescuro/5 rounded-2xl transition-all"
                      >
                        Voltar
                      </button>
                      <button 
                        onClick={handleNext}
                        disabled={!formData.userName || !formData.userEmail || !formData.userPhone}
                        className="px-12 py-4 bg-marromescuro text-white rounded-2xl font-bold hover:bg-marromescuro/90 transition-all shadow-xl disabled:opacity-50 flex items-center gap-2"
                      >
                        Continuar
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div 
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="space-y-2">
                      <h2 className="text-2xl font-serif font-bold text-marromescuro italic">Revise sua proposta</h2>
                      <p className="text-marromescuro/40 text-sm">Confira os dados antes de enviar para o proprietário</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 bg-marromescuro/5 rounded-3xl space-y-4">
                        <div className="flex items-center gap-3">
                          <DollarSign className="w-5 h-5 text-terracota" />
                          <div>
                            <p className="text-[10px] font-bold text-marromescuro/40 uppercase tracking-widest">Valor da Proposta</p>
                            <p className="text-xl font-bold text-marromescuro">R$ {formData.value}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-terracota" />
                          <div>
                            <p className="text-[10px] font-bold text-marromescuro/40 uppercase tracking-widest">Forma de Pagamento</p>
                            <p className="text-sm font-bold text-marromescuro">
                              {formData.paymentMethod === 'vista' ? 'À Vista' : 'Financiamento'}
                              {formData.fgts && ' + FGTS'}
                              {formData.permuta && ' + Permuta'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-marromescuro/5 rounded-3xl space-y-4">
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-terracota" />
                          <div>
                            <p className="text-[10px] font-bold text-marromescuro/40 uppercase tracking-widest">Proponente</p>
                            <p className="text-sm font-bold text-marromescuro">{formData.userName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-terracota" />
                          <div>
                            <p className="text-[10px] font-bold text-marromescuro/40 uppercase tracking-widest">Contato</p>
                            <p className="text-sm font-bold text-marromescuro">{formData.userPhone}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 border-2 border-dashed border-marromescuro/10 rounded-3xl space-y-4">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-6 h-6 text-[#617964]" />
                        <h3 className="font-bold text-marromescuro">Segurança e Privacidade</h3>
                      </div>
                      <p className="text-xs text-marromescuro/60 leading-relaxed">
                        Seus dados estão protegidos e serão utilizados exclusivamente para a negociação deste imóvel. Ao enviar, você autoriza o corretor associado a entrar em contato para dar andamento à proposta.
                      </p>
                    </div>

                    <div className="flex justify-between">
                      <button 
                        onClick={handleBack}
                        className="px-8 py-4 text-marromescuro font-bold hover:bg-marromescuro/5 rounded-2xl transition-all"
                      >
                        Voltar
                      </button>
                      <button 
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-12 py-4 bg-terracota text-white rounded-2xl font-bold hover:bg-terracota/90 transition-all shadow-xl shadow-terracota/20 flex items-center gap-3"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            Enviar Proposta
                            <Send className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-8 p-8 bg-white rounded-[32px] border border-marromescuro/5">
          <div className="flex items-center gap-6">
            <img 
              src={broker?.photo} 
              alt={broker?.name} 
              className="w-16 h-16 rounded-full object-cover border-4 border-marromescuro/5"
              referrerPolicy="no-referrer"
            />
            <div>
              <p className="text-[10px] font-bold text-marromescuro/40 uppercase tracking-widest">Corretor Responsável</p>
              <h4 className="font-bold text-marromescuro">{broker?.name}</h4>
              <p className="text-xs text-marromescuro/60">{broker?.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-marromescuro/5 rounded-2xl">
              <ShieldCheck className="w-6 h-6 text-terracota" />
            </div>
            <p className="text-xs text-marromescuro/60 font-medium max-w-[200px]">
              Negociação segura com acompanhamento jurídico completo.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Floating Bubble */}
      <div className="fixed bottom-8 right-8 z-50">
        <AnimatePresence>
          {isFaqOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
              className="absolute bottom-20 right-0 w-[350px] max-w-[90vw] bg-white rounded-[32px] shadow-2xl border border-marromescuro/5 overflow-hidden flex flex-col max-h-[500px]"
            >
              <div className="p-6 bg-marromescuro text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">Dúvidas Frequentes</h3>
                    <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold">Ajuda na Proposta</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsFaqOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {FAQ_ITEMS.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <h4 className="text-sm font-bold text-marromescuro flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-terracota mt-1.5 shrink-0" />
                      {item.question}
                    </h4>
                    <p className="text-xs text-marromescuro/60 leading-relaxed ml-3.5">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-marromescuro/5 border-t border-marromescuro/5">
                <button 
                  onClick={() => window.open(`https://wa.me/${broker?.phone.replace(/\D/g, '')}`, '_blank')}
                  className="w-full py-3 bg-[#25D366] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#20ba5a] transition-all shadow-lg shadow-green-500/20"
                >
                  <MessageCircle className="w-5 h-5" />
                  Falar com Corretor
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setIsFaqOpen(!isFaqOpen)}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 group ${isFaqOpen ? 'bg-marromescuro text-white rotate-90' : 'bg-terracota text-white'}`}
        >
          {isFaqOpen ? <X className="w-8 h-8" /> : <HelpCircle className="w-8 h-8 group-hover:rotate-12 transition-transform" />}
          
          {/* Notification Badge */}
          {!isFaqOpen && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-marromescuro border-2 border-white rounded-full flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">?</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
