import { Sparkles } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative w-full py-16 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-gold/30 mb-6">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Servidor Oficial de Hytale</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
          <span className="text-gold-gradient">Bem-vindo à Loja</span>
          <br />
          <span className="text-cyan-gradient">Hywer</span>
        </h1>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Explore nossa seleção de ranks e itens exclusivos para aprimorar sua experiência no servidor. 
          Apoie a comunidade e desbloqueie benefícios incríveis!
        </p>

        <div className="flex justify-center gap-4">
          
          {/* LINK 1: Rolar para a Loja */}
          {/* Certifique-se que o ShopSection tem id="loja" */}
          <a href="#loja" className="rpg-button cursor-pointer">
            Ver Produtos
          </a>
          
          <a 
            href="https://discord.gg/Hcu7y4Cz" 
            target="_blank" 
            rel="noopener noreferrer"
            className="rpg-button bg-transparent border-2 border-primary text-primary hover:bg-primary/10 cursor-pointer"
          >
            Entrar no Discord
          </a>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;