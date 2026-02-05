import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Trophy, Swords, Zap, Crown, Play, Loader2, Wifi } from 'lucide-react'; // Adicionei icone de Wifi
import { toast } from 'sonner';

// --- CONFIGURAÇÃO SUPABASE ---
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// 🔒 LISTA DE ADMINS
const ADMIN_EMAILS = [
  'vinicciusdede@gmail.com', 
  'pedrocandidotolentino@gmail.com',
  'gabrielcampos34@yahoo.com',
  'seuemailaqui@gmail.com'
];

type Match = {
  id: string;
  event_id: string;
  player_1_name: string;
  player_2_name: string;
  round: number;
  winner_name: string | null;
  match_order: number;
};

export default function Tournament() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentSlot, setCurrentSlot] = useState({ p1: '?', p2: '?' });
  const [isSpinning, setIsSpinning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false); // Novo estado para saber se está ao vivo
  const [isAdmin, setIsAdmin] = useState(false);

  const spinAudio = useRef(new Audio('/spin.mp3'));
  const winAudio = useRef(new Audio('/win.mp3')); 
  const victoryAudio = useRef(new Audio('/victory.mp3')); 

  // --- 1. VERIFICA SE É ADMIN ---
  useEffect(() => {
    const checkPermission = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email && ADMIN_EMAILS.includes(user.email)) {
            setIsAdmin(true); 
        }
    };
    checkPermission();
  }, []);

  // --- CONFIGURAÇÃO DE SOM ---
  useEffect(() => {
    [spinAudio, winAudio, victoryAudio].forEach(audio => {
        audio.current.volume = 0.5;
        audio.current.load();
    });
  }, []);

  const playSound = (type: 'spin' | 'win' | 'victory') => {
    try {
        const audio = type === 'spin' ? spinAudio.current : type === 'win' ? winAudio.current : victoryAudio.current;
        audio.currentTime = 0;
        audio.play().catch(() => {}); 
    } catch(e) {}
  };

  // --- HEADER INTELIGENTE ---
  useEffect(() => {
    if (matches.length > 0 && !isSpinning) {
        const maxRound = Math.max(...matches.map(m => m.round));
        const nextActiveMatch = matches
            .filter(m => m.round === maxRound && !m.winner_name)
            .sort((a, b) => a.match_order - b.match_order)[0];

        if (nextActiveMatch) {
            setCurrentSlot({ p1: nextActiveMatch.player_1_name, p2: nextActiveMatch.player_2_name });
        } else {
            const isFinal = matches.filter(m => m.round === maxRound).length === 1;
            const champion = matches.find(m => m.round === maxRound)?.winner_name;
            if (isFinal && champion) setCurrentSlot({ p1: "CAMPEÃO", p2: champion });
            else setCurrentSlot({ p1: "RODADA", p2: "FINALIZADA" });
        }
    }
  }, [matches, isSpinning]);

  // --- BUSCA DADOS & REALTIME (FORÇADO) ---
  useEffect(() => {
    fetchMatches();
    
    const channel = supabase.channel('public:tournament_matches')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tournament_matches' }, (payload) => {
        console.log("Change received!", payload); // Debug no console
        
        if (payload.eventType === 'INSERT') {
            triggerSlotAnimation(payload.new as Match);
            fetchMatches(); 
        } 
        else if (payload.eventType === 'UPDATE') {
            // Atualiza imediatamente quando alguém ganha
            fetchMatches();
        }
        else {
            fetchMatches();
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setIsConnected(true);
        if (status === 'CHANNEL_ERROR') setIsConnected(false);
      });

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchMatches() {
    const { data: lastEvent } = await supabase.from('events').select('id').order('created_at', { ascending: false }).limit(1).single();
    if (!lastEvent) return;

    const { data } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('event_id', lastEvent.id)
      .order('round', { ascending: true })
      .order('match_order', { ascending: true });
    
    if (data) setMatches(data);
  }

  // --- AÇÕES ---
  const handleSetWinner = async (matchId: string, winnerName: string) => {
    if (!isAdmin) return;
    playSound('win');
    
    // Atualiza localmente na hora (pra quem clicou)
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, winner_name: winnerName } : m)); 
    
    try {
        await supabase.from('tournament_matches').update({ winner_name: winnerName }).eq('id', matchId);
        
        const maxRound = Math.max(...matches.map(m => m.round));
        const isFinal = matches.filter(m => m.round === maxRound).length === 1 && maxRound > 1;
        if (isFinal) {
            playSound('victory');
            toast.success(`TEMOS UM CAMPEÃO: ${winnerName}!`, { icon: '👑' });
        } else {
            toast.success(`Vencedor: ${winnerName}`);
        }
    } catch (e) {
        toast.error("Erro de permissão ou conexão.");
        fetchMatches();
    }
  };

  const handleNextRound = async () => {
    if (!isAdmin) return;
    if (!matches.length) return;
    
    const maxRound = Math.max(...matches.map(m => m.round));
    const currentRoundMatches = matches.filter(m => m.round === maxRound);
    
    if (currentRoundMatches.some(m => !m.winner_name)) return toast.warning("Defina todos os vencedores antes!");
    if (!confirm("Gerar próxima fase?")) return;

    setLoading(true);
    try {
        const winners = currentRoundMatches.map(m => m.winner_name).filter(Boolean) as string[];
        if (winners.length < 2) {
            playSound('victory');
            return toast.success("Temos um Campeão!");
        }

        const nextMatches = [];
        for (let i = 0; i < winners.length; i += 2) {
            const p1 = winners[i];
            const p2 = winners[i+1] || "BYE";
            nextMatches.push({
                event_id: matches[0].event_id,
                player_1_name: p1,
                player_2_name: p2,
                round: maxRound + 1,
                match_order: i / 2,
                winner_name: p2 === "BYE" ? p1 : null
            });
        }
        await supabase.from('tournament_matches').insert(nextMatches);
        toast.success("Próxima fase gerada!");
        // O Realtime vai atualizar a tela, mas forçamos aqui também
        await fetchMatches();
    } catch (e) { toast.error("Erro ao gerar."); } 
    finally { setLoading(false); }
  };

  const triggerSlotAnimation = (newMatch: Match) => {
    setIsSpinning(true);
    playSound('spin');
    let steps = 0;
    const names = ["Sorteando...", "Vs", "???", "Aguarde"];
    const interval = setInterval(() => {
      setCurrentSlot({ p1: names[Math.floor(Math.random() * names.length)], p2: names[Math.floor(Math.random() * names.length)] });
      steps++;
      if (steps >= 15) {
        clearInterval(interval);
        setCurrentSlot({ p1: newMatch.player_1_name, p2: newMatch.player_2_name });
        setIsSpinning(false);
      }
    }, 100);
  };

  // --- LÓGICA VISUAL ---
  const maxRound = Math.max(0, ...matches.map(m => m.round));
  const showSides = maxRound === 1;
  const isFinalMatch = matches.filter(r => r.round === maxRound).length === 1 && maxRound > 1;
  const round1Matches = matches.filter(m => m.round === 1);
  const midPoint = Math.ceil(round1Matches.length / 2);
  const leftSideQ = round1Matches.slice(0, midPoint);
  const rightSideQ = round1Matches.slice(midPoint);
  const currentMatches = matches.filter(m => m.round === maxRound);
  const finalMatchData = isFinalMatch ? currentMatches[0] : null;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans overflow-hidden relative flex flex-col pb-24">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[500px] bg-yellow-500/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Indicador de Conexão (Para Debug) */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full border border-white/10">
        <Wifi size={12} className={isConnected ? "text-green-500" : "text-red-500 animate-pulse"} />
        <span className="text-[10px] text-gray-400 uppercase tracking-wider">
            {isConnected ? "AO VIVO" : "CONECTANDO..."}
        </span>
      </div>

      {/* HEADER (SLOT) */}
      {!isFinalMatch && (
          <div className="relative z-10 w-full bg-black/40 backdrop-blur-md border-b border-white/5 py-4 md:py-6 mb-4">
            <div className="container mx-auto px-4 text-center">
                <div className="max-w-3xl mx-auto bg-[#111] border border-white/10 rounded-2xl p-4 relative overflow-hidden group shadow-[0_0_50px_rgba(234,179,8,0.1)]">
                    <div className="flex flex-col md:flex-row justify-between items-center text-xl md:text-2xl font-bold uppercase tracking-widest gap-2 md:gap-0">
                        <span className={`flex-1 text-center md:text-right truncate px-4 ${isSpinning ? 'blur-sm text-yellow-200' : 'text-white'}`}>{isSpinning ? currentSlot.p1 : currentSlot.p1}</span>
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-600 rounded-full flex items-center justify-center text-black font-black text-[10px] md:text-xs italic shadow-lg shrink-0">VS</div>
                        <span className={`flex-1 text-center md:text-left truncate px-4 ${isSpinning ? 'blur-sm text-yellow-200' : 'text-white'}`}>{isSpinning ? currentSlot.p2 : currentSlot.p2}</span>
                    </div>
                </div>
            </div>
          </div>
      )}

      {/* --- ÁREA PRINCIPAL --- */}
      <div className="flex-1 flex flex-col md:flex-row justify-center items-center md:items-start px-4 gap-8 md:gap-4 overflow-y-auto md:overflow-hidden relative pb-10">
        
        {/* GRUPO A */}
        {showSides && (
            <div className="w-full md:w-[320px] flex flex-col gap-4 md:overflow-y-auto md:pr-4 custom-scrollbar md:h-[70vh] animate-in slide-in-from-left-10 duration-700 order-2 md:order-1">
                <div className="text-center text-[10px] font-bold uppercase text-gray-600 tracking-[0.2em] mb-2 bg-[#050505] md:sticky md:top-0 py-2 z-10 border-b border-white/5 md:border-none">Grupo A</div>
                {leftSideQ.map(m => <BracketCard key={m.id} match={m} isAdmin={isAdmin} onWin={handleSetWinner} />)}
            </div>
        )}

        {/* CENTRO */}
        <div className={`flex flex-col items-center justify-center relative transition-all duration-1000 order-1 md:order-2 w-full ${isFinalMatch ? 'md:scale-110 md:w-full' : 'md:flex-1 md:min-w-[350px]'}`}>
            {isFinalMatch && finalMatchData ? (
                // FINAL
                <div className="animate-in zoom-in duration-700 flex flex-col items-center gap-8 md:gap-12 w-full max-w-5xl">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl md:text-6xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_0_35px_rgba(234,179,8,0.4)]">Grande Final</h2>
                        <p className="text-[10px] md:text-xs font-mono uppercase tracking-[0.5em] text-gray-500">O Duelo Supremo</p>
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16 w-full">
                        <div onClick={() => !finalMatchData.winner_name && isAdmin && handleSetWinner(finalMatchData.id, finalMatchData.player_1_name)} className={`flex-1 text-center md:text-right cursor-pointer transition-all ${finalMatchData.winner_name === finalMatchData.player_1_name ? 'scale-110 opacity-100' : finalMatchData.winner_name ? 'opacity-30 blur-sm' : isAdmin ? 'hover:scale-105' : ''}`}>
                            <div className={`text-2xl md:text-5xl font-black uppercase italic ${finalMatchData.winner_name === finalMatchData.player_1_name ? 'text-green-400 drop-shadow-[0_0_20px_rgba(74,222,128,0.5)]' : 'text-white'}`}>{finalMatchData.player_1_name}</div>
                        </div>
                        <div className="relative shrink-0">
                            {finalMatchData.winner_name ? (
                                <div className="relative animate-in zoom-in spin-in-3 duration-1000">
                                    <div className="absolute inset-0 bg-yellow-500 blur-[80px] opacity-40 animate-pulse" />
                                    <Trophy className="w-32 h-32 md:w-48 md:h-48 text-yellow-400 drop-shadow-[0_0_30px_rgba(234,179,8,0.8)]" />
                                    <Crown className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 text-white animate-bounce" />
                                </div>
                            ) : (
                                <div className="relative">
                                    <Trophy className="w-20 h-20 md:w-32 md:h-32 text-gray-800 drop-shadow-xl" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-black italic text-gray-600">VS</div>
                                </div>
                            )}
                        </div>
                        <div onClick={() => !finalMatchData.winner_name && isAdmin && handleSetWinner(finalMatchData.id, finalMatchData.player_2_name)} className={`flex-1 text-center md:text-left cursor-pointer transition-all ${finalMatchData.winner_name === finalMatchData.player_2_name ? 'scale-110 opacity-100' : finalMatchData.winner_name ? 'opacity-30 blur-sm' : isAdmin ? 'hover:scale-105' : ''}`}>
                            <div className={`text-2xl md:text-5xl font-black uppercase italic ${finalMatchData.winner_name === finalMatchData.player_2_name ? 'text-green-400 drop-shadow-[0_0_20px_rgba(74,222,128,0.5)]' : 'text-white'}`}>{finalMatchData.player_2_name}</div>
                        </div>
                    </div>
                    {finalMatchData.winner_name && (
                        <div className="mt-4 md:mt-8 bg-yellow-600/20 border border-yellow-500/50 px-8 md:px-12 py-3 md:py-4 rounded-full text-yellow-400 font-bold uppercase tracking-[0.3em] text-sm md:text-xl animate-in slide-in-from-bottom-10 fade-in duration-1000 shadow-[0_0_30px_rgba(234,179,8,0.3)] text-center">Campeão do Torneio</div>
                    )}
                </div>
            ) : (
                // ELIMINATÓRIAS
                !showSides && (
                    <div className="flex flex-col gap-6 w-full max-w-md animate-in zoom-in duration-500 h-auto md:h-[70vh] md:overflow-y-auto custom-scrollbar px-4">
                        <div className="text-center space-y-1 mb-4 bg-[#050505] md:sticky md:top-0 py-2 z-10">
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-yellow-600 block">Fase Eliminatória</span>
                            <h2 className="text-2xl font-black italic text-white uppercase">Rodada {maxRound}</h2>
                        </div>
                        {currentMatches.map(m => (
                            <BracketCard key={m.id} match={m} isAdmin={isAdmin} onWin={handleSetWinner} isSemi={true} />
                        ))}
                    </div>
                )
            )}
        </div>

        {/* GRUPO B */}
        {showSides && (
            <div className="w-full md:w-[320px] flex flex-col gap-4 md:overflow-y-auto md:pl-4 custom-scrollbar md:h-[70vh] animate-in slide-in-from-right-10 duration-700 order-3 md:order-3">
                <div className="text-center text-[10px] font-bold uppercase text-gray-600 tracking-[0.2em] mb-2 bg-[#050505] md:sticky md:top-0 py-2 z-10 border-b border-white/5 md:border-none">Grupo B</div>
                {rightSideQ.map(m => <BracketCard key={m.id} match={m} isAdmin={isAdmin} onWin={handleSetWinner} side="right" />)}
            </div>
        )}
      </div>

      {/* BOTÃO DE JUIZ */}
      {isAdmin && !finalMatchData?.winner_name && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full px-4 flex justify-center">
            <button onClick={handleNextRound} disabled={loading} className="group flex items-center justify-center gap-3 bg-[#111] hover:bg-green-600 border border-white/20 hover:border-green-500 px-6 py-3 rounded-full shadow-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 w-full md:w-auto">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-green-100 hidden md:block">Painel do Juiz</span>
                <span className="text-sm font-bold text-white group-hover:text-white flex items-center gap-2">
                    {loading ? "Processando..." : "Gerar Próxima Fase"} 
                    {!loading && <Play size={12} fill="currentColor" />}
                </span>
            </button>
        </div>
      )}
    </div>
  );
}

