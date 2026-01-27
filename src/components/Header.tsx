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

      <div className="container mx-auto flex flex-col items-center gap-6">
        
        {/* LOGO PRINCIPAL */}
        <div className="relative group cursor-pointer">
          {/* Brilho atrás do logo */}
          <div className="absolute inset-0 bg-cyan-500/20 blur-[50px] rounded-full group-hover:bg-cyan-500/30 transition-all duration-500" />
          
          <img 
            src="/logo1.png" 
            alt="Hywer Logo" 
            className="relative h-40 w-auto drop-shadow-2xl transition-transform duration-300 hover:scale-105 hover:rotate-1"
          />
        </div>

        {/* NAVEGAÇÃO */}
        <nav className="flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 p-1.5 shadow-2xl">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wide text-gray-300 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/5"
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