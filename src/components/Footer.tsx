import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-linear-to-r from-[#132014] to-[#617964] text-brand-cream py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <Link to="/" className="flex items-center gap-3 shrink-0 cursor-pointer">
          <img 
            src="https://i.imgur.com/egg4k7M.png" 
            alt="CR Imóveis" 
            className="h-8 w-auto brightness-0 invert opacity-80 hover:opacity-100 transition-opacity"
            referrerPolicy="no-referrer"
          />
        </Link>
        <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-xs md:text-sm font-medium tracking-wide">
          <Link to="/comprar" className="hover:text-[#E5D19E] transition-colors uppercase cursor-pointer">IMÓVEIS</Link>
          <Link to="/condominios" className="hover:text-[#E5D19E] transition-colors uppercase cursor-pointer">CONDOMÍNIOS</Link>
          <Link to="/lancamentos" className="hover:text-[#E5D19E] transition-colors uppercase cursor-pointer">LANÇAMENTOS</Link>
          <Link to="/sobre" className="hover:text-[#E5D19E] transition-colors uppercase cursor-pointer">SOBRE</Link>
          <Link to="/contato" className="hover:text-[#E5D19E] transition-colors uppercase cursor-pointer">CONTATO</Link>
        </div>
        <div className="flex flex-col items-center md:items-end gap-2">
          <div className="text-[10px] text-brand-cream/40 uppercase tracking-widest text-center md:text-right">
            © 2026 CR IMÓVEIS. TODOS OS DIREITOS RESERVADOS.
          </div>
          <a 
            href="https://3tec.com.br" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-all group"
          >
            <span className="text-[8px] font-bold uppercase tracking-tighter text-brand-cream/60 group-hover:text-brand-cream">Desenvolvido por</span>
            <img 
              src="https://i.imgur.com/uPfP5ub.png" 
              alt="3tec" 
              className="h-4 w-auto brightness-0 invert"
              referrerPolicy="no-referrer"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