// --- CARD DE JOGO ---
function BracketCard({ match, isAdmin, onWin, side = "left", isSemi = false }: { match: Match, isAdmin: boolean, onWin: any, side?: "left" | "right", isSemi?: boolean }) {
    const p1 = match.player_1_name;
    const p2 = match.player_2_name;
    const winner = match.winner_name;
    const width = "w-full";
    const height = isSemi ? "h-24" : "h-20";
    
    const activeClass = winner 
        ? "border-green-500/40 opacity-60" 
        : isAdmin 
            ? "border-white/10 hover:border-yellow-500/50 hover:shadow-lg hover:scale-[1.02]" 
            : "border-white/10 opacity-80";

    return (
        <div className={`relative ${width} ${height} bg-[#121212] border ${activeClass} rounded-xl overflow-hidden flex flex-col justify-center transition-all duration-300 shrink-0`}>
            <div onClick={() => isAdmin && !winner && onWin(match.id, p1)} className={`flex items-center justify-between px-4 py-1.5 flex-1 border-b border-white/5 relative group ${winner === p1 ? 'bg-green-900/40' : isAdmin ? 'cursor-pointer hover:bg-white/5' : ''}`}>
                <div className="flex items-center gap-3 w-full">
                    <span className="text-[10px] font-bold text-gray-600">01</span>
                    <span className={`font-bold uppercase truncate text-xs flex-1 ${winner === p1 ? 'text-green-400' : 'text-gray-300'}`}>{p1}</span>
                    {winner === p1 && <Zap size={12} className="text-green-400" />}
                    {!winner && isAdmin && <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400 opacity-0 group-hover:opacity-100 absolute right-2">WIN</span>}
                </div>
            </div>
            <div onClick={() => isAdmin && !winner && onWin(match.id, p2)} className={`flex items-center justify-between px-4 py-1.5 flex-1 relative group ${winner === p2 ? 'bg-green-900/40' : isAdmin ? 'cursor-pointer hover:bg-white/5' : ''}`}>
                <div className="flex items-center gap-3 w-full">
                    <span className="text-[10px] font-bold text-gray-600">02</span>
                    <span className={`font-bold uppercase truncate text-xs flex-1 ${winner === p2 ? 'text-green-400' : 'text-gray-300'}`}>{p2}</span>
                    {winner === p2 && <Zap size={12} className="text-green-400" />}
                    {!winner && isAdmin && <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400 opacity-0 group-hover:opacity-100 absolute right-2">WIN</span>}
                </div>
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xl font-black italic text-white/5 select-none pointer-events-none">VS</div>
        </div>
    );
}