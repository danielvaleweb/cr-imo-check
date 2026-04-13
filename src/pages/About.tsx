import { motion } from 'motion/react';
import { Award, Target, Heart, Phone, Mail } from 'lucide-react';
import { useBrokers } from '../context/BrokerContext';
import { useProperties } from '../context/PropertyContext';

export default function About() {
  const { brokers } = useBrokers();
  const { properties } = useProperties();
  return (
    <div className="pt-32 pb-20 px-6 bg-brand-cream min-h-screen">
      <div className="max-w-7xl mx-auto space-y-24">
        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="aspect-square rounded-[64px] overflow-hidden shadow-2xl bg-marromescuro/5 flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Equipe trabalhando junta" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-8 -right-8 bg-brand-rust text-white p-12 rounded-[48px] shadow-2xl hidden md:block">
              <div className="text-5xl font-helvetica font-bold">15+</div>
              <div className="text-sm font-medium tracking-widest uppercase opacity-80">Anos de História</div>
            </div>
          </div>
          <div className="space-y-8">
            <h1 className="text-5xl md:text-7xl font-helvetica font-bold text-brand-dark leading-tight">
              Nossa <span className="text-brand-rust">Missão</span> é Realizar Sonhos.
            </h1>
            <div className="space-y-6 text-lg text-brand-dark/70 font-helvetica font-light">
              <p>
                A CR Imóveis nasceu da paixão por conectar pessoas a lares que refletem suas aspirações e estilo de vida. Ao longo de mais de uma década, nos tornamos referência no mercado imobiliário de alto padrão.
              </p>
              <p>
                Nossa abordagem é centrada no cliente, combinando tecnologia de ponta com um atendimento humanizado e personalizado. Cada imóvel em nossa curadoria é selecionado com rigor para garantir exclusividade e qualidade.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12">
          {[
            {
              icon: Award,
              title: "Excelência",
              desc: "Buscamos a perfeição em cada detalhe do nosso atendimento e curadoria."
            },
            {
              icon: Target,
              title: "Foco",
              desc: "Nossa energia está voltada para encontrar a solução ideal para cada cliente."
            },
            {
              icon: Heart,
              title: "Paixão",
              desc: "Amamos o que fazemos e isso se reflete na satisfação dos nossos clientes."
            }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="text-center space-y-6"
            >
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <item.icon className="w-10 h-10 text-brand-rust" />
              </div>
              <h3 className="text-2xl font-helvetica font-bold text-brand-dark">{item.title}</h3>
              <p className="text-brand-dark/60 max-w-xs mx-auto font-helvetica font-light">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Team Section */}
        <div className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-helvetica font-bold text-brand-dark">Nossa <span className="text-brand-rust">Equipe</span></h2>
            <p className="text-lg text-brand-dark/60 max-w-2xl mx-auto font-helvetica font-light">
              Conheça os especialistas que estão prontos para transformar sua jornada imobiliária em uma experiência extraordinária.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pt-12 max-w-6xl mx-auto">
            {brokers.map((broker, idx) => {
              const brokerProperties = properties.filter(p => p.broker === broker.name);
              const latestProperty = brokerProperties.length > 0 ? brokerProperties[0] : null;
              const propertyImage = latestProperty ? (latestProperty.images?.[0] || latestProperty.image) : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80';

              return (
                <motion.div 
                  key={broker.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative bg-white rounded-[48px] shadow-xl border border-brand-dark/5 group pt-24 max-w-[350px] mx-auto w-full"
                >
                  {/* Background Property Image with Blur */}
                  <div className="absolute top-0 left-0 right-0 h-48 overflow-hidden rounded-t-[48px]">
                    <img 
                      src={propertyImage} 
                      alt="Latest Property"
                      className="w-full h-full object-cover blur-md scale-110 opacity-40 transition-transform duration-700 group-hover:scale-125"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white" />
                  </div>

                  {/* Broker Image in Circle - "Leaving the canvas" */}
                  <div className="relative flex justify-center -mt-32 mb-6">
                    <div className="w-44 h-44 rounded-full border-[12px] border-white shadow-2xl overflow-hidden z-10 transition-transform duration-500 group-hover:scale-105">
                      <img 
                        src={broker.photo} 
                        alt={broker.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>

                  <div className="p-8 text-center space-y-4 relative z-20">
                    <div>
                      <h3 className="text-2xl font-helvetica font-bold text-brand-dark">{broker.name}</h3>
                      <p className="text-brand-rust font-helvetica font-bold text-sm uppercase tracking-widest">{broker.role}</p>
                    </div>
                    
                    <p className="text-brand-dark/60 text-sm leading-relaxed line-clamp-3 min-h-[4.5rem] font-helvetica font-light">
                      {broker.bio}
                    </p>

                    <div className="flex items-center justify-center gap-4 pt-6 border-t border-brand-dark/5">
                      <a 
                        href={`tel:${broker.phone.replace(/\D/g, '')}`}
                        className="p-3 bg-brand-cream rounded-xl text-brand-dark/40 hover:text-brand-rust hover:bg-brand-rust/10 transition-all cursor-pointer"
                      >
                        <Phone className="w-5 h-5" />
                      </a>
                      <a 
                        href={`mailto:${broker.email}`}
                        className="p-3 bg-brand-cream rounded-xl text-brand-dark/40 hover:text-brand-rust hover:bg-brand-rust/10 transition-all cursor-pointer"
                      >
                        <Mail className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
