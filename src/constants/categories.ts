import { 
  Building2, 
  Home as HomeIcon, 
  Warehouse, 
  Map, 
  LandPlot, 
  TrendingUp, 
  CircleDollarSign, 
  Crown, 
  Key, 
  Construction, 
  Sparkles, 
  Trees,
  LucideIcon
} from 'lucide-react';

export interface Category {
  id: string;
  icon: LucideIcon;
  label1: string;
  label2: string;
  slug: string;
}

export const CATEGORIES: Category[] = [
  { 
    id: 'apt-condo', 
    icon: Building2, 
    label1: "Apartamento em", 
    label2: "Condomínio",
    slug: 'apartamento-em-condominio'
  },
  { 
    id: 'house-outside', 
    icon: HomeIcon, 
    label1: "Imóvel fora de", 
    label2: "Condomínio",
    slug: 'imovel-fora-de-condominio'
  },
  { 
    id: 'house-condo', 
    icon: Warehouse, 
    label1: "Imóvel em", 
    label2: "Condomínio",
    slug: 'imovel-em-condominio'
  },
  { 
    id: 'plan', 
    icon: Map, 
    label1: "Imóvel na", 
    label2: "Planta",
    slug: 'imovel-na-planta'
  },
  { 
    id: 'land', 
    icon: LandPlot, 
    label1: "Somente", 
    label2: "Terreno",
    slug: 'somente-terreno'
  },
  { 
    id: 'trending', 
    icon: TrendingUp, 
    label1: "Imóveis", 
    label2: "Em Alta",
    slug: 'imoveis-em-alta'
  },
  { 
    id: 'investment', 
    icon: CircleDollarSign, 
    label1: "Oportunidade de", 
    label2: "Investimento",
    slug: 'oportunidade-de-investimento'
  },
  { 
    id: 'classic', 
    icon: Crown, 
    label1: "Estilo", 
    label2: "Clássicos",
    slug: 'estilo-classicos'
  },
  { 
    id: 'rent', 
    icon: Key, 
    label1: "Imóvel para", 
    label2: "Aluguel",
    slug: 'imovel-para-aluguel'
  },
  { 
    id: 'construction', 
    icon: Construction, 
    label1: "Lotes com", 
    label2: "Construção",
    slug: 'lotes-com-construcao'
  },
  { 
    id: 'new', 
    icon: Sparkles, 
    label1: "Casa", 
    label2: "Recém Construída",
    slug: 'casa-recem-construida'
  },
  { 
    id: 'leisure', 
    icon: Trees, 
    label1: "Praça de", 
    label2: "Lazer",
    slug: 'praça-de-lazer'
  }
];
