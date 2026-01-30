import { Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';
// 👇 Importando a sua logo
import logoCandangos from '../assets/CANDANGOSLOGO.png';

const HeroSection = () => {
  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] pt-32 pb-20">
      
      {/* --- BACKGROUND EFFECTS --- */}
      {/* Grid Pattern: Dá a vibe de construção/planejamento */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      {/* Luzes de Fundo (Spotlights) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl opacity-40 pointer-events-none">
        <div className="absolute top-20 left-[-20%] w-[600px] h-[600px] bg-green-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-40 right-[-20%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto relative z-10 flex flex-col items-center text-center px-4">
        
        {/* LOGO GRANDE (HERO) */}
        <div className="relative group mb-8 animate-fade-in-up">
            {/* Brilho pulsante atrás da logo */}
            <div className="absolute inset-0 bg-green-500/20 blur-[50px] rounded-full animate-pulse-slow" />
            
            <img 
              src={logoCandangos} 
              alt="Guilda Candangos" 
              className="relative w-64 md:w-80 lg:w-96 drop-shadow-2xl transition-transform duration-500 hover:scale-105 hover:-rotate-1"
            />
        </div>

        {/* Badge "Guilda & Store" */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-900/20 border border-green-500/30 mb-6 backdrop-blur-sm shadow-[0_0_15px_rgba(34,197,94,0.15)]">
          <Sparkles className="w-4 h-4 text-green-400 fill-green-400/20" />
          <span className="text-xs md:text-sm font-bold text-green-200 tracking-widest uppercase">
            Guilda & Store de Eventos
          </span>
        </div>
        
        {/* Título Principal */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 tracking-tight text-white max-w-4xl leading-tight">
          A Lenda Começa na <br className="hidden md:block"/>
          <span className="bg-gradient-to-r from-green-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent drop-shadow-lg">
            CANDANGOS
          </span>
        </h1>
        
        {/* Descrição */}
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          Equipe-se com os melhores kits, ferramentas e itens exclusivos para dominar os eventos. 
          Entre para a guilda que constrói o futuro do servidor.
        </p>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          
          {/* Botão Loja (Verde) */}
          <a 
            href="#loja" 
            className="w-full sm:w-auto group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-lg bg-green-600 px-8 font-medium text-white transition-all duration-300 hover:bg-green-500 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]"
          >
            <span className="mr-2 flex items-center gap-2 font-bold uppercase tracking-wide">
              Ver Produtos <ShoppingBag className="w-4 h-4" />
            </span>
          </a>
          
          {/* Botão Discord (Outline Laranja) */}
          <a 
            href="https://discord.gg/GqJnprnS" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full sm:w-auto group inline-flex h-12 items-center justify-center rounded-lg border border-orange-500/30 bg-orange-500/5 px-8 font-medium text-orange-400 transition-all hover:bg-orange-500/10 hover:border-orange-500 hover:text-orange-300"
          >
            <span className="font-bold uppercase tracking-wide flex items-center gap-2">
              Discord Oficial <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </a>

        </div>

        {/* Rodapé do Hero (Status) */}
        <div className="mt-20 pt-8 border-t border-white/5 w-full max-w-3xl grid grid-cols-3 gap-8">
            <div className="text-center">
                <p className="text-2xl font-bold text-white">24/7</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Suporte</p>
            </div>
            <div className="text-center border-l border-white/5 border-r">
                <p className="text-2xl font-bold text-green-400">ON</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Status</p>
            </div>
            <div className="text-center">
                <p className="text-2xl font-bold text-white">100%</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Seguro</p>
            </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;