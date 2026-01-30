// Importando as imagens locais que você salvou
import aventureiroImg from '@/assets/Rank-Aventureiro.png';
import apoiadorImg from '@/assets/Rank-Apoiador.png';

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: any; // Alterado para aceitar o objeto da imagem importada
  featured?: boolean;
  category: 'ranks' | 'items' | 'keys';
  benefits?: string[];
}

export const products: Product[] = [
  // --- RANK AVENTUREIRO ---
  {
    id: 1,
    title: "Rank Aventureiro",
    description: "Perfeito para quem está começando sua jornada no mundo de Hywer.",
    price: 29.90,
    image: aventureiroImg, // ✅ Usando sua imagem local
    featured: true,
    category: 'ranks',
    benefits: [
      "Acesso a área VIP",
      "Kit inicial exclusivo",
      "Tag especial no chat",
      "2x XP em eventos"
    ]
  },

  // --- RANK APOIADOR ---
  {
    id: 2,
    title: "Rank Apoiador",
    description: "Para os verdadeiros heróis que apoiam a comunidade Hywer.",
    price: 49.90,
    originalPrice: 69.90,
    image: apoiadorImg, // ✅ Usando sua imagem local
    featured: true,
    category: 'ranks',
    benefits: [
      "Todos os benefícios do Aventureiro",
      "Acesso ao servidor beta",
      "Comandos exclusivos",
      "3x XP em eventos",
      "Pet exclusivo"
    ]
  }
];

export const categories = [
  { id: 'all', name: 'Todos', icon: 'Grid' },
  { id: 'ranks', name: 'Ranks', icon: 'Crown' },
  { id: 'items', name: 'Itens', icon: 'Package' },
  { id: 'keys', name: 'Chaves', icon: 'Key' },
];