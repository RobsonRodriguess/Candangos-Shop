import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, TrendingUp, Users, ShoppingBag, Search, 
  LayoutDashboard, CreditCard, Calendar, ArrowUpRight, 
  AlertCircle, LogOut, Trophy, Save, RefreshCw, Crown, Swords, Globe, User,
  DollarSign, Calculator, ArrowDownRight, Plus, Trash2 
} from 'lucide-react';
import { toast } from 'sonner';

// --- CONFIGURAÇÃO SUPABASE PROTEGIDA 🛡️ ---
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Lista de Admins
const ADMIN_EMAILS = [
  'vinicciusdede@gmail.com', 
  'pedrocandidotolentino@gmail.com',
  'gabrielcampos34@yahoo.com'
]; 

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'orders' | 'tournament' | 'financial'>('orders');
  
  // Estados de Pedidos
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados do Torneio
  const [winnerNick, setWinnerNick] = useState('');
  const [winnerPosition, setWinnerPosition] = useState('1'); 
  const [winnerKills, setWinnerKills] = useState(0);
  const [foundAvatar, setFoundAvatar] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  // --- ESTADOS: FINANCEIRO (CAIXA) ---
  const [expenses, setExpenses] = useState<any[]>([]);
  const [prizePercentage, setPrizePercentage] = useState(50); // % do 1º lugar
  const [newExpense, setNewExpense] = useState({ desc: '', amount: '' });

  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  // --- BUSCA AUTOMÁTICA DE AVATAR ---
  useEffect(() => {
    const fetchAvatar = async () => {
      if (winnerNick.length < 3) return;
      const { data } = await supabase
        .from('orders')
        .select('user_avatar')
        .ilike('discord_username', winnerNick) 
        .limit(1)
        .order('created_at', { ascending: false }) 
        .maybeSingle();

      if (data?.user_avatar) {
        setFoundAvatar(data.user_avatar);
        toast.success("Avatar encontrado no histórico!", { duration: 2000 });
      } else {
        setFoundAvatar(null); 
      }
    };
    const timeoutId = setTimeout(fetchAvatar, 800); 
    return () => clearTimeout(timeoutId);
  }, [winnerNick]);

  async function checkAdminAndFetch() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
      toast.error("Acesso Negado", { description: "Esta área é restrita a oficiais da guilda." });
      navigate('/');
      return;
    }

    // Carrega Pedidos e Despesas
    await Promise.all([fetchOrders(), fetchExpenses()]);
    setLoading(false);
  }

  async function fetchOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setOrders(data || []);
  }

  async function fetchExpenses() {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setExpenses(data || []);
  }

  // --- AÇÕES: TORNEIO E GLOBAL ---
  async function handleAddWinner(e: React.FormEvent) {
    e.preventDefault();
    if (!winnerNick) return toast.warning("Digite o nick do jogador");

    const newWinner = {
      player_name: winnerNick,
      player_avatar: foundAvatar || "https://cdn.discordapp.com/embed/avatars/0.png",
      wins: winnerPosition === '1' ? 1 : 0,
      kills: winnerKills,
      matches: 1,
      rank_title: winnerPosition === '1' ? 'Campeão Semanal' : `Top ${winnerPosition}`,
      category: 'weekly',
    };

    const { error } = await supabase.from('ranking').insert(newWinner);

    if (error) {
      toast.error("Erro ao salvar", { description: error.message });
    } else {
      toast.success(`${winnerNick} salvo no Ranking Semanal!`);
      setWinnerNick('');
      setWinnerKills(0);
      setFoundAvatar(null);
    }
  }

  async function handleSyncGlobal() {
    setSyncing(true);
    toast.info("Calculando supremacia global...");
    try {
      const { data: weeklyData } = await supabase.from('ranking').select('*').eq('category', 'weekly');
      if (!weeklyData || weeklyData.length === 0) throw new Error("Sem dados semanais para processar.");

      const globalStats: Record<string, any> = {};
      weeklyData.forEach(entry => {
        const name = entry.player_name;
        if (!globalStats[name]) {
          globalStats[name] = {
            player_name: name,
            player_avatar: entry.player_avatar, 
            wins: 0, kills: 0, matches: 0,
            category: 'global', rank_title: 'Guerreiro'
          };
        }
        globalStats[name].wins += Number(entry.wins || 0);
        globalStats[name].kills += Number(entry.kills || 0);
        globalStats[name].matches += Number(entry.matches || 0);
      });

      const globalArray = Object.values(globalStats).map(p => {
        if (p.wins >= 15) p.rank_title = 'Lenda Viva';
        else if (p.wins >= 10) p.rank_title = 'General';
        else if (p.wins >= 5) p.rank_title = 'Elite';
        else p.rank_title = 'Veterano';
        return p;
      });

      await supabase.from('ranking').delete().eq('category', 'global');
      await supabase.from('ranking').insert(globalArray);
      toast.success("Ranking Global Sincronizado!");
    } catch (err: any) {
      toast.error("Erro na sincronização", { description: err.message });
    } finally {
      setSyncing(false);
    }
  }

  // --- AÇÕES: FINANCEIRO (CAIXA) ---
  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!newExpense.desc || !newExpense.amount) return toast.warning("Preencha descrição e valor");
    
    const { error } = await supabase.from('expenses').insert({
      description: newExpense.desc,
      amount: parseFloat(newExpense.amount),
      category: 'manual'
    });

    if (error) toast.error("Erro ao registrar saída");
    else { 
        toast.success("Saída registrada!"); 
        fetchExpenses(); 
        setNewExpense({ desc: '', amount: '' }); 
    }
  }

  async function handlePayWinner(amount: number) {
    if (!confirm(`Confirmar pagamento de R$ ${amount.toFixed(2)} para o vencedor?`)) return;
    
    const { error } = await supabase.from('expenses').insert({
      description: `Premiação 1º Lugar (${prizePercentage}%)`,
      amount: amount,
      category: 'premio'
    });

    if (!error) { 
        toast.success("Pagamento debitado do caixa!"); 
        fetchExpenses(); 
    } else {
        toast.error("Erro ao registrar pagamento");
    }
  }

  async function handleDeleteExpense(id: string) {
      if(!confirm("Deletar este registro?")) return;
      await supabase.from('expenses').delete().eq('id', id);
      fetchExpenses();
      toast.success("Registro removido.");
  }

  // --- CÁLCULOS FINANCEIROS ---
  const totalFaturado = orders.filter(o => o.status === 'approved').reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);
  const totalVendas = orders.filter(o => o.status === 'approved').length;
  const vendasPendentes = orders.filter(o => o.status === 'pending').length;
  
  const totalDespesas = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const lucroLiquido = totalFaturado - totalDespesas;

  // Cálculos da Calculadora
  const premio1 = (totalFaturado * prizePercentage) / 100;
  const premio2 = 29.99; // VIP
  const premio3 = 10.00; // Entrada
  const lucroGuilda = totalFaturado - premio1 - premio2 - premio3;

  const filteredOrders = orders.filter(order => 
    order.discord_username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.payment_id?.includes(searchTerm) ||
    order.buyer_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4 text-green-500">
        <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>
        <p className="font-mono text-sm tracking-widest uppercase animate-pulse">Autenticando Admin...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* --- HEADER RESPONSIVO (Ajustado) --- */}
      <div className="border-b border-white/5 bg-[#121212]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 md:py-0 md:h-20 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Logo e Status (Mobile: Topo) */}
            <div className="flex items-center justify-between w-full md:w-auto">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center border border-red-500/20">
                        <ShieldAlert className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-xl font-display font-bold text-white tracking-wide">Painel Admin</h1>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-xs text-gray-500 font-mono uppercase">Online</span>
                        </div>
                    </div>
                </div>
                {/* Botão Sair (Apenas Mobile) */}
                <button onClick={() => navigate('/')} className="md:hidden p-2 rounded-lg border border-white/10 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-all text-gray-400">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>

            {/* Menu de Abas (Mobile: Largura Total / Desktop: Direita) */}
            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="flex w-full md:w-auto bg-black/40 p-1 rounded-lg border border-white/10">
                    <button 
                        onClick={() => setActiveTab('orders')} 
                        className={`flex-1 md:flex-none px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all flex justify-center items-center gap-2 ${activeTab === 'orders' ? 'bg-white/10 text-white shadow-md' : 'text-gray-500 hover:text-white'}`}
                    >
                        <ShoppingBag size={14} /> <span className="hidden xs:inline">Vendas</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('tournament')} 
                        className={`flex-1 md:flex-none px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all flex justify-center items-center gap-2 ${activeTab === 'tournament' ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-500 hover:text-white'}`}
                    >
                        <Trophy size={14} /> <span className="hidden xs:inline">Torneios</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('financial')} 
                        className={`flex-1 md:flex-none px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all flex justify-center items-center gap-2 ${activeTab === 'financial' ? 'bg-green-600/20 text-green-400' : 'text-gray-500 hover:text-white'}`}
                    >
                        <DollarSign size={14} /> <span className="hidden xs:inline">Caixa</span>
                    </button>
                </div>
                
                {/* Botão Sair (Apenas Desktop) */}
                <button onClick={() => navigate('/')} className="hidden md:block p-2 rounded-lg border border-white/10 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-all text-gray-400">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* ========================================================== */}
        {/* ABA 1: VENDAS (CLÁSSICO)                                   */}
        {/* ========================================================== */}
        {activeTab === 'orders' && (
            <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {/* Cards Estatísticas */}
                    <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-green-500/30 transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-500/10 transition-all" />
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20 text-green-500"><TrendingUp size={24} /></div>
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-green-400 bg-green-900/20 px-2 py-1 rounded"><ArrowUpRight size={12} /> Receita</span>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Faturamento Total</p>
                            <h2 className="text-3xl font-display font-bold text-white">R$ {totalFaturado.toFixed(2).replace('.', ',')}</h2>
                        </div>
                    </div>

                    <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all" />
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-500"><ShoppingBag size={24} /></div>
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-blue-400 bg-blue-900/20 px-2 py-1 rounded"><LayoutDashboard size={12} /> Volume</span>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Vendas Aprovadas</p>
                            <h2 className="text-3xl font-display font-bold text-white">{totalVendas} <span className="text-sm font-sans text-gray-600 font-normal">pedidos</span></h2>
                        </div>
                    </div>

                    <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-yellow-500/30 transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl group-hover:bg-yellow-500/10 transition-all" />
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20 text-yellow-500"><AlertCircle size={24} /></div>
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded"><Users size={12} /> Pendente</span>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Aguardando Pagamento</p>
                            <h2 className="text-3xl font-display font-bold text-white">{vendasPendentes} <span className="text-sm font-sans text-gray-600 font-normal">pedidos</span></h2>
                        </div>
                    </div>
                </div>

                <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#141414]">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><CreditCard className="w-5 h-5 text-gray-400" /> Transações Recentes</h3>
                        <div className="relative w-full md:w-auto group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors w-4 h-4" />
                            <input 
                                type="text" placeholder="Buscar Nick, Email ou ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-lg text-sm focus:border-white/20 outline-none w-full md:w-80 text-white placeholder:text-gray-600 transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap"> 
                            <thead>
                                <tr className="bg-white/[0.02] border-b border-white/5 text-gray-500 text-xs uppercase font-bold tracking-wider">
                                    <th className="px-6 py-4">Data / ID</th>
                                    <th className="px-6 py-4">Cliente</th>
                                    <th className="px-6 py-4">Itens do Pedido</th>
                                    <th className="px-6 py-4 text-right">Valor Total</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-300 font-medium"><Calendar className="w-3.5 h-3.5 text-gray-600" /> {new Date(order.created_at).toLocaleDateString()}</div>
                                            <div className="text-[10px] text-gray-600 font-mono mt-1 uppercase">#{order.payment_id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center overflow-hidden">
                                                    {order.user_avatar ? <img src={order.user_avatar} alt="Avatar" className="w-full h-full object-cover" /> : <Users className="w-4 h-4 text-gray-600" />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white">{order.discord_username || "Desconhecido"}</div>
                                                    <div className="text-[10px] text-gray-500">{order.buyer_email || "Sem email"}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {order.items.slice(0, 2).map((i: any, idx: number) => (
                                                    <span key={idx} className="text-gray-400 text-xs flex items-center gap-1.5">
                                                        <span className="w-1 h-1 rounded-full bg-gray-600"></span>{i.title} <span className="opacity-50">x{i.quantity}</span>
                                                    </span>
                                                ))}
                                                {order.items.length > 2 && <span className="text-[10px] text-gray-600 pl-2.5">+{order.items.length - 2} outros itens...</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right"><span className="font-mono font-bold text-white text-base">R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}</span></td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${order.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'approved' ? 'bg-green-400' : order.status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'}`}></span>
                                                {order.status === 'approved' ? 'Aprovado' : order.status === 'pending' ? 'Pendente' : 'Cancelado'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredOrders.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border-t border-white/5">
                                <Search className="w-8 h-8 text-gray-700 mb-2" />
                                <p className="text-sm">Nenhum registro encontrado.</p>
                            </div>
                        )}
                    </div>
                    <div className="bg-[#141414] border-t border-white/5 p-4 text-[10px] text-gray-600 flex justify-between items-center font-mono">
                        <span>MOSTRANDO {filteredOrders.length} REGISTROS</span>
                        <span>ADMIN SECURE CONNECTION_V1.0</span>
                    </div>
                </div>
            </>
        )}

        {/* ========================================================== */}
        {/* ABA 2: TORNEIOS (VISUAL BRABO MANTIDO)                     */}
        {/* ========================================================== */}
        {activeTab === 'tournament' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#121212] border border-white/10 rounded-2xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-32 bg-yellow-500/5 rounded-full blur-3xl -z-10 group-hover:bg-yellow-500/10 transition-all duration-700" />
                    
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500 border border-yellow-500/20"><Trophy size={24} /></div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Registrar Campeão Semanal</h3>
                            <p className="text-xs text-gray-500">Adicione os resultados do X1.</p>
                        </div>
                    </div>

                    <form onSubmit={handleAddWinner} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-2 ml-1">Nick do Discord</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={winnerNick}
                                    onChange={(e) => setWinnerNick(e.target.value)}
                                    placeholder="Ex: nixagiota"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-yellow-500/50 outline-none transition-colors"
                                />
                                {foundAvatar && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-green-500/10 px-2 py-1 rounded-lg border border-green-500/20 animate-in fade-in slide-in-from-right-4">
                                        <img src={foundAvatar} className="w-6 h-6 rounded-full" alt="" />
                                        <span className="text-[10px] text-green-400 font-bold uppercase">Foto OK</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-[10px] text-gray-600 mt-2 ml-1 flex items-center gap-1">
                                <User size={10} /> Busca automática de foto no banco de compras.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-2 ml-1">Posição</label>
                                <select 
                                    value={winnerPosition}
                                    onChange={(e) => setWinnerPosition(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-yellow-500/50"
                                >
                                    <option value="1">1º Lugar</option>
                                    <option value="2">2º Lugar</option>
                                    <option value="3">3º Lugar</option>
                                    <option value="4">Top 10</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-2 ml-1">Kills</label>
                                <input 
                                    type="number" 
                                    value={winnerKills}
                                    onChange={(e) => setWinnerKills(Number(e.target.value))}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-yellow-500/50"
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full py-4 bg-yellow-600 hover:bg-yellow-500 rounded-xl text-black font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)]">
                            <Save size={18} /> Salvar no Ranking
                        </button>
                    </form>
                </div>

                <div className="space-y-6">
                    <div className="bg-[#121212] border border-white/10 rounded-2xl p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-32 bg-green-500/5 rounded-full blur-3xl -z-10 group-hover:bg-green-500/10 transition-all duration-700" />
                        
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-green-500/10 rounded-xl text-green-500 border border-green-500/20"><Globe size={24} /></div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Sincronização Global</h3>
                                <p className="text-xs text-gray-500">Recalcular Lendas.</p>
                            </div>
                        </div>
                        
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 mb-6">
                            <p className="text-gray-400 text-xs leading-relaxed">
                                <span className="text-white font-bold block mb-1">Como funciona:</span>
                                Esta ferramenta varre <strong className="text-green-400">todo o histórico</strong> de torneios semanais, soma vitórias e kills, e recria a tabela <strong className="text-yellow-400">Lendas Globais</strong> automaticamente.
                            </p>
                        </div>

                        <button 
                            onClick={handleSyncGlobal}
                            disabled={syncing}
                            className={`w-full py-4 rounded-xl font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-2 border ${
                                syncing 
                                    ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed' 
                                    : 'bg-green-600/10 text-green-400 border-green-500/30 hover:bg-green-600 hover:text-black hover:border-green-600 hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]'
                            }`}
                        >
                            <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                            {syncing ? 'Calculando Estatísticas...' : 'Atualizar Ranking Global'}
                        </button>
                    </div>

                    <div className="bg-[#141414] border border-white/5 rounded-2xl p-6">
                         <h4 className="text-sm font-bold text-white uppercase mb-4 flex items-center gap-2">
                            <Swords size={16} className="text-gray-500" /> Dicas de Gestão
                         </h4>
                         <ul className="space-y-3 text-xs text-gray-500">
                            <li className="flex items-start gap-2"><span className="text-yellow-500 mt-0.5">•</span>Cadastre os vencedores assim que o torneio acabar.</li>
                            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">•</span>Rode a "Sincronização" toda segunda-feira para atualizar o Top Server.</li>
                            <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>O "Ranking Global" é 100% automático. Não edite ele manualmente.</li>
                         </ul>
                    </div>
                </div>
            </div>
        )}

        {/* ========================================================== */}
        {/* ABA 3: CAIXA (FINANCEIRO + CALCULADORA) - O NOVO           */}
        {/* ========================================================== */}
        {activeTab === 'financial' && (
            <div className="animate-in fade-in space-y-8">
                
                {/* 1. Visão Geral do Caixa */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#121212] border border-white/5 p-6 rounded-2xl">
                        <div className="flex items-center gap-3 text-green-500 mb-2"><ArrowUpRight/> <span className="font-bold uppercase text-xs">Entradas (Vendas)</span></div>
                        <span className="text-2xl font-mono font-bold text-white">R$ {totalFaturado.toFixed(2)}</span>
                    </div>
                    <div className="bg-[#121212] border border-white/5 p-6 rounded-2xl">
                        <div className="flex items-center gap-3 text-red-500 mb-2"><ArrowDownRight/> <span className="font-bold uppercase text-xs">Saídas (Prêmios)</span></div>
                        <span className="text-2xl font-mono font-bold text-white">R$ {totalDespesas.toFixed(2)}</span>
                    </div>
                    <div className={`bg-[#121212] border border-white/5 p-6 rounded-2xl border-l-4 ${lucroLiquido >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
                        <div className="flex items-center gap-3 text-white mb-2"><DollarSign/> <span className="font-bold uppercase text-xs">Caixa Líquido</span></div>
                        <span className={`text-3xl font-mono font-bold ${lucroLiquido >= 0 ? 'text-green-400' : 'text-red-400'}`}>R$ {lucroLiquido.toFixed(2)}</span>
                    </div>
                </div>

                {/* 2. Calculadora de Lucro */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Controles */}
                    <div className="lg:col-span-1 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-yellow-500/20 rounded-2xl p-6">
                        <h3 className="font-bold text-yellow-400 mb-6 flex items-center gap-2 uppercase"><Calculator size={18}/> Calculadora de Prêmios</h3>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex justify-between">
                                    <span>Porcentagem do 1º Lugar</span>
                                    <span className="text-yellow-400">{prizePercentage}%</span>
                                </label>
                                <input type="range" min="0" max="100" value={prizePercentage} onChange={e => setPrizePercentage(Number(e.target.value))} className="w-full accent-yellow-500 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer" />
                            </div>

                            <div className="p-4 bg-black/40 rounded-xl space-y-2 text-xs text-gray-400 font-mono">
                                <div className="flex justify-between"><span>Base (Faturamento):</span> <span className="text-white">R$ {totalFaturado.toFixed(2)}</span></div>
                                <div className="flex justify-between text-yellow-500"><span>- 1º Lugar ({prizePercentage}%):</span> <span>R$ {premio1.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span>- 2º VIP (Fixo):</span> <span>R$ {premio2.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span>- 3º Ticket (Fixo):</span> <span>R$ {premio3.toFixed(2)}</span></div>
                                <div className="h-px bg-white/10 my-2"></div>
                                <div className="flex justify-between font-bold text-green-400 text-sm"><span>Lucro Guilda:</span> <span>R$ {lucroGuilda.toFixed(2)}</span></div>
                            </div>

                            <button onClick={() => handlePayWinner(premio1)} className="w-full py-3 bg-red-900/20 border border-red-500/50 hover:bg-red-900/40 text-red-400 rounded-xl font-bold uppercase text-xs transition-all flex items-center justify-center gap-2">
                                <DollarSign size={14} /> Pagar 1º Lugar (Registrar Saída)
                            </button>
                        </div>
                    </div>

                    {/* 3. Tabela de Despesas */}
                    <div className="lg:col-span-2 bg-[#121212] border border-white/5 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-white flex items-center gap-2"><ArrowDownRight size={18} className="text-red-500"/> Histórico de Saídas</h3>
                            <form onSubmit={handleAddExpense} className="flex gap-2">
                                <input type="text" placeholder="Desc. (ex: Host)" value={newExpense.desc} onChange={e => setNewExpense({...newExpense, desc: e.target.value})} className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white w-32"/>
                                <input type="number" placeholder="Valor" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white w-20"/>
                                <button className="bg-white/10 hover:bg-white/20 text-white p-1.5 rounded-lg"><Plus size={16}/></button>
                            </form>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="text-gray-500 uppercase bg-white/5"><tr className="border-b border-white/5"><th className="p-3">Data</th><th className="p-3">Descrição</th><th className="p-3 text-right">Valor</th><th className="p-3"></th></tr></thead>
                                <tbody className="divide-y divide-white/5">
                                    {expenses.map(e => (
                                        <tr key={e.id} className="hover:bg-white/[0.02]">
                                            <td className="p-3 text-gray-400">{new Date(e.created_at).toLocaleDateString()}</td>
                                            <td className="p-3 text-white">{e.description} <span className="text-[9px] bg-white/10 px-1 rounded ml-2">{e.category}</span></td>
                                            <td className="p-3 text-right font-mono text-red-400">- R$ {e.amount}</td>
                                            <td className="p-3 text-right"><button onClick={() => handleDeleteExpense(e.id)} className="text-gray-600 hover:text-red-500"><Trash2 size={14}/></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}