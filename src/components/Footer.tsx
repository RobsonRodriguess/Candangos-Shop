import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full py-8 bg-muted/30 border-t border-gold/20 mt-12">
      <div className="container mx-auto text-center">
        <p className="text-muted-foreground text-sm flex items-center justify-center gap-1">
          Feito com <Heart className="w-4 h-4 text-red-500" /> pela Equipe Hywer
        </p>
        <p className="text-muted-foreground/60 text-xs mt-2">
          © 2026 Hywer - Todos os direitos reservados
        </p>
        <p className="text-muted-foreground/40 text-xs mt-1">
          Hytale é uma marca registrada da Hypixel Studios.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
