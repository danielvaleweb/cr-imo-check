import { motion } from 'motion/react';
import { Home, TrendingUp, ShieldCheck, Users } from 'lucide-react';

export default function Sell() {
  return (
    <div className="pt-32 pb-20 px-6 bg-brand-cream min-h-screen">
      <div className="max-w-7xl mx-auto space-y-20">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-brand-dark leading-tight">
              Venda seu imóvel com <span className="text-brand-rust">exclusividade</span>.
            </h1>
            <p className="text-lg text-brand-dark/60 max-w-lg">
              Oferecemos uma curadoria especializada e estratégias de marketing personalizadas para garantir que seu imóvel seja visto pelos compradores certos.
            </p>
            <div className="pt-4">
              <button className="bg-brand-rust text-white px-10 py-4 rounded-full font-bold shadow-xl hover:bg-brand-rust/90 transition-all cursor-pointer">
                Anunciar meu imóvel
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] rounded-[48px] overflow-hidden shadow-2xl bg-brand-rust/5 flex items-center justify-center">
              <Home className="w-32 h-32 text-brand-rust/10" />
            </div>
            <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-[32px] shadow-2xl hidden md:block max-w-xs space-y-4">
              <div className="bg-brand-rust/10 w-12 h-12 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-brand-rust" />
              </div>
              <h3 className="font-bold text-brand-dark">Valorização Real</h3>
              <p className="text-sm text-brand-dark/60">Análise de mercado precisa para o melhor preço de venda.</p>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              icon: ShieldCheck,
              title: "Segurança Jurídica",
              desc: "Assessoria completa em todas as etapas do processo de venda."
            },
            {
              icon: Users,
              title: "Base de Compradores",
              desc: "Acesso direto a investidores e compradores qualificados."
            },
            {
              icon: Home,
              title: "Marketing Premium",
              desc: "Fotografia profissional e tours virtuais de alta definição."
            }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="bg-white p-10 rounded-[40px] shadow-sm space-y-6"
            >
              <div className="bg-brand-rust/10 w-16 h-16 rounded-2xl flex items-center justify-center">
                <item.icon className="w-8 h-8 text-brand-rust" />
              </div>
              <h3 className="text-2xl font-bold text-brand-dark">{item.title}</h3>
              <p className="text-brand-dark/60">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
