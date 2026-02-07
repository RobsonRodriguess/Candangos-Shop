import { useState } from 'react';
import { ShoppingCart, Star, Check, Zap } from 'lucide-react';
import { products, categories, Product } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

// Instância do som (carrega uma vez para não ter delay)
const buySound = new Audio('/buy.mp3');
buySound.volume = 0.5; // 50% do volume para não estourar o ouvido

const ShopSection = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const { addItem } = useCart();

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  const handleAddToCart = (product: Product) => {
    // 🔊 Toca o som
    buySound.currentTime = 0; // Reinicia o som se clicar rápido
    buySound.play().catch(() => {}); // Ignora erro se o navegador bloquear

    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
    });
    
    // Toast personalizado no estilo Guilda
    toast.success(`${product.title} adicionado!`, {
      icon: <Check className="w-4 h-4 text-black" />,
      className: "!bg-green-500 !border-green-600 !text-black font-bold",
      description: "Item enviado para o carrinho.",
    });
  };

  return (
    <section id="loja" className="py-24 bg-[#0a0a0a] relative overflow-hidden">
      
      {/* --- BACKGROUND FX --- */}
      {/* Grid Pattern (Identidade Candangos) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      {/* Luzes Ambientais */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-gray-400">
             <Zap className="w-3 h-3 text-yellow-400" /> Loja Oficial
          </div>
          
          <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-white">
            Arsenal <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">CANDANGOS</span>
          </h2>
          
          <p className="font-sans text-gray-400 max-w-2xl mx-auto text-lg">
            Adquira ranks, kits de construção e vantagens exclusivas para dominar o servidor.
          </p>
        </div>

        {/* --- CATEGORIAS (Estilo Industrial) --- */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`
                px-6 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wide transition-all duration-300 border
                ${activeCategory === cat.id
                  ? 'bg-green-600 text-white border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)] scale-105'
                  : 'bg-[#121212] text-gray-400 border-white/10 hover:border-green-500/50 hover:text-white hover:bg-white/5'
                }
              `}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* --- GRID DE PRODUTOS --- */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="group relative flex flex-col h-full bg-[#121212] border border-white/5 hover:border-green-500/40 rounded-xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-900/10"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Labels Flutuantes */}
              <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
                  {product.featured && (
                    <span className="bg-yellow-500 text-black px-2 py-1 rounded text-[10px] font-black flex items-center gap-1 shadow-lg uppercase tracking-wider">
                      <Star className="w-3 h-3 fill-black" /> Destaque
                    </span>
                  )}
                  {/* Lógica da Tag de Desconto Automática */}
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-[10px] font-black shadow-lg uppercase tracking-wider">
                      -{Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                    </span>
                  )}
              </div>

              {/* Imagem do Produto */}
              <div className="relative h-48 bg-gradient-to-b from-white/[0.02] to-transparent flex items-center justify-center p-6 overflow-hidden">
                {/* Glow atrás da imagem */}
                <div className="absolute w-24 h-24 bg-green-500/20 rounded-full blur-3xl group-hover:bg-green-500/30 transition-all duration-500" />
                
                <img
                  src={product.image}
                  alt={product.title}
                  className="relative z-10 w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ease-out"
                />
              </div>

              {/* Conteúdo do Card */}
              <div className="flex-1 p-5 flex flex-col border-t border-white/5 bg-[#141414]">
                
                <div className="mb-4">
                    <h3 className="text-xl font-display font-bold text-white mb-1 group-hover:text-green-400 transition-colors line-clamp-1">
                      {product.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 h-8 leading-relaxed">
                      {product.description}
                    </p>
                </div>

                {/* Lista de Benefícios Compacta */}
                {product.benefits && (
                  <div className="space-y-1.5 mb-6 flex-1">
                    {product.benefits.slice(0, 3).map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[11px] text-gray-400 group-hover:text-gray-300 transition-colors">
                        <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                        <span className="uppercase tracking-tight font-medium">{benefit}</span>
                      </div>
                    ))}
                    {product.benefits.length > 3 && (
                        <p className="text-[10px] text-green-500 font-bold pl-5 pt-1">
                            + {product.benefits.length - 3} Vantagens
                        </p>
                    )}
                  </div>
                )}

                {/* Preço e Ação */}
                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                  <div>
                    {/* Renderiza o preço antigo riscado SE ele existir */}
                    {product.originalPrice && (
                      <span className="block text-[10px] text-gray-400 line-through font-bold">
                        R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                      </span>
                    )}
                    <span className="text-xl font-bold text-white flex items-baseline gap-1">
                      <span className="text-xs text-green-500 font-normal">R$</span>
                      {product.price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    className="
                        group/btn relative overflow-hidden rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 
                        hover:bg-green-600 hover:border-green-500 hover:text-white transition-all duration-300
                    "
                  >
                    <div className="flex items-center gap-2 relative z-10">
                        <ShoppingCart className="w-4 h-4 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-300 group-hover:text-white">Comprar</span>
                    </div>
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopSection;