import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, Swords, Skull, Gamepad2, Calendar, 
  Shield, Hash, Crown, ArrowLeft, Share2, 
  RotateCw, Lock, Medal
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// --- CONFIGURAÇÃO SUPABASE ---
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function PlayerProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  async function fetchProfileData() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Acesso restrito. Faça login.");
      navigate('/');
      return;
    }
    setUser(user);

    const discordName = user.user_metadata.full_name || user.user_metadata.name;
    
    // Busca stats no Ranking (Global ou Semanal, pega o melhor registro)
    const { data: rankData } = await supabase
      .from('ranking')
      .select('*')
      .ilike('player_name', discordName)
      .order('wins', { ascending: false })
      .limit(1)
      .maybeSingle();

    setStats(rankData || { rank_title: 'Recruta', wins: 0, kills: 0, matches: 0 });
    setLoading(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-6">
        <div className="relative">
            <div className="w-20 h-20 border-t-4 border-b-4 border-yellow-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 border-r-4 border-l-4 border-green-500/30 rounded-full animate-spin-slow"></div>
        </div>
        <p className="text-gray-500 font-mono text-sm tracking-[0.3em] animate-pulse">CARREGANDO PERFIL...</p>
    </div>
  );

  // Tema dinâmico
  const isLegend = stats.rank_title === 'Lenda Viva' || stats.wins > 20;
  const themeColor = isLegend ? 'yellow' : 'green';
  const themeHex = isLegend ? '#eab308' : '#22c55e';

  // --- SISTEMA DE CONQUISTAS (Automático baseado nos stats) ---
  const achievements = [
    { id: 1, name: "Primeiro Sangue", desc: "Fez a primeira Kill", icon: Skull, unlocked: stats.kills > 0 },
    { id: 2, name: "Vitorioso", desc: "Ganhou 1 Torneio", icon: Trophy, unlocked: stats.wins >= 1 },
    { id: 3, name: "Veterano", desc: "Jogou 10 partidas", icon: Gamepad2, unlocked: stats.matches >= 10 },
    { id: 4, name: "Assassino", desc: "Acumulou 50 Kills", icon: Swords, unlocked: stats.kills >= 50 },
    { id: 5, name: "Lenda Viva", desc: "Top Rank do Servidor", icon: Crown, unlocked: stats.rank_title === 'Lenda Viva' },
    { id: 6, name: "Imparável", desc: "10 Vitórias Totais", icon: Medal, unlocked: stats.wins >= 10 },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans relative overflow-hidden flex items-center justify-center p-4 perspective-1000">
      
      {/* Background Cinematográfico */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-${themeColor}-500/10 blur-[150px] rounded-full pointer-events-none animate-pulse-slow`} />

      {/* Botão Voltar Fixo */}
      <button onClick={() => navigate('/')} className="absolute top-8 left-8 flex items-center gap-3 text-gray-500 hover:text-white transition-colors z-50 group">
        <div className="p-2 bg-white/5 rounded-full group-hover:bg-white/10 border border-white/10"><ArrowLeft size={20} /></div>
        <span className="text-xs font-bold uppercase tracking-widest">Voltar à Base</span>
      </button>

      {/* --- O CARTÃO (CONTAINER 3D) --- */}
      <motion.div 
        className="relative w-full max-w-[420px] h-[650px] preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 60 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        
        {/* ======================= */}
        {/* LADO DA FRENTE (STATUS) */}
        {/* ======================= */}
        <div 
            className="absolute inset-0 w-full h-full bg-[#0e0e11] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl backface-hidden flex flex-col"
            style={{ backfaceVisibility: 'hidden' }}
        >
            {/* Header Visual */}
            <div className="h-40 relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-b from-${themeColor}-900/40 to-[#0e0e11] z-0`}></div>
                {/* Linhas animadas */}
                <div className={`absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20`}></div>
                
                <div className="absolute top-6 right-6 z-20">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-${themeColor}-500/30 backdrop-blur-md`}>
                        <div className={`w-2 h-2 rounded-full bg-${themeColor}-500 animate-pulse`}></div>
                        <span className={`text-[10px] font-bold uppercase text-${themeColor}-400 tracking-widest`}>Agente Ativo</span>
                    </div>
                </div>
            </div>

            {/* Avatar & Identidade */}
            <div className="relative px-8 -mt-20 flex flex-col items-center text-center z-10">
                <div className="relative group cursor-pointer" onClick={() => setIsFlipped(true)}>
                    <div className={`absolute inset-0 bg-${themeColor}-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full`}></div>
                    <img 
                        src={user.user_metadata.avatar_url} 
                        alt="Avatar" 
                        className={`relative w-36 h-36 rounded-[2rem] object-cover border-4 border-[#0e0e11] shadow-2xl z-10 ring-2 ring-${themeColor}-500/30 group-hover:scale-105 transition-transform duration-300`}
                    />
                    {isLegend && <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20"><Crown size={40} className="text-yellow-500 drop-shadow-lg animate-bounce-slow" /></div>}
                    
                    {/* Dica para virar */}
                    <div className="absolute bottom-2 right-2 z-20 bg-black/60 p-1.5 rounded-full border border-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <RotateCw size={14} className="text-white" />
                    </div>
                </div>

                <div className="mt-6 mb-2">
                    <h2 className="text-3xl font-black text-white tracking-tight">{user.user_metadata.full_name}</h2>
                    <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">ID: {user.id.slice(0, 8)}</p>
                </div>

                <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-${themeColor}-500/10 border border-${themeColor}-500/20 text-${themeColor}-400 text-sm font-black uppercase tracking-widest mb-8`}>
                    <Shield size={14} /> {stats.rank_title}
                </div>

                {/* Grid de Status */}
                <div className="w-full grid grid-cols-3 gap-3">
                    <div className="bg-white/5 border border-white/5 p-3 rounded-2xl flex flex-col items-center">
                        <Trophy size={18} className={`text-${themeColor}-500 mb-2`} />
                        <span className="text-xl font-black text-white">{stats.wins}</span>
                        <span className="text-[9px] font-bold text-gray-500 uppercase">Vitórias</span>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-3 rounded-2xl flex flex-col items-center">
                        <Skull size={18} className="text-red-500 mb-2" />
                        <span className="text-xl font-black text-white">{stats.kills}</span>
                        <span className="text-[9px] font-bold text-gray-500 uppercase">Kills</span>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-3 rounded-2xl flex flex-col items-center">
                        <Gamepad2 size={18} className="text-blue-500 mb-2" />
                        <span className="text-xl font-black text-white">{stats.matches}</span>
                        <span className="text-[9px] font-bold text-gray-500 uppercase">Jogos</span>
                    </div>
                </div>
            </div>

            {/* Footer Frente */}
            <div className="mt-auto p-6 flex justify-center pb-8">
                <button 
                    onClick={() => setIsFlipped(true)}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors animate-pulse"
                >
                    Ver Medalhas <RotateCw size={14} />
                </button>
            </div>
        </div>

        {/* ======================= */}
        {/* LADO DO VERSO (MEDALHAS) */}
        {/* ======================= */}
        <div 
            className="absolute inset-0 w-full h-full bg-[#0e0e11] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl backface-hidden flex flex-col"
            style={{ backfaceVisibility: 'hidden', transform: "rotateY(180deg)" }}
        >
             {/* Header Verso */}
             <div className="p-8 pb-4 border-b border-white/5 bg-black/20">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-wide">Sala de Troféus</h3>
                        <p className="text-[10px] text-gray-500 font-mono mt-1">CONQUISTAS DESBLOQUEADAS</p>
                    </div>
                    <Medal className={`text-${themeColor}-500`} size={28} />
                </div>
             </div>

             {/* Grid de Medalhas */}
             <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                    {achievements.map((item) => (
                        <div 
                            key={item.id} 
                            className={`
                                relative p-4 rounded-2xl border flex flex-col items-center text-center gap-3 transition-all duration-300
                                ${item.unlocked 
                                    ? `bg-${themeColor}-500/5 border-${themeColor}-500/30 shadow-[0_0_15px_-5px_${themeHex}40]` 
                                    : 'bg-white/5 border-white/5 opacity-50 grayscale'}
                            `}
                        >
                            <div className={`p-3 rounded-full ${item.unlocked ? `bg-${themeColor}-500/20 text-${themeColor}-400` : 'bg-black/40 text-gray-600'}`}>
                                {item.unlocked ? <item.icon size={20} /> : <Lock size={20} />}
                            </div>
                            
                            <div>
                                <h4 className={`text-xs font-bold uppercase ${item.unlocked ? 'text-white' : 'text-gray-500'}`}>{item.name}</h4>
                                <p className="text-[9px] text-gray-500 mt-1 leading-tight">{item.desc}</p>
                            </div>

                            {item.unlocked && (
                                <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-${themeColor}-500 shadow-[0_0_5px_${themeHex}]`}></div>
                            )}
                        </div>
                    ))}
                </div>
             </div>

             {/* Footer Verso */}
             <div className="p-6 pt-4 border-t border-white/5 flex flex-col gap-3 bg-black/20">
                <div className="flex items-center justify-between text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                    <span>Progresso</span>
                    <span>{achievements.filter(a => a.unlocked).length} / {achievements.length}</span>
                </div>
                {/* Barra de Progresso */}
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(achievements.filter(a => a.unlocked).length / achievements.length) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full bg-${themeColor}-500 shadow-[0_0_10px_${themeHex}]`}
                    />
                </div>

                <button 
                    onClick={() => setIsFlipped(false)}
                    className="mt-4 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2"
                >
                    <RotateCw size={14} className="-scale-x-100" /> Voltar para o Perfil
                </button>
             </div>
        </div>

      </motion.div>
    </div>
  );
}