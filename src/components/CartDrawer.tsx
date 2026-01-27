import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useCart } from '@/contexts/CartContext';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-md bg-card border-l border-gold/30 flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-gold-gradient font-display flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Carrinho ({totalItems})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <ShoppingBag className="w-16 h-16 mb-4 opacity-30" />
            <p>Seu carrinho está vazio</p>
            <button
              onClick={() => setIsCartOpen(false)}
              className="mt-4 text-primary hover:underline"
            >
              Continuar comprando
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rpg-card flex gap-4 animate-fade-in"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 object-contain"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground">{item.title}</h4>
                    <p className="text-primary font-bold">
                      R$ {item.price.toFixed(2).replace('.', ',')}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto w-7 h-7 rounded bg-destructive/20 flex items-center justify-center hover:bg-destructive/30 transition-colors text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gold/30 pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="text-xl font-bold text-primary">
                  R$ {totalPrice.toFixed(2).replace('.', ',')}
                </span>
              </div>
              
              <button
                onClick={handleCheckout}
                className="rpg-button rpg-button-green w-full flex items-center justify-center gap-2"
              >
                Finalizar Compra
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-full text-center text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                Continuar comprando
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
