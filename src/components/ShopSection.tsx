import { useState } from 'react';
import { ShoppingCart, Star, Crown, Package, Key, Grid, Check } from 'lucide-react';
import { products, categories, Product } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

const iconMap: Record<string, React.ElementType> = {
  Grid,
  Crown,
  Package,
  Key,
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
    toast.success(`${product.title} adicionado ao carrinho!`, {
      icon: <Check className="w-4 h-4" />,
    });
  };

  return (
    <section id="loja" className="py-12 bg-muted/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">
            <span className="text-gold-gradient">Loja</span>{' '}
            <span className="text-cyan-gradient">Hywer</span>
          </h2>
          <p className="text-muted-foreground">
            Escolha seu rank e comece sua aventura com benefícios exclusivos!
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((cat) => {
            const Icon = iconMap[cat.icon];
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                  activeCategory === cat.id
                    ? 'bg-primary text-primary-foreground border-primary glow-gold'
                    : 'bg-muted/50 border-gold/30 hover:border-primary/50 text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="rpg-card group hover:glow-gold transition-all duration-300 hover:-translate-y-1 relative flex flex-col"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Featured Badge */}
              {product.featured && (
                <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-10">
                  <Star className="w-3 h-3" />
                  Destaque
                </div>
              )}

              {/* Discount Badge */}
              {product.originalPrice && (
                <div className="absolute -top-3 -left-3 bg-destructive text-destructive-foreground px-2 py-1 rounded-full text-xs font-bold z-10">
                  -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                </div>
              )}

              {/* Product Image */}
              <div className="relative mb-4 flex justify-center py-4">
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-32 w-auto object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* Product Info */}
              <h3 className="text-lg font-display font-bold text-foreground mb-2">
                {product.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 flex-1">
                {product.description}
              </p>

              {/* Benefits (for ranks) */}
              {product.benefits && (
                <ul className="space-y-1 mb-4">
                  {product.benefits.slice(0, 3).map((benefit, idx) => (
                    <li key={idx} className="text-xs text-foreground/70 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                  {product.benefits.length > 3 && (
                    <li className="text-xs text-primary">
                      +{product.benefits.length - 3} mais benefícios
                    </li>
                  )}
                </ul>
              )}

              {/* Price & Buy Button */}
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gold/20">
                <div>
                  {product.originalPrice && (
                    <span className="text-xs text-muted-foreground line-through block">
                      R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                  <span className="text-xl font-bold text-primary">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="rpg-button rpg-button-green flex items-center gap-2 text-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Comprar
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
