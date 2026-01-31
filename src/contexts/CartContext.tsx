import { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';

export interface CartItem {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // --- FUNÇÃO ATUALIZADA CONFORME SOLICITADO ---
  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === newItem.id);

      // 🛑 Bloqueio imediato para o Ticket de Evento (ID 3)
      if (newItem.id === 3 && existing) {
        toast.error("Limite excedido!", {
          description: "Você só pode ter 1 inscrição para o Torneio X1 no carrinho."
        });
        return prev; 
      }

      if (existing) {
        return prev.map(item =>
          item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });

    const alreadyHasTicket = newItem.id === 3 && items.some(i => i.id === 3);
    if (!alreadyHasTicket) setIsCartOpen(true);
  };

  const removeItem = (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    // --- TRAVA DE QUANTIDADE PARA O TICKET (ID 3) ---
    // Impede que o usuário use os botões de (+) para colocar mais de 1 ticket.
    if (id === 3 && quantity > 1) {
      toast.warning("Apenas 1 inscrição permitida por competidor.");
      return;
    }

    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};