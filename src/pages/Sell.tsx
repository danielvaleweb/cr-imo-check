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
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { addLog } from '../services/logService';
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
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);
  const termsRef = React.useRef<HTMLDivElement>(null);
  const checkboxContainerRef = React.useRef<HTMLLabelElement>(null);
  
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

  const formatCurrency = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (!cleanValue) return '';
    const numberValue = parseInt(cleanValue, 10) / 100;
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numberValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let val: string | boolean = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    if (name === 'price') {
      val = formatCurrency(value);
    }

    if (name === 'acceptedTerms' && val === true) {
      setShowTermsError(false);
    }
    
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleTermsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isBottom = Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) < 10;
    if (isBottom) {
      setHasReadTerms(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.acceptedTerms) {
      setShowTermsError(true);
      checkboxContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      alert("ATENÇÃO: Você precisa ler e aceitar os termos e condições para cadastrar seu imóvel.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const leadsRef = collection(db, 'property_leads');
      await addDoc(leadsRef, {
        ...formData,
        createdAt: serverTimestamp(),
        source: 'site'
      });

      setIsSuccess(true);
      await addLog('lead', 'Cadastrou imóvel (Captação)', `Proprietário: ${formData.ownerName}, Imóvel: ${formData.propertyType}`);
    } catch (error) {
      console.error("Error submitting form: ", error);
      alert("Ocorreu um erro ao enviar seu cadastro. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-20 px-6 bg-white min-h-screen font-helvetica relative">
      
      {/* Success Modal Overlay */}
      {isSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[32px] p-8 md:p-12 max-w-md w-full text-center space-y-6 shadow-2xl"
          >
            <div className="w-20 h-20 bg-[#617964]/10 rounded-full flex items-center justify-center mx-auto">
              <Home className="w-10 h-10 text-[#617964]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold text-marromescuro">Seu imóvel foi enviado!</h2>
              <p className="text-marromescuro/60 font-medium">
                Recebemos as informações com sucesso. Nossa equipe entrará em contato em breve para dar continuidade ao processo.
              </p>
            </div>
            <button 
              onClick={() => navigate('/')}
              className="bg-marromescuro text-white px-8 py-4 rounded-2xl font-bold hover:bg-marromescuro/90 transition-colors w-full shadow-xl"
            >
              Voltar para a página inicial
            </button>
          </motion.div>
        </div>
      )}

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

            <div className="pt-4 space-y-4">
              <label className="text-[10px] font-bold text-marromescuro/50 uppercase tracking-widest ml-1">Termos e Condições para Envio de Imóvel</label>
              <div 
                ref={termsRef}
                onScroll={handleTermsScroll}
                className="w-full bg-marromescuro/5 rounded-2xl p-6 h-64 overflow-y-auto space-y-6 text-sm text-marromescuro/70 border-2 border-transparent focus:border-[#617964]/20 outline-none transition-all scrollbar-thin scrollbar-thumb-marromescuro/10 scrollbar-track-transparent"
              >
                <div className="space-y-4">
                  <h3 className="font-bold text-marromescuro text-base italic uppercase tracking-wider">TERMO DE CONDIÇÕES PARA ENVIO DE IMÓVEL (CAPTAÇÃO)</h3>
                  
                  <p className="font-medium">Ao preencher e enviar este formulário, o(a) PROPRIETÁRIO(A) declara estar ciente e de acordo com as seguintes condições:</p>

                  <div className="space-y-2">
                    <p className="font-bold text-marromescuro">1. VERACIDADE DAS INFORMAÇÕES</p>
                    <p>O(a) PROPRIETÁRIO(A) declara que todas as informações fornecidas sobre o imóvel, incluindo valores, características, metragem, documentação e demais dados, são verdadeiras, completas e atualizadas, assumindo total responsabilidade civil e legal por sua veracidade.</p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-bold text-marromescuro">2. AUTORIZAÇÃO DE USO DAS INFORMAÇÕES</p>
                    <p>O(a) PROPRIETÁRIO(A) autoriza a imobiliária a utilizar as informações fornecidas para:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Cadastro interno do imóvel</li>
                      <li>Avaliação comercial</li>
                      <li>Apresentação para potenciais clientes</li>
                      <li>Divulgação em canais internos</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <p className="font-bold text-marromescuro">3. DIREITO DE IMAGEM E DIVULGAÇÃO</p>
                    <p>O(a) PROPRIETÁRIO(A) autoriza, desde já, a divulgação do imóvel em:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Internet e portais imobiliários</li>
                      <li>Redes sociais</li>
                      <li>Site da imobiliária</li>
                      <li>Materiais publicitários digitais e impressos</li>
                    </ul>
                    <p>Podendo a imobiliária editar, adaptar ou otimizar as imagens e descrições para fins comerciais.</p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-bold text-marromescuro">4. NATUREZA DA AUTORIZAÇÃO</p>
                    <p>O envio deste formulário não caracteriza, por si só, exclusividade de intermediação, podendo o proprietário negociar diretamente ou com terceiros.</p>
                    <p>A intermediação pela imobiliária ocorrerá mediante aceite e continuidade do processo comercial.</p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-bold text-marromescuro">5. PROTEÇÃO DE COMISSÃO</p>
                    <p>Caso a imobiliária venha a apresentar cliente interessado e a negociação seja concretizada, ainda que diretamente entre as partes, será devida a comissão conforme prática de mercado, desde que comprovado o vínculo da intermediação.</p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-bold text-marromescuro">6. LIMITAÇÃO DE RESPONSABILIDADE</p>
                    <p>A imobiliária:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Não se responsabiliza por inconsistências nas informações fornecidas</li>
                      <li>Não garante a efetivação da venda ou locação</li>
                      <li>Não assume responsabilidade por questões jurídicas, documentais ou fiscais do imóvel</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <p className="font-bold text-marromescuro">7. ANÁLISE E APROVAÇÃO</p>
                    <p>O imóvel passará por análise interna, podendo:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Ser aprovado para divulgação</li>
                      <li>Ter ajustes sugeridos (valor, fotos, descrição)</li>
                      <li>Não ser aceito, sem obrigatoriedade de justificativa</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <p className="font-bold text-marromescuro">8. PROTEÇÃO DE DADOS</p>
                    <p>Os dados fornecidos serão utilizados exclusivamente para fins comerciais relacionados à intermediação imobiliária, respeitando a legislação vigente de proteção de dados.</p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-bold text-marromescuro">9. ACEITE DIGITAL</p>
                    <p>O envio deste formulário caracteriza aceite integral e irretratável dos termos acima, com validade jurídica.</p>
                  </div>

                  <div className="pt-4 text-center">
                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                      hasReadTerms ? "bg-[#617964] text-white" : "bg-marromescuro/10 text-marromescuro/40"
                    }`}>
                      {hasReadTerms ? "✓ Leitura Concluída" : "↓ Role para ler tudo"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative group">
                {!hasReadTerms && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-marromescuro text-white text-[10px] font-bold rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 whitespace-nowrap shadow-2xl z-20 translate-y-2 group-hover:translate-y-0">
                    Para liberar leia os termos e condições!
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-marromescuro"></div>
                  </div>
                )}
                
                <label 
                  ref={checkboxContainerRef}
                  className={`flex items-center gap-4 p-6 rounded-2xl border-2 transition-all ${
                    !hasReadTerms 
                      ? 'bg-gray-50 border-gray-100 cursor-not-allowed opacity-60' 
                      : showTermsError
                        ? 'bg-red-50 border-red-500 cursor-pointer animate-shake'
                        : 'bg-marromescuro/5 border-transparent cursor-pointer hover:bg-marromescuro/10 active:scale-[0.98]'
                  }`}
                >
                  <input 
                    type="checkbox"
                    name="acceptedTerms"
                    checked={formData.acceptedTerms}
                    onChange={handleChange}
                    disabled={!hasReadTerms}
                    className={`w-6 h-6 rounded-md border-marromescuro/20 text-[#617964] focus:ring-[#617964] bg-white disabled:opacity-50 ${showTermsError ? 'border-red-500' : ''}`}
                  />
                  <span className={`text-sm font-bold ${showTermsError ? 'text-red-600' : 'text-marromescuro'}`}>
                    Aceito todos os termos e condições para cadastrar meu imóvel
                  </span>
                </label>
              </div>
              
              {showTermsError && (
                <p className="text-xs font-bold text-red-500 ml-2 animate-bounce">
                  ↑ Por favor, aceite os termos antes de continuar
                </p>
              )}
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
