import { useEffect, useState } from 'react';
import { Users, Crown, Loader2, Trophy, ShoppingBag, Star, Zap } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vrlswaqvswzcapbzshcp.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZybHN3YXF2c3d6Y2FwYnpzaGNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0ODI1NjYsImV4cCI6MjA4NTA1ODU2Nn0.YooTRks2-zy4hqAIpSQmhDpTCf134QHrzl7Ry5TbKn8'
);

const Sidebar = () => {
  const [memberCount, setMemberCount] = useState<number>(0);
  const [members, setMembers] = useState<any[]>([]);
  const [inviteLink, setInviteLink] = useState<string>("#"); // Link do convite dinâmico
  const [loadingSupporters, setLoadingSupporters] = useState(true);
  const [topSupporters, setTopSupporters] = useState<any[]>([]);

  useEffect(() => {
    const fetchDiscord = async () => {
      try {
        const res = await fetch(`https://discord.com/api/guilds/1461132354096726171/widget.json`);
        const data = await res.json();
        
        if (data) {
            setMemberCount(data.presence_count || 0);
            setMembers(data.members?.slice(0, 5) || []);
            setInviteLink(data.instant_invite || "https://discord.gg/Hcu7y4Cz"); // Fallback se a API não der link
        }
      } catch (e) { console.error(e); }
    };

    const fetchSupporters = async () => {
      try {
        setLoadingSupporters(true);
        const { data, error } = await supabase
          .from('orders')
          .select('discord_username, items, status')
          .eq('status', 'approved');

        if (error) throw error;

        const stats = data.reduce((acc: any, order: any) => {
          const name = order.discord_username || "Guerreiro";
          const count = Array.isArray(order.items) ? order.items.length : 1;

          if (!acc[name]) {
            acc[name] = { name, total: 0 };
          }
          acc[name].total += count;
          return acc;
        }, {});

        const sorted = Object.values(stats)
          .sort((a: any, b: any) => b.total - a.total)
          .slice(0, 3);

        setTopSupporters(sorted);
      } catch (err) { console.error(err); } finally { setLoadingSupporters(false); }
    };

    fetchDiscord();
    fetchSupporters();

    const channel = supabase.channel('sidebar_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchSupporters())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="space-y-8">
      
      {/* --- CARD DISCORD (DESIGN MEMBROS) --- */}
      <div className="bg-[#000000] rounded-[2rem] p-6 shadow-2xl relative overflow-hidden border border-white/5 flex flex-col justify-between min-h-[220px]">
        
        {/* Header: Ícone + Título + Status */}
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#1e2030] rounded-2xl flex items-center justify-center">
                 <Users className="w-6 h-6 text-[#5865F2]" />
              </div>
              <h3 className="font-display font-bold text-white tracking-widest text-sm bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                 MEMBROS
              </h3>
           </div>
           
           <div className="bg-[#111315] px-3 py-1.5 rounded-full border border-white/5">
              <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                 {memberCount} ONLINE
              </span>
           </div>
        </div>

        {/* Lista de Avatares (Sobrepostos) */}
        <div className="flex -space-x-3 mb-8 pl-2">
           {members.length > 0 ? members.map((m, i) => (
             <div key={i} className="relative group cursor-pointer transition-transform hover:-translate-y-1">
                <img 
                  src={m.avatar_url} 
                  className="w-10 h-10 rounded-full border-[3px] border-[#000000] object-cover bg-[#2b2d31]" 
                  alt={m.username} 
                  title={m.username}
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full" />
             </div>
           )) : (
             // Placeholder se a API demorar
             [1,2,3,4,5].map((_, i) => (
               <div key={i} className="w-10 h-10 rounded-full border-[3px] border-[#000000] bg-[#1e2030] animate-pulse" />
             ))
           )}
        </div>

        {/* Botão Roxo Grande */}
        <a 
          href={inviteLink}
          target="_blank"
          rel="noreferrer"
          className="w-full py-4 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-[#5865F2]/20 flex items-center justify-center gap-2 mt-auto"
        >
          Entrar no Discord
        </a>

      </div>

      {/* --- CARD RANKING (MANTIDO IGUAL) --- */}
      <div className="bg-gradient-to-b from-[#0a0a0a] to-[#050505] border border-white/5 rounded-[2.5rem] p-7 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-6">
          <Trophy className="w-7 h-7 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
          <h3 className="font-black text-white uppercase tracking-tighter text-xl">Top Apoiadores</h3>
        </div>

        <div className="space-y-5">
          {loadingSupporters ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-yellow-500/20 w-8 h-8" /></div>
          ) : topSupporters.map((user, i) => (
            <div key={i} className={`relative flex items-center gap-5 p-6 rounded-[2rem] border transition-all ${i === 0 ? 'bg-yellow-500/[0.03] border-yellow-500/20' : 'bg-white/[0.02] border-white/5'}`}>
              
              {/* EFEITO CHUVA DE OURO (APENAS PARA O TOP 1) */}
              {i === 0 && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2rem]">
                  {[...Array(10)].map((_, index) => (
                    <Star 
                      key={index} 
                      className="gold-particle absolute text-yellow-500/30 w-2 h-2 fill-yellow-500" 
                      style={{ 
                        left: `${Math.random() * 100}%`, 
                        top: `-10px`,
                        animationDelay: `${Math.random() * 2.5}s`,
                        animationDuration: `${2 + Math.random()}s`
                      }} 
                    />
                  ))}
                </div>
              )}

              {/* ÍCONE DE RANKING */}
              <div className={`relative shrink-0 w-16 h-16 rounded-3xl flex items-center justify-center border-2 ${i === 0 ? 'bg-yellow-500/10 border-yellow-500/40' : 'bg-white/5 border-white/10'}`}>
                {i === 0 ? <Crown className="w-9 h-9 text-yellow-500 fill-yellow-500 animate-pulse" /> : <Trophy className={`w-8 h-8 ${i === 1 ? 'text-slate-300' : 'text-orange-600'}`} />}
                <div className="absolute -bottom-2 bg-black border border-white/10 rounded-lg px-2 py-0.5 text-[10px] font-black text-white">#{i + 1}</div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {i === 0 && <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />}
                  <p className="text-base text-white font-black truncate uppercase tracking-tight leading-none drop-shadow-sm">
                    {user.name}
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-white/5 w-fit px-3 py-1.5 rounded-xl border border-white/5">
                  <ShoppingBag className="w-3.5 h-3.5 text-yellow-500/70" />
                  <span className="text-[10px] font-black text-white/70 uppercase tracking-tighter">
                    {user.total} Produtos
                  </span>
                </div>
              </div>
            </div>
          ))}

          {!loadingSupporters && topSupporters.length === 0 && (
            <div className="text-center py-10 opacity-20 italic text-xs uppercase font-bold">Aguardando lendas...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;