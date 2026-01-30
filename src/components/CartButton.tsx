import { ShoppingBag, Package } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const CartButton = () => {
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <div className="fixed bottom-8 right-8 z-50 group">
      
      {/* --- TOOLTIP (Aparece no Hover) --- */}
      <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#121212] border border-white/10 rounded-lg text-white text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 pointer-events-none whitespace-nowrap shadow-xl">
        Abrir Inventário
        {/* Setinha do Tooltip */}
        <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-[#121212] border-t border-r border-white/10 rotate-45" />
      </div>

      {/* --- O BOTÃO --- */}
      <button
        onClick={() => setIsCartOpen(true)}
        className={`
          relative w-16 h-16 rounded-2xl flex items-center justify-center 
          transition-all duration-300 ease-out
          border shadow-2xl
          ${totalItems > 0 
            ? 'bg-green-600 border-green-400 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_40px_rgba(34,197,94,0.6)] hover:bg-green-500 hover:scale-110 hover:-rotate-3' 
            : 'bg-[#121212]/90 border-white/10 text-gray-400 hover:border-green-500/50 hover:text-green-400 hover:scale-105 backdrop-blur-md'
          }
        `}
      >
        {/* Efeito de Ping se tiver itens (Chama atenção) */}
        {totalItems > 0 && (
          <span className="absolute inset-0 rounded-2xl bg-green-500 opacity-20 animate-ping duration-1000" />
        )}

        {/* Ícone (Muda se tiver cheio ou vazio) */}
        {totalItems > 0 ? (
           <ShoppingBag className="w-7 h-7 stroke-[2.5]" />
        ) : (
           <Package className="w-7 h-7 stroke-[1.5]" />
        )}

        {/* --- BADGE DE QUANTIDADE --- */}
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 w-6 h-6 rounded-lg bg-orange-500 text-black text-xs font-black flex items-center justify-center border-2 border-[#0a0a0a] shadow-lg animate-in zoom-in spin-in-3">
            {totalItems}
          </span>
        )}
      </button>
    </div>
  );
};

export default CartButton;