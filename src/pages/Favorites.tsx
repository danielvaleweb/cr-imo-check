import { motion } from 'motion/react';
import { Heart, ArrowLeft, Trash2 } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import React from 'react';
import { useProperties } from '../context/PropertyContext';
import PropertyCard from '../components/PropertyCard';

export default function Favorites() {
  const navigate = useNavigate();
  const { properties } = useProperties();
  const { favorites, toggleFavorite, clearFavorites } = useOutletContext<{ 
    favorites: (string | number)[], 
    toggleFavorite: (id: string | number) => void,
    clearFavorites: () => void 
  }>();
  
  const favoritedProperties = properties.filter(p => favorites.includes(p.id));

  return (
    <div className="pt-32 pb-20 px-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm font-bold text-terracota hover:opacity-80 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
          </div>

          {favoritedProperties.length > 0 && (
            <button
              onClick={clearFavorites}
              className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-2xl text-sm font-bold hover:bg-red-100 transition-all border border-red-100"
            >
              <Trash2 className="w-4 h-4" />
              <span>Limpar tudo</span>
            </button>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {favoritedProperties.length > 0 ? (
            favoritedProperties.map((prop) => (
              <PropertyCard 
                key={prop.id} 
                prop={prop} 
                onClick={() => navigate(`/imovel/${prop.id}`)} 
                isFavorite={true}
                onToggleFavorite={() => toggleFavorite(prop.id)}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center space-y-4">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Heart className="w-8 h-8 text-gray-200" />
              </div>
              <h3 className="text-xl font-bold text-marromescuro">Você ainda não tem favoritos</h3>
              <p className="text-marromescuro/60">Explore nossos imóveis e clique no coração para salvar os que mais gostar.</p>
              <button 
                onClick={() => navigate('/comprar')}
                className="bg-terracota text-white px-8 py-3 rounded-full font-bold shadow-xl hover:bg-terracota/90 transition-all"
              >
                Explorar Imóveis
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
