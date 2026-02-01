import { useEffect, useState } from 'react';
import { Sparkles, ShoppingBag, ArrowRight, Trophy, Crown, Medal } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
// 👇 Importando a sua logo
import logoCandangos from '../assets/CANDANGOSLOGO.png';

// --- CONFIGURAÇÃO SUPABASE ---
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const HeroSection = () => {
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Busca os 3 melhores para exibir no destaque
  useEffect(() => {
    const fetchChampions = async () => {
      const { data } = await supabase
        .from('ranking')
        .select('*')
        .order('points', { ascending: false })
        .limit(3);
      
      if (data) setTopPlayers(data);
      setLoading(false);
    };
    fetchChampions();
  }, []);

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

        {/* Badge "Guilda & Store" */}
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

        {/* 👇 AQUI ESTÁ A NOVA ÁREA DE RANKING (SUBSTITUINDO O ANTIGO FOOTER) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-4xl"
        >
          <div className="relative bg-[#121212]/80 backdrop-blur-md border border-white/10 rounded-2xl p-1 overflow-hidden">
            {/* Faixa de "Campeões" */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50"></div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6">
              
              {/* Esquerda: Call to Action */}
              <div className="text-left flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-white font-bold tracking-wider uppercase">Hall das Lendas</h3>
                </div>
                <p className="text-xs text-gray-500 mb-4">Veja quem está dominando o servidor.</p>
                <a href="/ranking" className="text-xs font-bold text-green-400 hover:text-green-300 flex items-center gap-1 transition-colors">
                  VER COMPLETO <ArrowRight className="w-3 h-3" />
                </a>
              </div>

              {/* Direita: Top 3 Players */}
              <div className="flex items-center justify-center gap-4">
                {loading ? (
                  <div className="text-gray-600 text-xs animate-pulse">Carregando Lendas...</div>
                ) : (
                  topPlayers.map((player, index) => (
                    <div key={player.id} className="relative group cursor-default">
                      {/* Coroa para o Top 1 */}
                      {index === 0 && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-yellow-500 animate-bounce">
                          <Crown size={20} fill="currentColor" />
                        </div>
                      )}
                      
                      <div className={`relative rounded-full p-1 ${
                        index === 0 ? 'bg-gradient-to-b from-yellow-400 to-yellow-600 shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 
                        index === 1 ? 'bg-gradient-to-b from-gray-300 to-gray-500' : 
                        'bg-gradient-to-b from-orange-400 to-orange-700'
                      }`}>
                        <img 
                          src={player.player_avatar || "https://cdn.discordapp.com/embed/avatars/0.png"} 
                          alt={player.player_name}
                          className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[#121212] object-cover"
                        />
                      </div>
                      
                      {/* Tooltip do Nome */}
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black border border-white/10 px-2 py-1 rounded text-[10px] text-white font-bold pointer-events-none z-20">
                        {index + 1}º {player.player_name}
                      </div>
                    </div>
                  ))
                )}
                
                {/* Slot Vazio se tiver menos de 3 */}
                {[...Array(3 - topPlayers.length)].map((_, i) => (
                   <div key={`empty-${i}`} className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                     <Medal className="w-5 h-5 text-white/10" />
                   </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;