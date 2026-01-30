import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, TrendingUp, Users, ShoppingBag, Search, ExternalLink, 
  LayoutDashboard, CreditCard, Calendar, ArrowUpRight, AlertCircle, LogOut 
} from 'lucide-react';
import { toast } from 'sonner';

// Configuração Supabase
const supabase = createClient(
  'https://vrlswaqvswzcapbzshcp.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZybHN3YXF2c3d6Y2FwYnpzaGNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0ODI1NjYsImV4cCI6MjA4NTA1ODU2Nn0.YooTRks2-zy4hqAIpSQmhDpTCf134QHrzl7Ry5TbKn8'
);

// Mude para o SEU email de admin
const ADMIN_EMAIL = 'vinicciusdede@gmail.com'; 

export default function Admin() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  async function checkAdminAndFetch() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== ADMIN_EMAIL) {
      toast.error("Acesso Negado", { description: "Esta área é restrita a oficiais da guilda." });
      navigate('/');
      return;
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
        toast.error("Erro ao carregar dados", { description: error.message });
    } else {
        setOrders(data || []);
    }
    setLoading(false);
  }

  // --- CÁLCULOS FINANCEIROS ---
  const totalFaturado = orders
    .filter(o => o.status === 'approved')
    .reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);

  const totalVendas = orders.filter(o => o.status === 'approved').length;
  const vendasPendentes = orders.filter(o => o.status === 'pending').length;

  // Filtragem
  const filteredOrders = orders.filter(order => 
    order.discord_username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.payment_id?.includes(searchTerm) ||
    order.buyer_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4 text-green-500">
        <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>
        <p className="font-mono text-sm tracking-widest uppercase animate-pulse">Acessando Mainframe...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-foreground relative overflow-hidden">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* --- SIDEBAR / HEADER HÍBRIDO --- */}
      {/* Para manter simples, faremos um Header robusto */}
      <div className="border-b border-white/5 bg-[#121212]/50 backdrop-blur-xl sticky top-0 z-30">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center border border-red-500/20">
                    <ShieldAlert className="w-6 h-6 text-red-500" />
                </div>
                <div>
                    <h1 className="text-xl font-display font-bold text-white tracking-wide">
                        Painel Admin
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs text-gray-500 font-mono uppercase">Sistema Operacional</span>
                    </div>
                </div>
            </div>

            <button 
                onClick={() => navigate('/')} 
                className="group flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-all text-sm font-bold text-gray-400"
            >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair do Modo Admin</span>
            </button>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* --- DASHBOARD STATS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            
            {/* Card Faturamento */}
            <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-green-500/30 transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-500/10 transition-all" />
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20 text-green-500">
                        <TrendingUp size={24} />
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-green-400 bg-green-900/20 px-2 py-1 rounded">
                        <ArrowUpRight size={12} /> Receita
                    </span>
                </div>
                <div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Faturamento Total</p>
                    <h2 className="text-3xl font-display font-bold text-white">
                        R$ {totalFaturado.toFixed(2).replace('.', ',')}
                    </h2>
                </div>
            </div>

            {/* Card Vendas */}
            <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all" />
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-500">
                        <ShoppingBag size={24} />
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-blue-400 bg-blue-900/20 px-2 py-1 rounded">
                        <LayoutDashboard size={12} /> Volume
                    </span>
                </div>
                <div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Vendas Aprovadas</p>
                    <h2 className="text-3xl font-display font-bold text-white">
                        {totalVendas} <span className="text-sm font-sans text-gray-600 font-normal">pedidos</span>
                    </h2>
                </div>
            </div>

            {/* Card Pendentes */}
            <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-yellow-500/30 transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl group-hover:bg-yellow-500/10 transition-all" />
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20 text-yellow-500">
                        <AlertCircle size={24} />
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded">
                        <Users size={12} /> Ação Necessária
                    </span>
                </div>
                <div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Aguardando Pagamento</p>
                    <h2 className="text-3xl font-display font-bold text-white">
                        {vendasPendentes} <span className="text-sm font-sans text-gray-600 font-normal">pedidos</span>
                    </h2>
                </div>
            </div>
        </div>

        {/* --- DATA TABLE AREA --- */}
        <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            
            {/* Toolbar */}
            <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#141414]">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    Transações Recentes
                </h3>
                
                <div className="relative w-full md:w-auto group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Buscar Nick, Email ou ID..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-lg text-sm focus:border-white/20 outline-none w-full md:w-80 text-white placeholder:text-gray-600 transition-all"
                    />
                </div>
            </div>

            {/* Tabela */}
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
                                    <div className="flex items-center gap-2 text-gray-300 font-medium">
                                        <Calendar className="w-3.5 h-3.5 text-gray-600" />
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="text-[10px] text-gray-600 font-mono mt-1 uppercase">
                                        #{order.payment_id}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center overflow-hidden">
                                            {order.user_avatar ? (
                                                <img src={order.user_avatar} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <Users className="w-4 h-4 text-gray-600" />
                                            )}
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
                                                <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                                {i.title} <span className="opacity-50">x{i.quantity}</span>
                                            </span>
                                        ))}
                                        {order.items.length > 2 && (
                                            <span className="text-[10px] text-gray-600 pl-2.5">
                                                +{order.items.length - 2} outros itens...
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="font-mono font-bold text-white text-base">
                                        R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`
                                        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border
                                        ${order.status === 'approved' 
                                            ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]' 
                                            : order.status === 'pending' 
                                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' 
                                            : 'bg-red-500/10 text-red-400 border-red-500/20'}
                                    `}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                            order.status === 'approved' ? 'bg-green-400' : 
                                            order.status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'
                                        }`}></span>
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
                        <p className="text-sm">Nenhum registro encontrado no banco de dados.</p>
                    </div>
                )}
            </div>
            
            {/* Footer da Tabela */}
            <div className="bg-[#141414] border-t border-white/5 p-4 text-[10px] text-gray-600 flex justify-between items-center font-mono">
                <span>MOSTRANDO {filteredOrders.length} REGISTROS</span>
                <span>ADMIN SECURE CONNECTION_V1.0</span>
            </div>
        </div>

      </div>
    </div>
  );
}