import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Handshake } from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  specialty: string;
  logoUrl: string;
  slug?: string;
}

export const PartnersSection = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'partners'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Partner));
      setPartners(data);
    });
    return () => unsubscribe();
  }, []);

  if (partners.length === 0) return null;

  return (
    <section className="bg-white py-16 px-6 border-t border-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-[#617964]/10 p-3 rounded-2xl">
            <Handshake className="w-6 h-6 text-[#617964]" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-marromescuro">Nossos Parceiros</h2>
            <p className="text-sm text-marromescuro/60 font-medium">Marcas que confiam em nosso trabalho de excelência.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {partners.map((partner) => (
            <motion.button
              key={partner.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(partner.slug ? `/${partner.slug}` : `/parceiro/${partner.id}`)}
              className="flex flex-col items-center gap-4 group"
            >
              <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex items-center justify-center p-6 group-hover:bg-white group-hover:border-[#617964]/20 group-hover:shadow-xl transition-all duration-300">
                <img 
                  src={partner.logoUrl} 
                  alt={partner.name} 
                  className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
                />
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <span className="text-xs font-black text-marromescuro group-hover:text-[#617964] uppercase tracking-widest transition-colors">
                  {partner.name}
                </span>
                <span className="text-[10px] font-bold text-marromescuro/40 uppercase tracking-widest leading-none">
                  {partner.specialty}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};
