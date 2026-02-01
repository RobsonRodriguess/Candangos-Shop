import { useEffect, useState } from 'react';
import { Trophy, Swords, Skull, Gamepad2, Calendar, Globe, Crown, ArrowLeft, Sparkles, Flame } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';

// --- CONFIGURAÇÃO SUPABASE ---
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// --- EFEITO DE PARTÍCULAS ---
const ParticleEffect = ({ color }: { color: string }) => {
  const particles = Array.from({ length: 12 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-1 h-1 rounded-full bg-${color}-400`}
          initial={{ x: Math.random() * 100 + "%", y: "110%", opacity: 0, scale: 0 }}
          animate={{ 
            y: "-10%", 
            opacity: [0, 0.8, 0],
            scale: [0, 1.5, 0]
          }}
          transition={{ 
            duration: 2 + Math.random() * 3, 
            repeat: Infinity, 
            delay: Math.random() * 2,
            ease: "easeOut" 
          }}
        />
      ))}
    </div>
  );
};

// --- CONTADOR ANIMADO ---
const CountUp = ({ value }: { value: number }) => (
  <motion.span
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    key={value}
  >
    {value}
  </motion.span>
);

export default function HallOfFame() {
  const [activeTab, setActiveTab] = useState<'global' | 'weekly'>('global');
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('ranking')
          .select('*')
          .eq('category', activeTab)
          .order('wins', { ascending: false })
          .order('kills', { ascending: false });
          
        if (error) throw error;
        if (data) setLeaders(data);
      } catch (error) {
        console.error("Erro ao carregar ranking:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRanking();
  }, [activeTab]);

  // Tema Dinâmico
  const theme = activeTab === 'global' 
    ? { color: 'yellow', hex: '#eab308', shadow: 'shadow-yellow-500/30', border: 'border-yellow-500/50' } 
    : { color: 'green', hex: '#22c55e', shadow: 'shadow-green-500/30', border: 'border-green-500/50' };

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans overflow-x-hidden relative selection:bg-yellow-500/30">
      
      {/* --- BACKGROUND INDUSTRIAL --- */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
         <div className={`absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80vw] h-[500px] bg-${theme.color}-500/10 blur-[120px] transition-colors duration-1000`}></div>
      </div>

      <div className="relative z-10 container mx-auto max-w-6xl px-4 pb-20">
        
        {/* --- NAVBAR (SAFE ZONE AUMENTADA) --- */}
        {/* Mudei de pt-10 para pt-20 para descer mais */}
        <nav className="pt-20 pb-6 mb-8 flex items-center justify-start">
            <a href="/" className="group flex items-center gap-2 pl-2 pr-4 py-2 rounded-full bg-black/40 border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all backdrop-blur-md">
                <div className="p-1.5 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                    <ArrowLeft size={16} className="text-gray-300 group-hover:-translate-x-0.5 transition-transform" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-white">Voltar</span>
            </a>
            {/* SYSTEM ONLINE REMOVIDO DAQUI */}
        </nav>

        {/* --- HEADER --- */}
        <header className="text-center mb-16">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="inline-block relative"
            >
                <div className={`absolute inset-0 bg-${theme.color}-500/20 blur-xl rounded-full`}></div>
                <h1 className="relative text-5xl md:text-7xl font-display font-black tracking-tighter uppercase mb-6 drop-shadow-2xl">
                  HALL das <span className={`text-transparent bg-clip-text bg-gradient-to-r from-${theme.color}-400 to-${theme.color}-600`}>Lendas</span>
                </h1>
            </motion.div>

            {/* Switch de Abas */}
            <div className="flex justify-center">
                <div className="inline-flex p-1 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md">
                    {[
                      { id: 'global', label: 'Global', icon: Globe },
                      { id: 'weekly', label: 'Torneio', icon: Calendar }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`relative px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide flex items-center gap-2 transition-all ${
                                activeTab === tab.id ? 'text-black' : 'text-gray-500 hover:text-white'
                            }`}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTabBg"
                                    className={`absolute inset-0 rounded-lg bg-${tab.id === 'global' ? 'yellow-500' : 'green-500'} shadow-[0_0_20px_${tab.id === 'global' ? 'rgba(234,179,8,0.4)' : 'rgba(34,197,94,0.4)'}]`}
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <tab.icon size={14} className="relative z-10" />
                            <span className="relative z-10">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </header>

        {/* --- LOADING & CONTEÚDO --- */}
        {loading ? (
            <div className="h-[400px] flex flex-col items-center justify-center gap-4">
                <div className="relative">
                    <div className={`w-16 h-16 border-4 border-transparent border-t-${theme.color}-500 rounded-full animate-spin`}></div>
                    <div className={`absolute inset-0 w-16 h-16 border-4 border-white/10 rounded-full`}></div>
                </div>
                <p className="text-xs font-mono text-gray-500 uppercase tracking-widest animate-pulse">Sincronizando...</p>
            </div>
        ) : (
            <AnimatePresence mode="wait">
                <motion.div 
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {leaders.length > 0 ? (
                        <>
                            {/* --- PODIUM (TOP 3) --- */}
                            <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8 mb-20 px-2 min-h-[550px]">
                                {leaders.slice(0, 3).map((player, idx) => {
                                    const isFirst = idx === 0;
                                    const visualOrder = isFirst ? 'order-1 md:order-2 z-20' : idx === 1 ? 'order-2 md:order-1 z-10' : 'order-3 z-10';
                                    
                                    const rankColor = isFirst ? theme.color : idx === 1 ? 'gray' : 'orange';
                                    const borderColor = isFirst ? theme.border : 'border-white/10';
                                    const heightClass = isFirst ? 'h-[500px] w-full md:w-[340px]' : 'h-[400px] w-full md:w-[280px]';

                                    return (
                                        <div key={player.id} className={`relative ${heightClass} ${visualOrder} group perspective-1000`}>
                                            
                                            {/* Coroa Flutuante (Top 1) */}
                                            {isFirst && (
                                                <motion.div 
                                                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                                                    transition={{ delay: 0.5, type: 'spring' }}
                                                    className="absolute -top-16 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center"
                                                >
                                                    <Crown size={48} className={`text-${theme.color}-500 drop-shadow-[0_0_15px_${theme.hex}] animate-bounce-slow`} />
                                                </motion.div>
                                            )}

                                            {/* Badge de Posição */}
                                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-30">
                                                <div className={`
                                                    w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl border-4 border-[#09090b] shadow-xl transform transition-transform group-hover:scale-110
                                                    ${isFirst ? `bg-${theme.color}-500 text-black` : idx === 1 ? 'bg-gray-300 text-gray-900' : 'bg-orange-600 text-white'}
                                                `}>
                                                    {idx + 1}
                                                </div>
                                            </div>

                                            {/* CARD PRINCIPAL */}
                                            <div className={`
                                                w-full h-full bg-[#0e0e11] border-2 ${borderColor} rounded-[2rem] overflow-hidden flex flex-col relative
                                                transition-all duration-300 group-hover:-translate-y-2 ${isFirst ? theme.shadow : 'shadow-lg'}
                                            `}>
                                                {/* Efeitos Especiais (Top 1) */}
                                                {isFirst && (
                                                    <>
                                                        <ParticleEffect color={theme.color} />
                                                        <motion.div
                                                            animate={{ x: ['-100%', '200%'] }}
                                                            transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                                                            className={`absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-${theme.color}-400/10 to-transparent -skew-x-12 pointer-events-none z-0`}
                                                        />
                                                        <div className={`absolute inset-0 bg-gradient-to-b from-${theme.color}-500/10 to-transparent opacity-60 z-0`}></div>
                                                    </>
                                                )}

                                                <div className="relative z-10 flex flex-col items-center h-full p-6 pt-12">
                                                    
                                                    {/* Avatar */}
                                                    <div className="relative mb-6">
                                                        <div className={`absolute inset-0 rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 bg-${rankColor}-500`}></div>
                                                        <img 
                                                            src={player.player_avatar || "https://cdn.discordapp.com/embed/avatars/0.png"} 
                                                            className={`relative w-28 h-28 rounded-3xl object-cover border-4 border-[#09090b] shadow-2xl ${isFirst ? '' : 'grayscale group-hover:grayscale-0 transition-all'}`}
                                                            alt={player.player_name}
                                                        />
                                                    </div>

                                                    {/* Infos */}
                                                    <div className="text-center mb-auto w-full">
                                                        <h3 className={`font-black text-white truncate mb-2 drop-shadow-md ${isFirst ? 'text-4xl' : 'text-2xl'}`}>
                                                            {player.player_name}
                                                        </h3>
                                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border border-white/5 bg-white/5 ${isFirst ? `text-${theme.color}-400` : 'text-gray-500'}`}>
                                                            {player.rank_title || 'Guerreiro'}
                                                        </div>
                                                    </div>

                                                    {/* Stats Box */}
                                                    <div className="w-full grid gap-2 mt-4">
                                                        <div className={`bg-white/5 border border-white/10 p-3 rounded-xl flex items-center justify-between ${isFirst ? `bg-${theme.color}-500/10 border-${theme.color}-500/20` : ''}`}>
                                                            <div className="flex items-center gap-2">
                                                                <Trophy size={16} className={isFirst ? `text-${theme.color}-500` : 'text-gray-400'} />
                                                                <span className="text-xs font-bold uppercase text-gray-300">Vitórias</span>
                                                            </div>
                                                            <span className="text-2xl font-display font-black text-white"><CountUp value={player.wins} /></span>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="bg-black/30 border border-white/5 p-2 rounded-lg text-center">
                                                                <span className="text-[9px] font-bold uppercase text-red-500 block mb-0.5">Kills</span>
                                                                <span className="text-sm font-mono font-bold text-gray-300">{player.kills}</span>
                                                            </div>
                                                            <div className="bg-black/30 border border-white/5 p-2 rounded-lg text-center">
                                                                <span className="text-[9px] font-bold uppercase text-blue-500 block mb-0.5">Jogos</span>
                                                                <span className="text-sm font-mono font-bold text-gray-300">{player.matches}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* --- LISTA TOP 4+ --- */}
                            {leaders.length > 3 && (
                                <div className="max-w-4xl mx-auto">
                                    <div className="flex items-center gap-4 mb-6 opacity-40 px-4">
                                        <div className="h-px flex-1 bg-white"></div>
                                        <span className="text-xs font-bold uppercase tracking-[0.2em]">Restante do Pelotão</span>
                                        <div className="h-px flex-1 bg-white"></div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        {leaders.slice(3).map((player, idx) => (
                                            <motion.div 
                                                key={player.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 * idx }}
                                                whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.03)' }}
                                                className="group flex items-center gap-4 p-3 rounded-xl bg-[#0e0e11] border border-white/5 hover:border-white/10 transition-all"
                                            >
                                                <span className="font-mono text-gray-600 font-bold w-8 text-center">#{idx + 4}</span>
                                                <img 
                                                    src={player.player_avatar || "https://cdn.discordapp.com/embed/avatars/0.png"} 
                                                    className="w-10 h-10 rounded-lg object-cover grayscale group-hover:grayscale-0 transition-all"
                                                    alt=""
                                                />
                                                <div className="flex-1">
                                                    <h4 className={`text-sm font-bold text-white group-hover:text-${theme.color}-400 transition-colors`}>{player.player_name}</h4>
                                                    <span className="text-[10px] text-gray-500 uppercase">{player.rank_title}</span>
                                                </div>
                                                <div className="flex items-center gap-6 pr-4">
                                                    <div className="text-right hidden sm:block">
                                                        <span className="block text-[9px] font-bold uppercase text-gray-600">Jogos</span>
                                                        <span className="font-mono text-sm text-gray-300">{player.matches}</span>
                                                    </div>
                                                    <div className="text-right hidden sm:block">
                                                        <span className="block text-[9px] font-bold uppercase text-gray-600">Kills</span>
                                                        <span className="font-mono text-sm text-gray-300">{player.kills}</span>
                                                    </div>
                                                    <div className="text-right pl-4 border-l border-white/10 min-w-[60px]">
                                                        <span className="block text-[9px] font-bold uppercase text-yellow-600">Wins</span>
                                                        <span className="font-display font-bold text-lg text-yellow-400">{player.wins}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        // --- ESTADO VAZIO (Sem dados) ---
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-32 border border-dashed border-white/10 rounded-3xl bg-black/20 backdrop-blur-sm"
                        >
                            <Swords size={48} className="mb-4 text-gray-700 animate-pulse" />
                            <h3 className="text-gray-300 font-bold uppercase tracking-widest mb-2">Arena Vazia</h3>
                            <p className="text-gray-500 text-sm">Aguardando os primeiros competidores.</p>
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>
        )}
      </div>
    </div>
  );
}