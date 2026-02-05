import { useState } from 'react';
import { createClient } from '@supabase/supabase-js'; 
import { Shuffle, Trophy, Loader2, Swords, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

// --- CONFIGURAÇÃO SUPABASE ---
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function TournamentBracketGenerator() {
  const [loading, setLoading] = useState(false);
  const [animationState, setAnimationState] = useState<'idle' | 'shuffling' | 'done'>('idle');
  const [displayPair, setDisplayPair] = useState({ p1: '?', p2: '?' });

  // Função que faz o "Efeito Visual" antes de salvar
  const runShuffleAnimation = (players: string[]) => {
    return new Promise<void>((resolve) => {
      setAnimationState('shuffling');
      let steps = 0;
      const maxSteps = 20; 
      
      const interval = setInterval(() => {
        const r1 = players[Math.floor(Math.random() * players.length)];
        const r2 = players[Math.floor(Math.random() * players.length)];
        setDisplayPair({ p1: r1 || '?', p2: r2 || '?' });
        steps++;

        if (steps >= maxSteps) {
          clearInterval(interval);
          resolve();
        }
      }, 150); 
    });
  };

  const handleGenerateBracket = async () => {
    if(!confirm("Gerar chaves com base nos PAGAMENTOS APROVADOS? Isso apagará o sorteio anterior.")) return;
    
    setLoading(true);
    try {
        // 1. Busca o último evento para vincular
        const { data: lastEvent } = await supabase
            .from('events')
            .select('id, title')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (!lastEvent) throw new Error("Nenhum evento criado no sistema.");

        // 2. BUSCA REAL: Pega usuários da tabela ORDERS com status APROVADO
        const { data: paidOrders, error: orderError } = await supabase
            .from('orders')
            .select('discord_username') // Pega o nick do discord
            .eq('status', 'approved')   // <--- SÓ QUEM PAGOU
            .not('discord_username', 'is', null); // Garante que tem nome

        if (orderError) throw orderError;
        
        if (!paidOrders || paidOrders.length < 2) {
            throw new Error(`Encontrei apenas ${paidOrders?.length || 0} pagamentos aprovados. Mínimo 2.`);
        }

        // Remove duplicatas (caso o mesmo cara tenha comprado 2 itens)
        const uniquePlayers = [...new Set(paidOrders.map(o => o.discord_username))];

        console.log("Jogadores confirmados:", uniquePlayers);

        // 3. RODA A ANIMAÇÃO VISUAL 🎰
        await runShuffleAnimation(uniquePlayers);

        // 4. Limpa chaves antigas desse evento
        await supabase.from('tournament_matches').delete().eq('event_id', lastEvent.id);

        // 5. Gera os confrontos
        const shuffled = [...uniquePlayers].sort(() => Math.random() - 0.5);
        const matches = [];

        for (let i = 0; i < shuffled.length; i += 2) {
            matches.push({
                event_id: lastEvent.id,
                player_1_name: shuffled[i],
                player_2_name: shuffled[i + 1] || "BYE (Passa Direto)",
                round: 1,
                match_order: i / 2,
                is_next_match: i === 0 
            });
        }

        const { error } = await supabase.from('tournament_matches').insert(matches);
        if (error) throw error;

        setAnimationState('done');
        toast.success(`Sucesso! ${uniquePlayers.length} jogadores confirmados.`, {
            description: `Chaves geradas para: ${lastEvent.title}`
        });

        // Reseta o visual após 3 segundos
        setTimeout(() => setAnimationState('idle'), 3000);

    } catch (err: any) {
        toast.error("Erro ao gerar", { description: err.message });
        setAnimationState('idle');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="bg-[#121212] border border-white/10 rounded-2xl p-8 relative overflow-hidden group h-full flex flex-col justify-between shadow-2xl">
        {/* Efeitos de Fundo */}
        <div className={`absolute top-0 right-0 p-32 rounded-full blur-3xl -z-10 transition-all duration-700 ${animationState === 'shuffling' ? 'bg-purple-500/20' : 'bg-blue-500/5 group-hover:bg-blue-500/10'}`} />
        
        {/* Cabeçalho do Card */}
        <div>
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl border transition-all duration-500 ${animationState === 'shuffling' ? 'bg-purple-500/20 border-purple-500/50 text-purple-400 animate-bounce' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                    {animationState === 'shuffling' ? <Swords size={24} /> : <Shuffle size={24} />}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Sorteio Automático (Vendas)</h3>
                    <p className="text-xs text-gray-500">
                        {animationState === 'shuffling' ? 'Sorteando confrontos...' : 'Baseado em pagamentos aprovados.'}
                    </p>
                </div>
            </div>

            {/* Área Visual do Sorteio */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 mb-6 min-h-[80px] flex items-center justify-center relative overflow-hidden">
                {animationState === 'shuffling' ? (
                    <div className="text-center animate-pulse">
                        <span className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1 block">Sorteando...</span>
                        <div className="text-lg font-black text-white flex items-center gap-2 justify-center">
                            <span>{displayPair.p1?.split(' ')[0]}</span>
                            <span className="text-gray-600 text-xs">VS</span>
                            <span>{displayPair.p2?.split(' ')[0]}</span>
                        </div>
                    </div>
                ) : animationState === 'done' ? (
                    <div className="text-center">
                        <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2 animate-bounce" />
                        <span className="text-green-400 font-bold uppercase text-xs tracking-widest">Sorteio Concluído!</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500 gap-2">
                        <ShoppingBag size={20} className="opacity-50"/>
                        <p className="text-[10px] leading-relaxed text-center uppercase tracking-wider">
                            O sistema buscará apenas<br/>clientes com <span className="text-green-500 font-bold">pagamento aprovado</span>.
                        </p>
                    </div>
                )}
            </div>
        </div>

        {/* Botão de Ação */}
        <button 
            onClick={handleGenerateBracket}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-2 border ${
                loading 
                    ? 'bg-purple-900/20 text-purple-400 border-purple-500/30' 
                    : 'bg-blue-600/10 text-blue-400 border-blue-500/30 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]'
            }`}
        >
            {loading ? (
                <>
                    <Loader2 size={18} className="animate-spin" />
                    Buscando Vendas...
                </>
            ) : (
                <>
                    <Shuffle size={18} />
                    Buscar Pagos & Gerar
                </>
            )}
        </button>
    </div>
  );
}