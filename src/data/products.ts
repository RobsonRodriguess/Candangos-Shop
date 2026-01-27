// Mantivemos os imports que você AINDA NÃO mandou o link (pra não quebrar o site)
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
  // --- RANK AVENTUREIRO (Link Online ✅) ---
  {
    id: 1,
    title: "Rank Aventureiro",
    description: "Perfeito para quem está começando sua jornada no mundo de Hywer.",
    price: 29.90,
    // Link direto do Discord:
    image: "https://media.discordapp.net/attachments/1057787918468526131/1465732498834063454/9d80f5b4acfac2182c27253dc5dd05e0_chatgpt_image_26_de_jan_de_2026_21_19_24.png?ex=697a2d43&is=6978dbc3&hm=a919f2b8c7dfe3febaa440aea837c5624af1cbb844a2773fbd1bbc23df3f9389&=&format=webp&quality=lossless",
    featured: true,
    category: 'ranks',
    benefits: [
      "Acesso a área VIP",
      "Kit inicial exclusivo",
      "Tag especial no chat",
      "2x XP em eventos"
    ]
  },

  // --- RANK APOIADOR (Link Online ✅) ---
  {
    id: 2,
    title: "Rank Apoiador",
    description: "Para os verdadeiros heróis que apoiam a comunidade Hywer.",
    price: 49.90,
    originalPrice: 69.90,
    // Link direto do Discord:
    image: "https://media.discordapp.net/attachments/1057787918468526131/1465732498121035965/153155feadc7ea005dd182b223b18957_apoiador.png?ex=697a2d43&is=6978dbc3&hm=1500251545e7e185f2e8adea65a7ed7ea0836f60cdbdbfa69849302b837938d7&=&format=webp&quality=lossless",
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
  
  // --- ITEM DE TESTE (Link Online ✅) ---
];

export const categories = [
  { id: 'all', name: 'Todos', icon: 'Grid' },
  { id: 'ranks', name: 'Ranks', icon: 'Crown' },
  { id: 'items', name: 'Itens', icon: 'Package' },
  { id: 'keys', name: 'Chaves', icon: 'Key' },
];