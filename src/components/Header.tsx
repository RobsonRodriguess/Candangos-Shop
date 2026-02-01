import { useState, useEffect } from 'react';
import { Copy, Check, Menu, X, ExternalLink, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';

// 👇 Importando seu botão de Auth atualizado
import { AuthButton } from './AuthButton'; 

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- ESTADOS ---
  const [isScrolled, setIsScrolled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [playersOnline, setPlayersOnline] = useState<number | string>("...");
  
  const serverIP = "hytale.hywer.net";
  const SERVER_ID = '1461132354096726171'; // Seu ID

  // --- MENU ---
  const navItems = [
    { name: 'Início', href: '/', type: 'internal' },
    { name: 'Loja', href: '/#loja', type: 'anchor' },
    { name: 'Ranking', href: '/ranking', type: 'internal', icon: Trophy }, // Novo!
    { name: 'Discord', href: 'https://discord.gg/HTftKRAK', type: 'external' },
    { name: 'Notícias', href: '/#noticias', type: 'anchor' }
  ];

  // --- EFEITOS ---
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);

    const fetchOnlineCount = async () => {
      try {
        const response = await fetch(`https://discord.com/api/guilds/${SERVER_ID}/widget.json`);
        const data = await response.json();
        if (data && data.presence_count !== undefined) {
          setPlayersOnline(data.presence_count);
        } else {
          setPlayersOnline(0);
        }
      } catch (error) {
        console.error("Erro ao buscar jogadores online:", error);
        setPlayersOnline("OFF");
      }
    };

    window.addEventListener('scroll', handleScroll);
    fetchOnlineCount();
    const interval = setInterval(fetchOnlineCount, 60000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  // --- AÇÕES ---
  const copyIp = () => {
    navigator.clipboard.writeText(serverIP);
    setCopied(true);
    toast.success("IP copiado com sucesso!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNavigation = (e: any, item: any) => {
    // Se for link interno (/ranking ou /), usa o navigate do React para não recarregar a página
    if (item.type === 'internal') {
        e.preventDefault();
        navigate(item.href);
        setMobileMenuOpen(false);
    }
    // Se for âncora (#loja), deixa o padrão ou ajusta se estivermos em outra página
    else if (item.type === 'anchor') {
        setMobileMenuOpen(false);
        // O href já é '/#loja', então funciona de qualquer lugar
    }
  };

  return (
    <header 
      className={`
        fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b
        ${isScrolled 
          ? 'bg-[#0a0a0a]/95 backdrop-blur-md border-white/10 py-3 shadow-2xl' 
          : 'bg-transparent border-transparent py-4'
        }
      `}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">

        {/* --- ESQUERDA: STATUS DO SERVIDOR --- */}
        <div className="flex items-center gap-4">
          <button 
            onClick={copyIp}
            className={`
              group flex items-center gap-2 px-3 py-1.5 rounded-lg 
              border transition-all duration-300 active:scale-95
              ${isScrolled ? 'bg-white/5 border-white/10' : 'bg-black/40 border-white/10 backdrop-blur-sm'}
              hover:border-green-500/50 hover:bg-green-500/10
            `}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-green-400" />}
            <span className="text-xs font-mono font-bold text-gray-300 group-hover:text-white tracking-wide hidden xs:inline-block">
              {serverIP}
            </span>
            <span className="text-xs font-mono font-bold text-gray-300 group-hover:text-white tracking-wide xs:hidden">
              IP
            </span>
          </button>

          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-gray-400">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${playersOnline === "OFF" ? "bg-red-400" : "bg-green-400"}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${playersOnline === "OFF" ? "bg-red-500" : "bg-green-500"}`}></span>
            </span>
            <span className="text-green-100">{playersOnline}</span> Online
          </div>
        </div>

        {/* --- CENTRO: NAVEGAÇÃO DESKTOP --- */}
        <nav className={`
            hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2
            transition-all duration-500
            ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}
        `}>
            {navItems.map((item) => (
                <a 
                  key={item.name} 
                  href={item.href}
                  onClick={(e) => handleNavigation(e, item)}
                  target={item.type === 'external' ? "_blank" : "_self"}
                  rel={item.type === 'external' ? "noopener noreferrer" : ""}
                  className={`
                    text-sm font-bold uppercase tracking-wide transition-colors flex items-center gap-1.5
                    ${location.pathname === item.href ? 'text-green-400' : 'text-gray-400 hover:text-white'}
                  `}
                >
                    {item.icon && <item.icon size={14} className={location.pathname === item.href ? 'text-green-400' : 'text-gray-500'} />}
                    {item.name}
                    {item.type === 'external' && <ExternalLink className="w-3 h-3 opacity-50" />}
                </a>
            ))}
        </nav>

        {/* --- DIREITA: AUTH & MENU MOBILE --- */}
        <div className="flex items-center gap-3">
            <div className={`${isScrolled ? '' : 'bg-black/40 backdrop-blur-sm rounded-full'}`}>
               <AuthButton />
            </div>

            <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-white ml-1 hover:bg-white/10 rounded-lg transition-colors"
            >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
        </div>
      </div>

      {/* --- MENU MOBILE --- */}
      <div className={`
        lg:hidden fixed top-[60px] left-0 w-full bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl overflow-hidden transition-all duration-300 ease-in-out
        ${mobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}
      `}>
          <div className="flex flex-col p-4 gap-2">
            {navItems.map((item) => (
                <a 
                  key={item.name} 
                  href={item.href}
                  onClick={(e) => handleNavigation(e, item)}
                  target={item.type === 'external' ? "_blank" : "_self"}
                  rel={item.type === 'external' ? "noopener noreferrer" : ""}
                  className={`
                    px-4 py-3 rounded-lg bg-white/5 font-bold uppercase text-sm hover:bg-white/10 transition-all flex items-center justify-between
                    ${location.pathname === item.href ? 'text-green-400 border border-green-500/30' : 'text-gray-300'}
                  `}
                >
                    <span className="flex items-center gap-2">
                        {item.icon && <item.icon size={16} />}
                        {item.name}
                    </span>
                    {item.type === 'external' && <ExternalLink className="w-4 h-4 opacity-50" />}
                </a>
            ))}
            
            <div className="mt-2 px-4 py-3 bg-black/40 rounded-lg border border-white/5 flex items-center justify-between text-xs text-gray-400 font-bold uppercase">
               <span>Status do Servidor</span>
               <div className="flex items-center gap-2">
                 <span className={`w-2 h-2 rounded-full ${playersOnline === "OFF" ? "bg-red-500" : "bg-green-500"}`}></span>
                 <span className="text-white">{playersOnline} Jogadores</span>
               </div>
            </div>
          </div>
      </div>
    </header>
  );
};

export default Header;