import { useState, useEffect } from 'react';
import { Users, Copy, Check } from 'lucide-react';

const TopBar = () => {
  const [copied, setCopied] = useState(false);
  // Agora começa com "..." enquanto carrega
  const [playersOnline, setPlayersOnline] = useState<number | string>("..."); 
  
  const serverIP = "hytale.hywer.net";
  const SERVER_ID = '1461132354096726171'; // ID do Hywer

  useEffect(() => {
    const fetchOnlineCount = async () => {
      try {
        const response = await fetch(`https://discord.com/api/guilds/${SERVER_ID}/widget.json`);
        const data = await response.json();
        
        // Atualiza com o número real do Discord
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
    
    // Atualiza a cada 60 segundos (opcional)
    const interval = setInterval(fetchOnlineCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const copyIP = async () => {
    await navigator.clipboard.writeText(serverIP);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-muted/50 border-b border-gold/30 py-2 px-4">
      <div className="container mx-auto flex justify-between items-center text-sm">
        
        {/* Lado Esquerdo: Contador Dinâmico */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-4 h-4 text-secondary" />
          <span>
            <span className="text-secondary font-bold">{playersOnline}</span> Jogadores Online
          </span>
        </div>
        
        {/* Lado Direito: Botão Copiar IP */}
        <button
          onClick={copyIP}
          className="flex items-center gap-2 px-3 py-1 rounded bg-muted hover:bg-muted/80 border border-gold/30 transition-all duration-200 hover:border-primary/60 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-500 animate-in zoom-in duration-300" />
              <span className="text-green-500 font-bold">Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground hover:text-white transition-colors">{serverIP}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TopBar;