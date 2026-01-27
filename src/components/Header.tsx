const navigation = [
  { name: 'Início', href: '#' },
  { name: 'Loja', href: '#loja' },
  { name: 'Discord', href: 'https://discord.gg/Hcu7y4Cz' },
  { name: 'Notícias', href: '#noticias' },
];

const Header = () => {
  return (
    <header className="w-full py-6 relative z-10">
      {/* Background blur effect opcional */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-transparent -z-10 pointer-events-none" />

      <div className="container mx-auto flex flex-col items-center gap-6 px-4">
        
        {/* LOGO PRINCIPAL */}
        <div className="relative group cursor-pointer">
          {/* Brilho atrás do logo */}
          <div className="absolute inset-0 bg-cyan-500/20 blur-[50px] rounded-full group-hover:bg-cyan-500/30 transition-all duration-500" />
          
          <img 
            src="/logo1.png" 
            alt="Hywer Logo" 
            // AJUSTE: h-28 no celular, h-40 no PC (sm:h-40) para não ocupar a tela toda
            className="relative h-28 sm:h-40 w-auto drop-shadow-2xl transition-transform duration-300 hover:scale-105 hover:rotate-1"
          />
        </div>

        {/* NAVEGAÇÃO BLINDADA 🛡️ */}
        <nav className="
            grid grid-cols-2 w-full max-w-[320px] gap-2 p-2 rounded-2xl
            sm:flex sm:w-auto sm:max-w-none sm:gap-2 sm:p-1.5 sm:rounded-full
            bg-black/60 backdrop-blur-md border border-white/10 shadow-2xl
        ">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="
                text-center px-4 py-3 sm:px-6 sm:py-2 
                rounded-xl sm:rounded-full 
                text-sm font-bold uppercase tracking-wide 
                text-gray-300 hover:text-white hover:bg-white/10 
                transition-all border border-transparent hover:border-white/5
              "
            >
              {item.name}
            </a>
          ))}
        </nav>

      </div>
    </header>
  );
};

export default Header;