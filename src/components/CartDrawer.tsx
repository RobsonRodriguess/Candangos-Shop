import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useCart } from '@/contexts/CartContext';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, PackageOpen, ShieldCheck } from 'lucide-react';
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
      <SheetContent className="w-full sm:max-w-md bg-[#0a0a0a] border-l border-white/10 flex flex-col p-0 shadow-2xl shadow-black">
        
        {/* --- HEADER DO CARRINHO --- */}
        <SheetHeader className="px-6 py-6 border-b border-white/5 bg-[#121212]">
          <SheetTitle className="font-display flex items-center gap-3 text-white text-xl tracking-wide">
            <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
               <ShoppingBag className="w-5 h-5 text-green-500" />
            </div>
            <span>
              Inventário <span className="text-gray-500 text-sm font-sans font-normal ml-2">({totalItems} itens)</span>
            </span>
          </SheetTitle>
        </SheetHeader>

        {/* --- CONTEÚDO --- */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-6">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 animate-pulse">
                <PackageOpen className="w-10 h-10 opacity-50" />
            </div>
            <p className="text-lg font-bold text-white mb-2">Inventário Vazio</p>
            <p className="text-sm text-center max-w-xs mb-8">
              Você ainda não adicionou nenhum equipamento ou suprimento ao seu carrinho.
            </p>
            <button
              onClick={() => setIsCartOpen(false)}
              className="px-6 py-2 rounded-lg border border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500 transition-all text-sm font-bold uppercase tracking-wide"
            >
              Voltar para a Loja
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex gap-4 bg-[#121212] border border-white/5 p-3 rounded-xl hover:border-green-500/30 transition-all duration-300"
                >
                  {/* Imagem do Item */}
                  <div className="w-20 h-20 bg-black/40 rounded-lg border border-white/5 flex items-center justify-center p-2 shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  {/* Detalhes */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <h4 className="font-bold text-gray-200 text-sm leading-tight line-clamp-2 mb-1">{item.title}</h4>
                        <p className="text-green-400 font-bold text-sm">
                        R$ {item.price.toFixed(2).replace('.', ',')}
                        </p>
                    </div>
                    
                    {/* Controles de Quantidade */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center bg-black/40 rounded-lg border border-white/5 overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors"
                        title="Remover item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* --- FOOTER DO CARRINHO --- */}
            <div className="bg-[#121212] border-t border-white/5 p-6 space-y-4">
              
              <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-bold text-white">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-gray-500 text-sm">Total Geral</span>
                    <span className="text-2xl font-bold text-green-400">
                      <span className="text-sm font-normal text-green-600 mr-1">R$</span>
                      {totalPrice.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
              </div>
              
              <button
                onClick={handleCheckout}
                className="w-full relative overflow-hidden group bg-green-600 hover:bg-green-500 text-white rounded-lg py-3.5 font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                   Finalizar Pedido <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              
              <div className="flex justify-center items-center gap-2 text-[10px] text-gray-600 uppercase font-bold tracking-widest">
                 <ShieldCheck className="w-3 h-3" /> Compra 100% Segura
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;