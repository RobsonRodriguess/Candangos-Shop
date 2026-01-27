import { useEffect, useState } from 'react';
import { Users, Crown, Loader2, Gamepad2, MessageSquare } from 'lucide-react';

// --- ÁREA DE EDIÇÃO DOS COMPRADORES ---
// Adicione aqui os 3 compradores reais.
// Se não souber o discord, pode deixar como null ou string vazia "".
const topBuyers = [
  { 
    ign: "Bizuca",             // Nick no Jogo (In-Game Name)
    discord: "@bizuca_god",    // Nick do Discord (Opcional)
    rank: "VIP Supremo",       // Qual VIP comprou
    avatar: "https://mc-heads.net/avatar/MHF_Steve/24" // Avatar (pode trocar MHF_Steve pelo nick exato da pessoa pra pegar a skin dela)
  },
  { 
    ign: "SrKaio", 
    discord: "@kai_00", 
    rank: "VIP Apoiador", 
    avatar: "https://mc-heads.net/avatar/MHF_Alex/24" 
  },
  { 
    ign: "JoaoGamer", 
    discord: null,             // Exemplo sem discord
    rank: "VIP Aventureiro", 
    avatar: "https://mc-heads.net/avatar/MHF_Herobrine/24" 
  },
];
// --------------------------------------

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online': return 'bg-green-500';
    case 'idle': return 'bg-yellow-500';
    case 'dnd': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const Sidebar = () => {
  const [memberCount, setMemberCount] = useState<number>(0);
  const [members, setMembers] = useState<any[]>([]);
  const [inviteLink, setInviteLink] = useState<string>("#");
  const [loading, setLoading] = useState<boolean>(true);

  // Seu ID do Discord
  const SERVER_ID = '1461132354096726171';

  useEffect(() => {
    const fetchDiscord = async () => {
      try {
        const response = await fetch(`https://discord.com/api/guilds/${SERVER_ID}/widget.json`);
        const data = await response.json();
        
        setMemberCount(data.presence_count || 0);
        setInviteLink(data.instant_invite || "#");
        setMembers(data.members ? data.members.slice(0, 5) : []);
      } catch (error) {
        console.error("Erro ao carregar Discord", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscord();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Widget do Discord */}
      <div className="rpg-card border border-white/10 bg-black/40 backdrop-blur-md rounded-xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-[#5865F2]" />
          <h3 className="text-lg font-display font-bold text-white">Discord</h3>
        </div>
        
        <p className="text-sm text-gray-400 mb-3">
          <span className="text-[#5865F2] font-bold">{memberCount}</span> membros online
        </p>

        {loading ? (
           <div className="flex justify-center py-4"><Loader2 className="animate-spin text-gray-500"/></div>
        ) : (
          <div className="space-y-2">
            {members.map((member, index) => (
              <div key={index} className="flex items-center gap-2 py-1">
                <div className="relative">
                  <img src={member.avatar_url} alt={member.username} className="w-6 h-6 rounded-full" />
                  <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#151922] ${getStatusColor(member.status)}`} />
                </div>
                <span className="text-sm text-gray-300 truncate w-32">{member.username}</span>
              </div>
            ))}
          </div>
        )}

        <a 
          href={inviteLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block mt-4 w-full text-center py-2 rounded bg-[#5865F2] text-white font-bold text-sm hover:bg-[#4752C4] transition-all hover:scale-105 shadow-lg shadow-indigo-900/50"
        >
          ENTRAR NO DISCORD
        </a>
      </div>

      {/* Widget Top Compradores (Editado) */}
      <div className="rpg-card border border-white/10 bg-black/40 backdrop-blur-md rounded-xl p-5 shadow-xl relative overflow-hidden">
        {/* Efeito de brilho no fundo */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

        <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2 relative z-10">
          <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <h3 className="text-lg font-display font-bold text-white">Top Apoiadores</h3>
        </div>

        <div className="space-y-4 relative z-10">
          {topBuyers.map((buyer, index) => (
            <div key={index} className="flex items-start gap-3 group bg-white/5 p-2 rounded-lg border border-transparent hover:border-yellow-500/30 transition-all">
              
              {/* Ícone de Rank #1, #2... */}
              <div className={`flex flex-col items-center justify-center w-6 pt-1 ${index === 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
                <span className="text-sm font-bold">{index + 1}º</span>
                {index === 0 && <Crown className="w-3 h-3 mt-1 animate-pulse" />}
              </div>

              {/* Avatar (Pega a cabeça do boneco) */}
              <img 
                src={buyer.avatar} 
                alt={buyer.ign}
                className={`w-10 h-10 rounded border-2 ${index === 0 ? 'border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]' : 'border-white/10'}`}
              />

              <div className="flex-1 min-w-0">
                {/* Nick do Jogo */}
                <div className="flex items-center gap-1.5">
                    <Gamepad2 className="w-3 h-3 text-cyan-400" />
                    <span className="text-sm text-white font-bold truncate">{buyer.ign}</span>
                </div>

                {/* Nick do Discord (Só mostra se tiver) */}
                {buyer.discord && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <MessageSquare className="w-3 h-3 text-[#5865F2]" />
                        <span className="text-xs text-gray-400 truncate">{buyer.discord}</span>
                    </div>
                )}
                
                {/* Nome do VIP comprado */}
                <div className="mt-1.5 inline-block">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-yellow-600/20 to-yellow-900/20 border border-yellow-500/30 text-yellow-200 px-2 py-0.5 rounded">
                        {buyer.rank}
                    </span>
                </div>
              </div>
            </div>
          ))}

          {topBuyers.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-4">Seja o primeiro a apoiar!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;