// src/data/products.ts

// Importe suas imagens corretamente aqui
import aventureiroImg from '@/assets/Rank-Aventureiro.png'; 
import apoiadorImg from '@/assets/Rank-Apoador.png';
import ticketImg from '@/assets/Ticket1.png';

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: any;
  featured?: boolean;
  category: 'ranks' | 'items' | 'keys' | 'eventos';
  benefits?: string[];
}

export const products: Product[] = [
  // Exemplo de Rank existente (se tiver)
  /*
  {
    id: 99,
    title: "Rank Aventureiro",
    description: "Para quem está começando.",
    price: 15.00,
    image: aventureiroImg,
    category: 'ranks',
    benefits: ["Kit básico"]
  },
  */

  // --- SEU NOVO CARD: EVENTO X1 ---
  {
    id: 1,
    title: "Inscrição: Torneio X1",
    description: "Evento eliminatório. Avance nas chaves e conquiste o topo da guilda!",
    price: 3.00,         // Novo Preço
    originalPrice: 10.00, // Preço Antigo (Riscado)
    image: ticketImg,
    featured: true,
    category: 'eventos',
    benefits: [
      "Vaga garantida no torneio",
      "Participação em chaves eliminatórias",
      "Prêmios para os 3 primeiros",
      "Tag exclusiva [COMPETIDOR]"
    ]
  }
];

// --- AQUI ESTAVA O ERRO: Esta parte precisa estar neste arquivo ---
export const categories = [
  { id: 'all', name: 'Todos', icon: 'Grid' },
  { id: 'ranks', name: 'Ranks', icon: 'Crown' },
  { id: 'eventos', name: 'Eventos', icon: 'Sword' },
  { id: 'items', name: 'Itens', icon: 'Package' },
  { id: 'keys', name: 'Chaves', icon: 'Key' },
];