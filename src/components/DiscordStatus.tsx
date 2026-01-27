import { useEffect, useState } from 'react';
import { MessageCircle, Users } from 'lucide-react'; // Ícones

const DiscordStatus = () => {
  const [memberCount, setMemberCount] = useState<string>("...");
  const [inviteLink, setInviteLink] = useState<string>("#");
  const [serverName, setServerName] = useState<string>("Discord");

  // O ID que você mandou
  const SERVER_ID = '1461132354096726171'; 

  useEffect(() => {
    // Busca os dados assim que o componente carrega
    const fetchDiscordData = async () => {
      try {
        const response = await fetch(`https://discord.com/api/guilds/${SERVER_ID}/widget.json`);
        const data = await response.json();
        
        if (data) {
          setMemberCount(data.presence_count);
          setInviteLink(data.instant_invite || "#"); // Fallback se não tiver convite
          setServerName(data.name);
        }
      } catch (error) {
        console.error("Erro ao carregar Discord:", error);
        setMemberCount("OFF");
      }
    };

    fetchDiscordData();
  }, []);

  return (
    <a 
      href={inviteLink} 
      target="_blank" 
      rel="noreferrer"
      className="group block w-full bg-[#5865F2] hover:bg-[#4752c4] rounded-xl p-4 text-center shadow-lg transition-all duration-300 transform hover:-translate-y-1 no-underline cursor-pointer"
    >
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition-colors">
            <MessageCircle className="w-6 h-6 text-white" />
        </div>
        
        <h3 className="text-white font-bold text-lg leading-tight">
          COMUNIDADE
        </h3>
        
        <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full mt-1">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
          <p className="text-white font-mono font-bold text-sm">
            {memberCount} Online
          </p>
        </div>
        
        <p className="text-white/70 text-xs mt-2 group-hover:text-white transition-colors">
          Clique para entrar
        </p>
      </div>
    </a>
  );
};

export default DiscordStatus;