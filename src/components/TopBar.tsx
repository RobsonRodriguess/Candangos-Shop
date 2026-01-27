import { useState, useEffect } from 'react';
import { Users, Copy, Check } from 'lucide-react';
import { AuthButton } from './AuthButton'; // Certifique-se que o caminho está certo

const TopBar = () => {
  const [copied, setCopied] = useState(false);
  const [playersOnline, setPlayersOnline] = useState<number | string>("..."); 
  
  const serverIP = "hytale.hywer.net";
  const SERVER_ID = '1461132354096726171'; 

  useEffect(() => {
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

    fetchOnlineCount();
    const interval = setInterval(fetchOnlineCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const copyIP = async () => {
    await navigator.clipboard.writeText(serverIP);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-muted/50 border-b border-gold/30 py-2 px-4 backdrop-blur-md">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center text-sm gap-2 sm:gap-0">
        
        {/* Lado Esquerdo: Contador Dinâmico */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-4 h-4 text-secondary" />
          <span>
            <span className="text-secondary font-bold">{playersOnline}</span> Jogadores Online
          </span>
        </div>
        
        {/* Lado Direito: Ações (IP + Login) */}
        <div className="flex items-center gap-3">
            {/* Botão Copiar IP */}
            <button
            onClick={copyIP}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-black/40 hover:bg-black/60 border border-gold/10 transition-all duration-200 hover:border-primary/60 cursor-pointer text-xs sm:text-sm"
            >
            {copied ? (
                <>
                <Check className="w-3 h-3 text-green-500 animate-in zoom-in" />
                <span className="text-green-500 font-bold">Copiado!</span>
                </>
            ) : (
                <>
                <Copy className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground hover:text-white transition-colors font-mono">{serverIP}</span>
                </>
            )}
            </button>

            {/* Divisória visual pequena */}
            <div className="h-4 w-[1px] bg-white/10 hidden sm:block"></div>

            {/* Botão de Login Discord */}
            <AuthButton />
        </div>

      </div>
    </div>
  );
};

export default TopBar;