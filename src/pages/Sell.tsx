import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Scale, 
  Wallet, 
  Users, 
  Briefcase, 
  PenTool, 
  Key, 
  TrendingUp, 
  Megaphone,
  Home,
  Building2,
  ChevronDown
} from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { CATEGORIES } from '../constants/categories';

const BENEFITS = [
  {
    icon: Scale,
    title: "Precificação correta",
    desc: "Avaliação estratégica baseada em dados e comportamento de mercado."
  },
  {
    icon: Wallet,
    title: "Carteira de clientes UHNW",
    desc: "Acesso a compradores qualificados de altíssimo poder aquisitivo."
  },
  {
    icon: Users,
    title: "Parcerias com players selecionados",
    desc: "Rede estratégica com incorporadores, investidores e fundos."
  },
  {
    icon: Briefcase,
    title: "Marketing",
    desc: "Posicionamento e divulgação alinhados ao perfil do ativo."
  },
  {
    icon: PenTool,
    title: "Soluções jurídicas completas",
    desc: "Estruturação jurídica segura em todas as etapas da operação."
  },
  {
    icon: Key,
    title: "Negociação assertiva",
    desc: "Condução estratégica para maximizar valor e fechamento."
  },
  {
    icon: TrendingUp,
    title: "Gestão completa do imóvel",
    desc: "Acompanhamento integral do ativo do início à transação."
  },
  {
    icon: Megaphone,
    title: "Segurança e transparência",
    desc: "Processos claros, confiáveis e com total rastreabilidade."
  }
];

