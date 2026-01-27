import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const CartButton = () => {
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <button
      onClick={() => setIsCartOpen(true)}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full rpg-button flex items-center justify-center shadow-lg glow-gold hover:scale-110 transition-transform"
    >
      <ShoppingCart className="w-6 h-6" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center animate-scale-in">
          {totalItems}
        </span>
      )}
    </button>
  );
};

export default CartButton;
