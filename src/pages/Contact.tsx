import { motion } from 'motion/react';
import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { formatPhone } from '../lib/utils';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Comprar um imóvel',
    message: ''
  });
  return (
    <div className="pt-32 pb-20 px-6 bg-brand-cream min-h-screen">
      <div className="max-w-7xl mx-auto space-y-20">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-brand-dark">Fale Conosco</h1>
          <p className="text-lg text-brand-dark/60 max-w-2xl mx-auto">
            Estamos prontos para ajudar você a encontrar o imóvel dos seus sonhos ou vender sua propriedade com exclusividade.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Contact Info */}
          <div className="space-y-12">
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-brand-dark">Informações de Contato</h3>
              <div className="space-y-6">
                {[
                  { icon: Phone, label: "Telefone", value: "+55 (24) 98100-0306" },
                  { icon: Mail, label: "E-mail", value: "contato@crimoveis.com.br" },
                  { icon: MapPin, label: "Endereço", value: "Av. Faria Lima, 4500 - Itaim Bibi, São Paulo - SP" },
                  { icon: MessageSquare, label: "WhatsApp", value: "Clique para iniciar conversa" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-6 group cursor-pointer">
                    <div className="bg-white p-4 rounded-2xl shadow-sm group-hover:bg-brand-rust group-hover:text-white transition-all">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1 pt-1">
                      <p className="text-sm font-bold text-brand-dark/40 uppercase tracking-widest">{item.label}</p>
                      <p className="text-lg font-medium text-brand-dark">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-brand-dark">Siga-nos</h3>
              <div className="flex gap-4">
                {['Instagram', 'Facebook', 'LinkedIn', 'YouTube'].map((social) => (
                  <button key={social} className="bg-white px-6 py-3 rounded-xl font-bold text-brand-dark/60 hover:bg-brand-rust hover:text-white transition-all shadow-sm cursor-pointer">
                    {social}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-10 md:p-16 rounded-[48px] shadow-2xl space-y-8">
            <h3 className="text-3xl font-bold text-brand-dark">Envie uma Mensagem</h3>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-dark/60 uppercase tracking-widest">Nome Completo</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-brand-cream/50 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-brand-rust/20 transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-dark/60 uppercase tracking-widest">E-mail</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-brand-cream/50 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-brand-rust/20 transition-all" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-dark/60 uppercase tracking-widest">Telefone</label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                    placeholder="(32) 99999-9999"
                    className="w-full bg-brand-cream/50 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-brand-rust/20 transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-dark/60 uppercase tracking-widest">Assunto</label>
                  <select 
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-brand-cream/50 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-brand-rust/20 transition-all appearance-none cursor-pointer"
                  >
                    <option>Comprar um imóvel</option>
                    <option>Vender meu imóvel</option>
                    <option>Dúvidas gerais</option>
                    <option>Outros</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-dark/60 uppercase tracking-widest">Mensagem</label>
                <textarea 
                  rows={4} 
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-brand-cream/50 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-brand-rust/20 transition-all resize-none"
                ></textarea>
              </div>
              <button className="w-full bg-brand-rust text-white py-5 rounded-2xl font-bold text-lg shadow-xl hover:bg-brand-rust/90 transition-all cursor-pointer">
                Enviar Mensagem
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
