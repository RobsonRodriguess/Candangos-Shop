import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Trophy, Swords, Skull, Gamepad2, Shield, Crown, ArrowLeft, 
  RotateCw, Lock, Medal, Clover, Ticket, Copy, Check
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import DailyRoulette from './DailyRoulette'; // Importando a Roleta

// --- CONFIGURAÇÃO SUPABASE ---
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function PlayerProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Controle de Navegação (Abas)
  const [view, setView] = useState<'card' | 'roulette' | 'coupons'>('card');
  const [myCoupons, setMyCoupons] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    // Se vier do botão "Sorte Diária" do menu, abre direto na roleta
    if (location.state && location.state.initialView) {
        setView(location.state.initialView);
    }
    fetchProfileData();
  }, [location]);

  async function fetchProfileData() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Acesso restrito. Faça login.");
      navigate('/');
      return;
    }
    setUser(user);

    const discordName = user.user_metadata.full_name || user.user_metadata.name;
    
    // 1. Busca Stats no Ranking
    const { data: rankData } = await supabase
      .from('ranking')
      .select('*')
      .ilike('player_name', discordName)
      .order('wins', { ascending: false })
      .limit(1)
      .maybeSingle();

    setStats(rankData || { rank_title: 'Recruta', wins: 0, kills: 0, matches: 0 });

    // 2. Busca Cupons
    fetchCoupons(user.id);
    
    setLoading(false);
  }

  async function fetchCoupons(userId: string) {
      const { data } = await supabase
        .from('user_coupons')
        .select('*')
        .eq('user_id', userId)
        .eq('is_used', false)
        .order('created_at', { ascending: false });
      setMyCoupons(data || []);
  }

  const handleCopyCoupon = (code: string) => {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success("Código copiado!");
      setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-t-4 border-green-500 border-r-4 border-r-transparent rounded-full animate-spin"></div>
        <p className="text-green-500 font-mono text-sm tracking-widest animate-pulse">CARREGANDO SISTEMA...</p>
    </div>
  );

  // Tema dinâmico
  const isLegend = stats.rank_title === 'Lenda Viva' || stats.wins > 20;
  const themeColor = isLegend ? 'yellow' : 'green';
  const themeHex = isLegend ? '#eab308' : '#22c55e';

  // Conquistas Automáticas
  const achievements = [
    { id: 1, name: "Primeiro Sangue", desc: "Fez a primeira Kill", icon: Skull, unlocked: stats.kills > 0 },
    { id: 2, name: "Vitorioso", desc: "Ganhou 1 Torneio", icon: Trophy, unlocked: stats.wins >= 1 },
    { id: 3, name: "Veterano", desc: "Jogou 10 partidas", icon: Gamepad2, unlocked: stats.matches >= 10 },
    { id: 4, name: "Assassino", desc: "Acumulou 50 Kills", icon: Swords, unlocked: stats.kills >= 50 },
    { id: 5, name: "Lenda Viva", desc: "Top Rank do Servidor", icon: Crown, unlocked: stats.rank_title === 'Lenda Viva' },
    { id: 6, name: "Imparável", desc: "10 Vitórias Totais", icon: Medal, unlocked: stats.wins >= 10 },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans overflow-hidden flex flex-col md:flex-row">
      
      {/* === SIDEBAR (NAVEGAÇÃO) === */}
      <div className="w-full md:w-72 bg-[#0e0e11] border-r border-white/5 flex flex-col z-20 shadow-2xl relative">
         {/* Botão Voltar */}
         <div className="p-6 pb-2">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors uppercase text-xs font-bold mb-6">
                <ArrowLeft size={16} /> Voltar à Loja
            </button>
         </div>

         {/* Resumo do Usuário */}
         <div className="flex flex-col items-center px-6 mb-8">
            <div className="relative">
                <img src={user.user_metadata.avatar_url} className={`w-24 h-24 rounded-full border-4 border-[#1a1a1a] shadow-xl mb-3 ring-2 ring-${themeColor}-500/50`} />
                {isLegend && <div className="absolute -top-4 right-0 bg-black/80 rounded-full p-1 border border-yellow-500"><Crown size={16} className="text-yellow-500"/></div>}
            </div>
            <h2 className="text-xl font-black text-white text-center leading-tight">{user.user_metadata.full_name}</h2>
            <div className="mt-2 px-3 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-gray-400">
                ID: {user.id.slice(0, 8)}
            </div>
         </div>

         {/* Menu */}
         <nav className="flex-1 px-4 space-y-2">
            <button onClick={() => setView('card')} className={`w-full p-4 rounded-xl flex items-center gap-4 text-sm font-bold uppercase transition-all ${view === 'card' ? `bg-${themeColor}-500/10 text-${themeColor}-400 border border-${themeColor}-500/20` : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}>
                <Shield size={20} /> Identidade
            </button>
            <button onClick={() => setView('roulette')} className={`w-full p-4 rounded-xl flex items-center gap-4 text-sm font-bold uppercase transition-all ${view === 'roulette' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}>
                <Clover size={20} /> Sorte Diária
            </button>
            <button onClick={() => setView('coupons')} className={`w-full p-4 rounded-xl flex items-center gap-4 text-sm font-bold uppercase transition-all ${view === 'coupons' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}>
                <Ticket size={20} /> Bolsa de Cupons
                {myCoupons.length > 0 && <span className="ml-auto bg-blue-500 text-black text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full">{myCoupons.length}</span>}
            </button>
         </nav>

         {/* Footer Sidebar */}
         <div className="p-6 text-center">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest">Candangos System v2.0</p>
         </div>
      </div>

      {/* === ÁREA DE CONTEÚDO (MAIN) === */}
      <div className="flex-1 relative flex items-center justify-center p-4 md:p-12 overflow-y-auto bg-[#050505]">
         {/* Background Effect */}
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
         <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-${view === 'roulette' ? 'purple' : themeColor}-500/10 blur-[120px] rounded-full pointer-events-none transition-colors duration-700`} />

         <AnimatePresence mode="wait">
             
             {/* --- VIEW 1: CARTÃO (FLIP CARD) --- */}
             {view === 'card' && (
                 <motion.div 
                    key="card"
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                    className="perspective-1000 w-full max-w-[400px] h-[620px]"
                 >
                     <motion.div 
                        className="relative w-full h-full preserve-3d"
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.8, type: "spring", stiffness: 60 }}
                        style={{ transformStyle: "preserve-3d" }}
                     >
                        {/* FRENTE */}
                        <div className="absolute inset-0 bg-[#0e0e11] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden backface-hidden flex flex-col" style={{ backfaceVisibility: 'hidden' }}>
                            <div className={`h-32 bg-gradient-to-b from-${themeColor}-900/40 to-[#0e0e11] relative`}>
                                <div className="absolute top-6 right-6 flex items-center gap-2"><div className={`w-2 h-2 rounded-full bg-${themeColor}-500 animate-pulse`}></div><span className={`text-[10px] font-bold uppercase text-${themeColor}-500`}>Agente Ativo</span></div>
                            </div>
                            <div className="px-8 -mt-16 flex flex-col items-center text-center relative z-10">
                                <img src={user.user_metadata.avatar_url} className={`w-32 h-32 rounded-[2rem] border-4 border-[#0e0e11] shadow-2xl mb-4 ring-2 ring-${themeColor}-500/30`} />
                                <h2 className="text-2xl font-black text-white tracking-tight">{user.user_metadata.full_name}</h2>
                                <div className={`mt-2 inline-flex items-center gap-2 px-4 py-1 rounded-full bg-${themeColor}-500/10 border border-${themeColor}-500/20 text-${themeColor}-400 text-xs font-bold uppercase tracking-widest`}>
                                    <Shield size={12} /> {stats.rank_title}
                                </div>

                                <div className="grid grid-cols-3 gap-3 w-full mt-8">
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5"><Trophy size={18} className={`text-${themeColor}-500 mx-auto mb-2`}/><span className="block text-lg font-black text-white">{stats.wins}</span><span className="text-[9px] uppercase text-gray-500 font-bold">Wins</span></div>
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5"><Skull size={18} className="text-red-500 mx-auto mb-2"/><span className="block text-lg font-black text-white">{stats.kills}</span><span className="text-[9px] uppercase text-gray-500 font-bold">Kills</span></div>
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5"><Gamepad2 size={18} className="text-blue-500 mx-auto mb-2"/><span className="block text-lg font-black text-white">{stats.matches}</span><span className="text-[9px] uppercase text-gray-500 font-bold">Jogos</span></div>
                                </div>
                            </div>
                            <div className="mt-auto p-8 flex justify-center"><button onClick={() => setIsFlipped(true)} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"><RotateCw size={14}/> Ver Medalhas</button></div>
                        </div>

                        {/* VERSO */}
                        <div className="absolute inset-0 bg-[#0e0e11] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden backface-hidden flex flex-col" style={{ backfaceVisibility: 'hidden', transform: "rotateY(180deg)" }}>
                            <div className="p-8 pb-4 border-b border-white/5 bg-black/20 flex justify-between items-center"><div className="text-left"><h3 className="text-lg font-black text-white uppercase">Conquistas</h3><p className="text-[10px] text-gray-500 font-mono">SALA DE TROFÉUS</p></div><Medal className={`text-${themeColor}-500`} size={24} /></div>
                            <div className="p-6 grid grid-cols-2 gap-3 overflow-y-auto custom-scrollbar">
                                {achievements.map(a => (
                                    <div key={a.id} className={`p-3 rounded-xl border flex flex-col items-center text-center gap-2 ${a.unlocked ? `bg-${themeColor}-500/5 border-${themeColor}-500/20` : 'bg-white/5 border-white/5 opacity-50 grayscale'}`}>
                                        {a.unlocked ? <a.icon size={18} className={`text-${themeColor}-400`}/> : <Lock size={18} className="text-gray-500"/>}
                                        <span className={`text-[10px] font-bold uppercase ${a.unlocked ? 'text-white' : 'text-gray-500'}`}>{a.name}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-auto p-6 bg-black/20 border-t border-white/5 space-y-4">
                                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden"><div className={`h-full bg-${themeColor}-500`} style={{ width: `${(achievements.filter(a => a.unlocked).length / achievements.length) * 100}%` }}></div></div>
                                <button onClick={() => setIsFlipped(false)} className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase flex justify-center gap-2 text-white transition-colors"><RotateCw className="-scale-x-100" size={14}/> Voltar</button>
                            </div>
                        </div>
                     </motion.div>
                 </motion.div>
             )}

             {/* --- VIEW 2: ROLETA --- */}
             {view === 'roulette' && (
                 <motion.div 
                    key="roulette"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                    className="w-full max-w-xl bg-[#0e0e11] border border-purple-500/20 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-2xl"
                 >
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_20px_#a855f7]"></div>
                     <div className="mb-8">
                        <h2 className="text-3xl font-black text-white uppercase mb-2 tracking-tight">Roleta da <span className="text-purple-400">Sorte</span></h2>
                        <p className="text-sm text-gray-400">Gire 1x por dia. Prêmios lendários aguardam.</p>
                     </div>
                     
                     <div className="flex justify-center">
                        <DailyRoulette userEmail={user.email} onSpinComplete={() => fetchCoupons(user.id)} />
                     </div>
                 </motion.div>
             )}

             {/* --- VIEW 3: CUPONS --- */}
             {view === 'coupons' && (
                 <motion.div 
                    key="coupons"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="w-full max-w-md space-y-6"
                 >
                     <div className="text-center mb-8">
                        <h2 className="text-3xl font-black text-white uppercase mb-2">Meus Cupons</h2>
                        <p className="text-sm text-gray-400">Use no checkout para ganhar descontos.</p>
                     </div>

                     {myCoupons.length === 0 ? (
                         <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
                             <Ticket size={48} className="text-gray-600 mb-4 opacity-50" />
                             <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Nenhum cupom ativo</p>
                             <button onClick={() => setView('roulette')} className="mt-4 text-xs text-blue-400 hover:text-blue-300 underline underline-offset-4">Tentar a sorte na roleta</button>
                         </div>
                     ) : (
                         <div className="space-y-4">
                             {myCoupons.map((coupon) => (
                                 <div key={coupon.id} className="relative group bg-[#0e0e11] border border-blue-500/30 p-5 rounded-2xl flex justify-between items-center shadow-lg hover:border-blue-500/60 transition-all">
                                     <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#050505] rounded-full border-r border-blue-500/30"></div>
                                     <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#050505] rounded-full border-l border-blue-500/30"></div>
                                     
                                     <div>
                                         <span className="block text-3xl font-black text-white tracking-tighter">{coupon.discount_percent}% OFF</span>
                                         <span className="text-[10px] uppercase text-blue-400 font-bold tracking-widest bg-blue-500/10 px-2 py-0.5 rounded">Cupom Raro</span>
                                     </div>

                                     <button 
                                        onClick={() => handleCopyCoupon(coupon.code)}
                                        className="flex flex-col items-end gap-1 group-hover:scale-105 transition-transform"
                                     >
                                         <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-lg border border-white/10 font-mono text-sm text-gray-300 group-hover:text-white group-hover:border-blue-500 transition-colors">
                                             {coupon.code}
                                             {copiedCode === coupon.code ? <Check size={14} className="text-green-400"/> : <Copy size={14}/>}
                                         </div>
                                         <span className="text-[9px] text-gray-600 uppercase font-bold tracking-wider">{copiedCode === coupon.code ? 'Copiado!' : 'Clique para copiar'}</span>
                                     </button>
                                 </div>
                             ))}
                         </div>
                     )}
                 </motion.div>
             )}

         </AnimatePresence>
      </div>
    </div>
  );
}