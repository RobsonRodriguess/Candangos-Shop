import aventureiroImg from '@/assets/aventureiro.png';
import apoiadorImg from '@/assets/apoiador.png';
import guardiaoImg from '@/assets/guardiao.png';
import lendarioImg from '@/assets/lendario.png';
import coinsPackImg from '@/assets/coins-pack.png';
import keysPackImg from '@/assets/keys-pack.png';

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  featured?: boolean;
  category: 'ranks' | 'items' | 'keys';
  benefits?: string[];
}

export const products: Product[] = [
  // Ranks
  {
    id: 1,
    title: "Rank Aventureiro",
    description: "Perfeito para quem está começando sua jornada no mundo de Hywer.",
    price: 29.90,
    image: aventureiroImg,
    featured: true,
    category: 'ranks',
    benefits: [
      "Acesso a área VIP",
      "Kit inicial exclusivo",
      "Tag especial no chat",
      "2x XP em eventos"
    ]
  },
  {
    id: 2,
    title: "Rank Apoiador",
    description: "Para os verdadeiros heróis que apoiam a comunidade Hywer.",
    price: 49.90,
    originalPrice: 69.90,
    image: apoiadorImg,
    featured: true,
    category: 'ranks',
    benefits: [
      "Todos os benefícios do Aventureiro",
      "Acesso ao servidor beta",
      "Comandos exclusivos",
      "3x XP em eventos",
      "Pet exclusivo"
    ]
  },
  // --- ITEM DE TESTE (R$ 1,00) ---
];

export const categories = [
  { id: 'all', name: 'Todos', icon: 'Grid' },
  { id: 'ranks', name: 'Ranks', icon: 'Crown' },
  { id: 'items', name: 'Itens', icon: 'Package' },
  { id: 'keys', name: 'Chaves', icon: 'Key' },
];