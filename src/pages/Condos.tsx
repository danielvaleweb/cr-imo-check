import React from 'react';
import { motion } from 'motion/react';
import { MapPin, ChevronRight, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCondos } from '../context/CondoContext';

export default function Condos() {
  const navigate = useNavigate();
  const { condos } = useCondos();

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Condos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {condos.map((condo) => (
            <motion.div
              key={condo.id}
              whileHover={{ y: -10 }}
              className="bg-white rounded-[40px] overflow-hidden shadow-xl border border-marromescuro/5 group cursor-pointer"
              onClick={() => navigate(`/condominio/${condo.id}`)}
            >
              <div className="relative h-72 overflow-hidden">
                <img 
                  src={condo.images && condo.images.length > 0 ? condo.images[0] : (condo.image360Url || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80")} 
                  alt={condo.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {condo.logoUrl && (
                  <div className="absolute inset-0 flex items-center justify-center p-12">
                    <img 
                      src={condo.logoUrl} 
                      alt="Logo" 
                      className="max-w-full max-h-full object-contain drop-shadow-2xl"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase tracking-widest mb-2">
                    <MapPin className="w-3 h-3 text-terracota" />
                    {condo.location}
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-white leading-tight">
                    {condo.name}
                  </h3>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <p className="text-marromescuro/60 text-sm line-clamp-3 font-medium leading-relaxed">
                  {condo.bio}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-marromescuro/5">
                  <div className="flex items-center gap-2 text-marromescuro/40">
                    <Building2 className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Ver detalhes</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-marromescuro/5 flex items-center justify-center text-marromescuro group-hover:bg-marromescuro group-hover:text-white transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {condos.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Building2 className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-marromescuro">Nenhum condomínio cadastrado</h3>
            <p className="text-marromescuro/60">Em breve teremos novidades para você.</p>
          </div>
        )}
      </div>
    </div>
  );
}
