import { useEffect, useState } from 'react';
import { Sparkles, ShoppingBag, ArrowRight, Trophy, Crown, Medal, Swords, Zap, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
// 👇 Importando a sua logo
import logoCandangos from '../assets/CANDANGOSLOGO.png';

// --- CONFIGURAÇÃO SUPABASE ---
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// --- TIPO: PARTIDA ---
type Match = {
  id: string;
  player_1_name: string;
  player_2_name: string;
  round: number;
  winner_name: string | null;
  match_order: number;
};

const HeroSection = () => {
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [activeMatches, setActiveMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasActiveTournament, setHasActiveTournament] = useState(false);

  // --- 1. BUSCA DADOS INICIAIS ---
  useEffect(() => {
    async function initData() {
      setLoading(true);
      
      // A. Busca o Ranking (Padrão)
      const { data: ranking } = await supabase
        .from('ranking')
        .select('*')
        .order('points', { ascending: false })
        .limit(3);
      if (ranking) setTopPlayers(ranking);

      // B. Verifica se tem Torneio Ativo (Último evento criado)
      await checkActiveTournament();
      
      setLoading(false);
    }

    initData();

    // --- 2. REALTIME (Escuta mudanças no torneio) ---
    const channel = supabase.channel('hero-tournament')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tournament_matches' }, () => {
        checkActiveTournament(); // Atualiza se houver mudança
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Função que busca as partidas do torneio mais recente
  const checkActiveTournament = async () => {
    const { data: lastEvent } = await supabase.from('events').select('id').order('created_at', { ascending: false }).limit(1).single();
    
    if (lastEvent) {
      const { data: matches } = await supabase
        .from('tournament_matches')
        .select('*')
        .eq('event_id', lastEvent.id)
        .order('round', { ascending: true })
        .order('match_order', { ascending: true });

      if (matches && matches.length > 0) {
        // Verifica se o torneio ainda não acabou (se nem todos tem vencedor na última rodada)
        // Ou simplesmente mostra o último torneio mesmo finalizado
        setActiveMatches(matches);
        setHasActiveTournament(true);
      } else {
        setHasActiveTournament(false);
      }
    }
  };

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] pt-32 pb-20">
      
      {/* --- BACKGROUND EFFECTS --- */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl opacity-40 pointer-events-none">
        <div className="absolute top-20 left-[-20%] w-[600px] h-[600px] bg-green-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-40 right-[-20%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto relative z-10 flex flex-col items-center text-center px-4">
        
        {/* LOGO GRANDE (HERO) */}
        <div className="relative group mb-8 animate-fade-in-up">
            <div className="absolute inset-0 bg-green-500/20 blur-[50px] rounded-full animate-pulse-slow" />
            <img 
              src={logoCandangos} 
              alt="Guilda Candangos" 
              className="relative w-64 md:w-80 lg:w-96 drop-shadow-2xl transition-transform duration-500 hover:scale-105 hover:-rotate-1"
            />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-900/20 border border-green-500/30 mb-6 backdrop-blur-sm shadow-[0_0_15px_rgba(34,197,94,0.15)]">
          <Sparkles className="w-4 h-4 text-green-400 fill-green-400/20" />
          <span className="text-xs md:text-sm font-bold text-green-200 tracking-widest uppercase">
            Guilda & Store de Eventos
          </span>
        </div>
        
        {/* Título Principal */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 tracking-tight text-white max-w-4xl leading-tight">
          A Lenda Começa na <br className="hidden md:block"/>
          <span className="bg-gradient-to-r from-green-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent drop-shadow-lg">
            CANDANGOS
          </span>
        </h1>
        
        {/* Descrição */}
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          Equipe-se com os melhores kits, ferramentas e itens exclusivos para dominar os eventos. 
          Entre para a guilda que constrói o futuro do servidor.
        </p>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-16">
          <a 
            href="#loja" 
            className="w-full sm:w-auto group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-lg bg-green-600 px-8 font-medium text-white transition-all duration-300 hover:bg-green-500 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]"
          >
            <span className="mr-2 flex items-center gap-2 font-bold uppercase tracking-wide">
              Ver Produtos <ShoppingBag className="w-4 h-4" />
            </span>
          </a>
          
          <a 
            href="https://discord.gg/HTftKRAK" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full sm:w-auto group inline-flex h-12 items-center justify-center rounded-lg border border-orange-500/30 bg-orange-500/5 px-8 font-medium text-orange-400 transition-all hover:bg-orange-500/10 hover:border-orange-500 hover:text-orange-300"
          >
            <span className="font-bold uppercase tracking-wide flex items-center gap-2">
              Discord Oficial <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </a>
        </div>

        {/* 👇 ÁREA DINÂMICA: TORNEIO AO VIVO OU RANKING */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-5xl"
        >
          <div className="relative bg-[#121212]/80 backdrop-blur-md border border-white/10 rounded-2xl p-1 overflow-hidden transition-all duration-500 hover:border-white/20">
            
            {/* Faixa Superior Dinâmica */}
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r opacity-50 ${hasActiveTournament ? 'from-transparent via-green-500 to-transparent animate-pulse' : 'from-transparent via-yellow-500 to-transparent'}`}></div>
            
            <div className="flex flex-col gap-6 p-6">
              
              {/* Cabeçalho do Card */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div className="text-left flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {hasActiveTournament ? (
                        <>
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                            <h3 className="text-white font-bold tracking-wider uppercase text-lg">Torneio Ao Vivo</h3>
                        </>
                    ) : (
                        <>
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            <h3 className="text-white font-bold tracking-wider uppercase">Hall das Lendas</h3>
                        </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {hasActiveTournament 
                        ? "Acompanhe as chaves e resultados em tempo real." 
                        : "Veja quem está dominando o servidor. Próximo torneio em breve."}
                  </p>
                </div>

                {hasActiveTournament && (
                    <a href="/torneio" className="text-xs font-bold text-green-400 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20 hover:bg-green-500/20 transition-all flex items-center gap-2 animate-pulse">
                        ASSISTIR NA ARENA <ArrowRight className="w-3 h-3" />
                    </a>
                )}
              </div>

              {/* CONTEÚDO DO CARD */}
              <div className="min-h-[120px] flex items-center justify-center w-full">
                {loading ? (
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                        <Loader2 className="animate-spin w-6 h-6" />
                        <span className="text-xs uppercase tracking-widest">Carregando dados...</span>
                    </div>
                ) : hasActiveTournament ? (
                    // --- MODO TORNEIO (Scroll Horizontal) ---
                    <div className="w-full overflow-x-auto custom-scrollbar pb-2">
                        <div className="flex gap-4 min-w-max px-2">
                            {/* Renderiza as últimas partidas ativas ou a final */}
                            {activeMatches.slice(-4).reverse().map((match) => (
                                <MiniBracketCard key={match.id} match={match} />
                            ))}
                            {activeMatches.length === 0 && <span className="text-gray-500 text-xs">Preparando chaves...</span>}
                        </div>
                    </div>
                ) : (
                    // --- MODO RANKING (Padrão) ---
                    <div className="flex items-center justify-center gap-6 w-full">
                        {topPlayers.map((player, index) => (
                            <div key={player.id} className="relative group cursor-default flex flex-col items-center">
                                {index === 0 && (
                                    <div className="absolute -top-5 text-yellow-500 animate-bounce">
                                        <Crown size={20} fill="currentColor" />
                                    </div>
                                )}
                                <div className={`relative rounded-full p-1 mb-2 ${
                                    index === 0 ? 'bg-gradient-to-b from-yellow-400 to-yellow-600 shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 
                                    index === 1 ? 'bg-gradient-to-b from-gray-300 to-gray-500' : 
                                    'bg-gradient-to-b from-orange-400 to-orange-700'
                                }`}>
                                    <img 
                                        src={player.player_avatar || "https://cdn.discordapp.com/embed/avatars/0.png"} 
                                        alt={player.player_name}
                                        className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-[#121212] object-cover"
                                    />
                                </div>
                                <span className="text-xs font-bold text-white uppercase tracking-wide">{player.player_name}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-gray-400'}`}>
                                    {index + 1}º Lugar
                                </span>
                            </div>
                        ))}
                        {[...Array(3 - topPlayers.length)].map((_, i) => (
                            <div key={`empty-${i}`} className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-50">
                                <Medal className="w-6 h-6 text-white/10" />
                            </div>
                        ))}
                    </div>
                )}
              </div>

            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

// --- MINI CARD PARA O HERO (Visual Compacto) ---
function MiniBracketCard({ match }: { match: Match }) {
    const p1 = match.player_1_name;
    const p2 = match.player_2_name;
    const winner = match.winner_name;

    return (
        <div className="w-48 bg-white/5 border border-white/10 rounded-lg p-3 flex flex-col gap-2 shrink-0">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-gray-500 mb-1">
                <span>R{match.round}</span>
                {winner && <span className="text-green-400 flex items-center gap-1"><Zap size={10}/> Finalizado</span>}
            </div>
            
            <div className={`flex justify-between items-center ${winner === p1 ? 'text-green-400 font-bold' : 'text-gray-300'}`}>
                <span className="text-xs truncate max-w-[80%]">{p1}</span>
                {winner === p1 && <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />}
            </div>
            
            <div className="h-px bg-white/10 w-full" />
            
            <div className={`flex justify-between items-center ${winner === p2 ? 'text-green-400 font-bold' : 'text-gray-300'}`}>
                <span className="text-xs truncate max-w-[80%]">{p2}</span>
                {winner === p2 && <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />}
            </div>
        </div>
    )
}

export default HeroSection;