export default function Sell() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    propertyType: '',
    transactionType: 'vender', // 'vender' or 'alugar'
    neighborhood: '',
    number: '',
    street: '',
    price: '',
    bedrooms: '',
    suites: '',
    parking: '',
    area: '',
    ownerName: '',
    ownerMobile: '',
    ownerPhone: '',
    ownerEmail: '',
    acceptedTerms: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.acceptedTerms) {
      alert("Você precisa aceitar os termos e condições.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'property_leads'), {
        ...formData,
        createdAt: serverTimestamp()
      });
      navigate('/dashboard?tab=leads');
    } catch (error) {
      console.error("Error submitting form: ", error);
      alert("Ocorreu um erro ao enviar seu cadastro. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="pt-32 pb-20 px-6 bg-white min-h-screen flex items-center justify-center font-helvetica">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-[#617964]/10 rounded-full flex items-center justify-center mx-auto">
            <Home className="w-10 h-10 text-[#617964]" />
          </div>
          <h2 className="text-3xl font-bold text-marromescuro">Cadastro Enviado!</h2>
          <p className="text-marromescuro/60 font-medium">
            Recebemos as informações do seu imóvel. Nossa equipe entrará em contato em breve para dar continuidade ao processo.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-marromescuro text-white px-8 py-4 rounded-2xl font-bold hover:bg-marromescuro/90 transition-colors w-full shadow-xl"
          >
            Cadastrar outro imóvel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 bg-white min-h-screen font-helvetica">
      <div className="max-w-6xl mx-auto space-y-20">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-marromescuro tracking-tight">
            Anuncie seu imóvel
          </h1>
          <p className="text-lg text-marromescuro/60 max-w-2xl mx-auto font-medium">
            Conte com nossa expertise para vender ou alugar seu imóvel com segurança, agilidade e a melhor rentabilidade.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-8 rounded-[32px] border border-marromescuro/5 shadow-sm space-y-6 hover:shadow-xl hover:shadow-marromescuro/5 transition-all"
            >
              <div className="bg-marromescuro/5 w-14 h-14 rounded-2xl flex items-center justify-center">
                <item.icon className="w-6 h-6 text-marromescuro" />
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-marromescuro leading-snug">{item.title}</h3>
                <p className="text-sm text-marromescuro/60 font-medium leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-16">
          
          {/* Dados do imóvel */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-marromescuro border-b border-marromescuro/10 pb-4">Dados do imóvel</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-marromescuro/50 uppercase tracking-widest">Tipo de imóvel</label>
                <div className="relative">
                  <select 
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    required
                    className="w-full bg-marromescuro/5 border-none rounded-2xl p-4 appearance-none focus:ring-2 focus:ring-[#617964] outline-none text-marromescuro font-medium"
                  >
                    <option value="" disabled>Selecione o tipo de imóvel</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.label1} {cat.label2}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-marromescuro/40 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-marromescuro/50 uppercase tracking-widest">Comprar ou alugar</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, transactionType: 'vender' }))}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                      formData.transactionType === 'vender' 
                        ? 'border-[#617964] bg-[#617964]/5' 
                        : 'border-transparent bg-marromescuro/5 hover:bg-marromescuro/10'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${formData.transactionType === 'vender' ? 'bg-[#617964]/10' : 'bg-white'}`}>
                      <Home className={`w-5 h-5 ${formData.transactionType === 'vender' ? 'text-[#617964]' : 'text-marromescuro/40'}`} />
                    </div>
                    <span className={`font-bold ${formData.transactionType === 'vender' ? 'text-marromescuro' : 'text-marromescuro/60'}`}>Vender</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, transactionType: 'alugar' }))}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                      formData.transactionType === 'alugar' 
                        ? 'border-[#617964] bg-[#617964]/5' 
                        : 'border-transparent bg-marromescuro/5 hover:bg-marromescuro/10'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${formData.transactionType === 'alugar' ? 'bg-[#617964]/10' : 'bg-white'}`}>
                      <Building2 className={`w-5 h-5 ${formData.transactionType === 'alugar' ? 'text-[#617964]' : 'text-marromescuro/40'}`} />
                    </div>
                    <span className={`font-bold ${formData.transactionType === 'alugar' ? 'text-marromescuro' : 'text-marromescuro/60'}`}>Alugar</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-marromescuro/50 uppercase tracking-widest">Bairro</label>
                <input 
                  type="text"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleChange}
                  placeholder="Ex: Jardins"
                  required
                  className="w-full bg-marromescuro/5 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#617964] outline-none text-marromescuro font-medium placeholder:text-marromescuro/30"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-marromescuro/50 uppercase tracking-widest">Número</label>
                <input 
                  type="text"
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                  placeholder="123"
                  required
                  className="w-full bg-marromescuro/5 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#617964] outline-none text-marromescuro font-medium placeholder:text-marromescuro/30"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-marromescuro/50 uppercase tracking-widest">Rua</label>
                <input 
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="Av. Paulista"
                  required
                  className="w-full bg-marromescuro/5 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#617964] outline-none text-marromescuro font-medium placeholder:text-marromescuro/30"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-marromescuro/50 uppercase tracking-widest">Valor pretendido</label>
                <input 
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Ex: 2.000.000"
                  required
                  className="w-full bg-marromescuro/5 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#617964] outline-none text-marromescuro font-medium placeholder:text-marromescuro/30"
                />
                <p className="text-[11px] font-medium text-marromescuro/40 mt-2">Trabalhamos com o piso de R$ 2M para comprar e R$ 5 mil para alugar.</p>
              </div>
            </div>
          </div>

          {/* Características do imóvel */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-marromescuro border-b border-marromescuro/10 pb-4">Características do imóvel</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-marromescuro/50 uppercase tracking-widest">Dormitórios</label>
                <div className="relative">
                  <select 
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    required
                    className="w-full bg-marromescuro/5 border-none rounded-2xl p-4 appearance-none focus:ring-2 focus:ring-[#617964] outline-none text-marromescuro font-medium"
                  >
                    <option value="" disabled>Selecione a quantidade de dormitórios</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5+">5+</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-marromescuro/40 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-marromescuro/50 uppercase tracking-widest">Suítes</label>
                <div className="relative">
                  <select 
                    name="suites"
                    value={formData.suites}
                    onChange={handleChange}
                    required
                    className="w-full bg-marromescuro/5 border-none rounded-2xl p-4 appearance-none focus:ring-2 focus:ring-[#617964] outline-none text-marromescuro font-medium"
                  >
                    <option value="" disabled>Selecione a quantidade de suítes</option>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5+">5+</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-marromescuro/40 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-marromescuro/50 uppercase tracking-widest">Vagas</label>
                <div className="relative">
                  <select 
                    name="parking"
                    value={formData.parking}
                    onChange={handleChange}
                    required
                    className="w-full bg-marromescuro/5 border-none rounded-2xl p-4 appearance-none focus:ring-2 focus:ring-[#617964] outline-none text-marromescuro font-medium"
                  >
                    <option value="" disabled>Selecione a quantidade de vagas</option>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5+">5+</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-marromescuro/40 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-marromescuro/50 uppercase tracking-widest">Área útil (m²)</label>
                <input 
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="Ex: 180"
                  required
                  className="w-full bg-marromescuro/5 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#617964] outline-none text-marromescuro font-medium placeholder:text-marromescuro/30"
                />
              </div>
            </div>
          </div>

          {/* Dados do proprietário */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-marromescuro border-b border-marromescuro/10 pb-4">Dados do proprietário</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-marromescuro/50 uppercase tracking-widest">Nome e sobrenome</label>
                <input 
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  placeholder="Seu nome completo"
                  required
                  className="w-full bg-marromescuro/5 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#617964] outline-none text-marromescuro font-medium placeholder:text-marromescuro/30"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-marromescuro/50 uppercase tracking-widest">Celular</label>
                <input 
                  type="tel"
                  name="ownerMobile"
                  value={formData.ownerMobile}
                  onChange={handleChange}
                  placeholder="(11) 99999-9999"
                  required
                  className="w-full bg-marromescuro/5 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#617964] outline-none text-marromescuro font-medium placeholder:text-marromescuro/30"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-marromescuro/50 uppercase tracking-widest">Telefone comercial</label>
                <input 
                  type="tel"
                  name="ownerPhone"
                  value={formData.ownerPhone}
                  onChange={handleChange}
                  placeholder="(11) 0000-0000"
                  className="w-full bg-marromescuro/5 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#617964] outline-none text-marromescuro font-medium placeholder:text-marromescuro/30"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-marromescuro/50 uppercase tracking-widest">E-mail</label>
                <input 
                  type="email"
                  name="ownerEmail"
                  value={formData.ownerEmail}
                  onChange={handleChange}
                  placeholder="email@exemplo.com"
                  required
                  className="w-full bg-marromescuro/5 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#617964] outline-none text-marromescuro font-medium placeholder:text-marromescuro/30"
                />
              </div>
            </div>

            <div className="pt-4">
              <label className="flex items-center gap-4 p-6 bg-marromescuro/5 rounded-2xl cursor-pointer hover:bg-marromescuro/10 transition-colors">
                <input 
                  type="checkbox"
                  name="acceptedTerms"
                  checked={formData.acceptedTerms}
                  onChange={handleChange}
                  className="w-6 h-6 rounded-md border-marromescuro/20 text-[#617964] focus:ring-[#617964] bg-white"
                />
                <span className="text-sm font-bold text-marromescuro">Aceito todos os termos e condições para cadastrar meu imóvel</span>
              </label>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-marromescuro text-white px-10 py-5 rounded-2xl font-bold hover:bg-marromescuro/90 transition-all shadow-xl disabled:opacity-50 text-lg"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar cadastro'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
