import { motion } from 'motion/react';
import { Search, ChevronLeft } from 'lucide-react';
import { useNavigate, useSearchParams, useOutletContext } from 'react-router-dom';
import React from 'react';
import { useProperties } from '../context/PropertyContext';
import PropertyCard from '../components/PropertyCard';

export default function Buy() {
  const navigate = useNavigate();
  const { properties } = useProperties();
  const [searchParams] = useSearchParams();
  const codesParam = searchParams.get('codes');
  const { favorites, toggleFavorite } = useOutletContext<{ 
    favorites: (string | number)[], 
    toggleFavorite: (id: string | number, type?: 'property' | 'condo', e?: React.MouseEvent) => void 
  }>();
  
  const filteredProperties = codesParam 
    ? properties.filter(p => {
        const searchCodes = codesParam.split(',').map(c => c.trim().toLowerCase());
        return searchCodes.includes(p.id.toString()) || (p.code && searchCodes.includes(p.code.toLowerCase()));
      })
    : properties.filter(p => {
        const path = window.location.pathname;
        if (path === '/comprar') return p.listingType === 'venda' || p.listingType === 'lançamento';
        if (path === '/alugar') return p.listingType === 'aluguel';
        if (path === '/lancamentos') return p.listingType === 'lançamento';
        if (path === '/permuta') return p.listingType === 'permuta';
        return true;
      });

  const isComprarPage = window.location.pathname === '/comprar';

  return (
    <div className={`pt-32 pb-20 px-6 min-h-screen ${isComprarPage ? 'bg-marromescuro text-white' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-6">
          <button 
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 transition-colors group ${isComprarPage ? 'text-white/60 hover:text-white' : 'text-marromescuro/60 hover:text-marromescuro'}`}
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Voltar</span>
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProperties.length > 0 ? (
            filteredProperties.map((prop) => (
              <PropertyCard 
                key={prop.id} 
                prop={prop} 
                onClick={() => navigate(`/imovel/${prop.id}`)} 
                isFavorite={favorites.includes(String(prop.id))}
                onToggleFavorite={(e) => toggleFavorite(prop.id, 'property', e)}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center space-y-4">
              <div className={`${isComprarPage ? 'bg-white/10' : 'bg-white'} w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-sm`}>
                <Search className={`w-8 h-8 ${isComprarPage ? 'text-white/30' : 'text-gray-300'}`} />
              </div>
              <h3 className={`text-xl font-bold ${isComprarPage ? 'text-white' : 'text-marromescuro'}`}>Nenhum imóvel encontrado</h3>
              <p className={isComprarPage ? 'text-white/60' : 'text-marromescuro/60'}>
                Verifique os filtros ou códigos digitados e tente novamente.
              </p>
              <button 
                onClick={() => navigate('/')}
                className="text-terracota font-bold hover:underline cursor-pointer"
              >
                Voltar para a Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
