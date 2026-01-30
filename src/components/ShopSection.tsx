import { useState } from 'react';
import { ShoppingCart, Star, Check, Sparkles } from 'lucide-react';
import { products, categories, Product } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

const iconMap: Record<string, React.ElementType> = {
  Grid: (props) => <span {...props}>🗺️</span>,
  Crown: (props) => <span {...props}>👑</span>,
  Package: (props) => <span {...props}>📦</span>,
  Key: (props) => <span {...props}>🔑</span>,
};

const ShopSection = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const { addItem } = useCart();

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
    });
    toast.success(`${product.title} adicionado ao inventário!`, {
      icon: <Check className="w-4 h-4 text-primary" />,
      className: "bg-dark-surface border-gold text-foreground font-game",
    });
  };

  return (
    <section id="loja" className="py-20 bg-background relative overflow-hidden">
      {/* Background FX - Luzes suaves nas pontas */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header - Usando sua Cinzel e Roboto */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-4 tracking-tight">
            <span className="text-gold-gradient uppercase">Loja</span>{' '}
            <span className="text-cyan-gradient tracking-tighter uppercase">Hywer</span>
          </h2>
          <p className="font-game text-muted-foreground uppercase tracking-[0.2em] text-xs">
            Escolha seu rank e comece sua aventura com benefícios exclusivos!
          </p>
        </div>

        {/* Category Tabs - Estilo da que você gostou, mas polido */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg border font-game text-xs uppercase tracking-widest transition-all duration-300 ${
                activeCategory === cat.id
                  ? 'bg-primary/20 text-primary border-primary glow-gold scale-105'
                  : 'bg-muted/30 border-gold/20 text-muted-foreground hover:border-primary/50 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid - Estrutura Original com Visual Épico */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="rpg-card group hover:glow-gold transition-all duration-500 hover:-translate-y-2 relative flex flex-col h-full"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Featured Badge */}
              {product.featured && (
                <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground px-3 py-1 rounded-sm text-[10px] font-black flex items-center gap-1 z-20 shadow-lg animate-pulse-glow">
                  <Star className="w-3 h-3 fill-current" />
                  DESTAQUE
                </div>
              )}

              {/* Discount Badge */}
              {product.originalPrice && (
                <div className="absolute -top-3 -left-3 bg-destructive text-destructive-foreground px-2 py-1 rounded-sm text-[10px] font-black z-20 shadow-lg">
                  -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                </div>
              )}

              {/* Product Image - Centralizada e Grande */}
              <div className="relative mb-6 flex justify-center py-6 bg-black/20 rounded-lg overflow-hidden border border-white/5">
                {/* Aura atrás da imagem */}
                <div className="absolute w-32 h-32 bg-primary/10 rounded-full blur-[40px] group-hover:bg-primary/20 transition-all duration-700" />
                
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-40 w-auto object-contain z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 flex flex-col">
                <h3 className="text-2xl font-display font-bold text-white mb-2 group-hover:text-primary transition-colors">
                  {product.title}
                </h3>
                <p className="text-sm font-game text-muted-foreground mb-6 line-clamp-2 italic">
                  "{product.description}"
                </p>

                {/* Benefits List */}
                {product.benefits && (
                  <ul className="space-y-2 mb-8 flex-1">
                    {product.benefits.slice(0, 4).map((benefit, idx) => (
                      <li key={idx} className="text-[11px] font-game text-foreground/80 flex items-center gap-2 uppercase tracking-tighter">
                        <Sparkles className="w-3 h-3 text-cyan drop-shadow-[0_0_2px_rgba(0,255,255,0.5)]" />
                        {benefit}
                      </li>
                    ))}
                    {product.benefits.length > 4 && (
                      <li className="text-[10px] font-game text-primary font-bold uppercase mt-1">
                        +{product.benefits.length - 4} mais benefícios
                      </li>
                    )}
                  </ul>
                )}
              </div>

              {/* Price & Buy Button - Rodapé Alinhado */}
              <div className="flex items-center justify-between mt-auto pt-6 border-t border-gold/10">
                <div className="flex flex-col">
                  {product.originalPrice && (
                    <span className="text-[10px] text-muted-foreground/60 line-through font-game">
                      R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                  <span className="text-2xl font-display font-bold text-white">
                    <span className="text-primary text-sm mr-0.5 font-game">R$</span>
                    {product.price.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                
                <button
                  onClick={() => handleAddToCart(product)}
                  className="rpg-button group/btn flex items-center gap-2 px-6 py-3 active:scale-95"
                >
                  <ShoppingCart className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                  <span className="text-[11px] font-black uppercase tracking-widest">Comprar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopSection;