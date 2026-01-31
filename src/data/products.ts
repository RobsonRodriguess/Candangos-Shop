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

  // --- NOVO CARD: EVENTO X1 ---
 {
    id: 1,
    title: "Inscrição: Torneio X1",
    description: "Evento eliminatório. Avance nas chaves e conquiste o topo da guilda!",
    price: 10.00,
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

export const categories = [
  { id: 'all', name: 'Todos', icon: 'Grid' },
  { id: 'ranks', name: 'Ranks', icon: 'Crown' },
  { id: 'eventos', name: 'Eventos', icon: 'Sword' }, // 👈 Adicionei aqui
  { id: 'items', name: 'Itens', icon: 'Package' },
  { id: 'keys', name: 'Chaves', icon: 'Key' },
];