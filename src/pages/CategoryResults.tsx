import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { Search, ChevronLeft } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { CATEGORIES } from '../constants/categories';
import PropertyCard from '../components/PropertyCard';

export default function CategoryResults() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { publishedProperties: properties } = useProperties();
  const { favorites, toggleFavorite } = useOutletContext<{ 
    favorites: (string | number)[], 
    toggleFavorite: (id: string | number, type?: 'property' | 'condo', e?: React.MouseEvent) => void 
  }>();

  const category = CATEGORIES.find(c => c.slug === slug);
  
  // Filter properties by category slug (handling comma-separated slugs)
  const filteredProperties = properties.filter(p => p.categorySlug?.split(',').includes(slug || ''));

  if (!category) {
    return (
      <div className="pt-32 pb-20 px-6 bg-marromescuro min-h-screen flex flex-col items-center justify-center space-y-4 text-white">
        <h2 className="text-2xl font-bold">Categoria não encontrada</h2>
        <button onClick={() => navigate('/')} className="text-terracota font-bold hover:underline">
          Voltar para Home
        </button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 bg-marromescuro min-h-screen text-white">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-6">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Voltar</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-4 rounded-2xl shadow-sm border border-white/5">
              <category.icon className="w-8 h-8 text-brand-rust" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/60 uppercase tracking-widest">{category.label1}</p>
              <h1 className="text-3xl md:text-4xl font-bold text-white">{category.label2}</h1>
            </div>
          </div>
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
                onToggleFavorite={(e) => {
                  e.stopPropagation();
                  toggleFavorite(prop.id, 'property', e);
                }}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center space-y-4">
              <div className="bg-white/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Search className="w-8 h-8 text-white/30" />
              </div>
              <h3 className="text-xl font-bold text-white">Nenhum imóvel encontrado nesta categoria</h3>
              <p className="text-white/60">No momento não temos imóveis disponíveis para esta categoria específica.</p>
              <button 
                onClick={() => navigate('/')}
                className="text-terracota font-bold hover:underline"
              >
                Explorar outras categorias
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
