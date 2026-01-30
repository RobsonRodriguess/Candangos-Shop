import { useEffect, useState } from 'react';
import { MessageCircle, Radio, Zap, ExternalLink } from 'lucide-react';

const DiscordStatus = () => {
  const [memberCount, setMemberCount] = useState<string>("...");
  // 👇 LINK DE FALLBACK: Se a API falhar, usa esse link direto
  const [inviteLink, setInviteLink] = useState<string>("https://discord.gg/Hcu7y4Cz"); 
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  const SERVER_ID = '1461132354096726171'; 

  useEffect(() => {
    const fetchDiscordData = async () => {
      try {
        const response = await fetch(`https://discord.com/api/guilds/${SERVER_ID}/widget.json`);
        const data = await response.json();
        
        if (data) {
          setMemberCount(data.presence_count);
          // Só substitui o link se a API mandar um válido
          if (data.instant_invite) {
             setInviteLink(data.instant_invite);
          }
          setOnline(true);
        }
      } catch (error) {
        console.error("Erro ao carregar Discord:", error);
        setMemberCount("OFF");
        setOnline(false);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscordData();
    // Atualiza a cada 60 segundos (balanceado)
    const interval = setInterval(fetchDiscordData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full min-h-[240px] bg-[#121212] border border-white/10 rounded-xl overflow-hidden relative group flex flex-col justify-between hover:border-white/20 transition-colors">
      
      {/* --- EFEITOS DE FUNDO --- */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] transition-colors duration-500 pointer-events-none ${online ? 'bg-green-500/10' : 'bg-red-500/10'}`} />

      {/* --- HEADER DO WIDGET --- */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
           <div className={`p-2 rounded-lg transition-colors ${online ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              <Radio className="w-5 h-5" />
           </div>
           <span className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden xs:block">Server Status</span>
        </div>
        
        {/* Badge de Status */}
        <div className={`flex items-center gap-2 text-[10px] font-bold uppercase px-3 py-1.5 rounded-full border transition-colors ${
            online ? 'bg-green-900/20 border-green-500/30 text-green-400' : 'bg-red-900/20 border-red-500/30 text-red-400'
        }`}>
            <div className={`w-2 h-2 rounded-full ${online ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            {loading ? 'Conectando...' : (online ? 'Online' : 'Offline')}
        </div>
      </div>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <div className="p-6 text-center relative z-10 flex-1 flex flex-col justify-center items-center">
        <div className="mb-6 w-full">
            {loading ? (
               <div className="h-10 w-24 bg-white/10 rounded mx-auto animate-pulse mb-2" />
            ) : (
               <h3 className="text-4xl font-display font-bold text-white tracking-tight mb-1 drop-shadow-lg">
                 {memberCount}
               </h3>
            )}
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
               Jogadores Conectados
            </p>
        </div>

        {/* Botão de Ação Responsivo */}
        <a 
          href={inviteLink} 
          target="_blank" 
          rel="noreferrer"
          className="
            group flex items-center justify-center gap-3 w-full py-3.5 rounded-xl
            bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold text-xs sm:text-sm uppercase tracking-wide
            transition-all duration-300 shadow-lg shadow-[#5865F2]/20 hover:shadow-[#5865F2]/40 hover:-translate-y-0.5
          "
        >
          <MessageCircle className="w-5 h-5" />
          <span>Entrar na Comunidade</span>
          <ExternalLink className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>

      {/* --- FOOTER INFO --- */}
      <div className="px-5 py-3 bg-black/40 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-600 font-mono relative z-10">
        <span className="truncate max-w-[120px] sm:max-w-none" title={SERVER_ID}>
            ID: {SERVER_ID}
        </span>
        <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Zap className="w-3 h-3 text-yellow-500/50" /> 
            Ping: {online ? '14ms' : '--'}
        </span>
      </div>
    </div>
  );
};

export default DiscordStatus;