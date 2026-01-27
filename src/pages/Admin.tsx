import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, TrendingUp, Users, ShoppingBag, Search, ExternalLink } from 'lucide-react';
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

    // Segurança no Frontend: Se não for você, chuta pra fora
    if (!user || user.email !== ADMIN_EMAIL) {
      toast.error("Área restrita apenas para Admins.");
      navigate('/');
      return;
    }

    // Busca TODOS os pedidos do banco
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
        toast.error("Erro ao buscar dados: " + error.message);
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

  // Filtro da busca
  const filteredOrders = orders.filter(order => 
    order.discord_username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.payment_id?.includes(searchTerm)
  );

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-primary">Carregando Painel...</div>;

  return (
    <div className="min-h-screen bg-background py-8 px-4 font-sans text-foreground bg-[url(@/assets/bg-pattern.png)] bg-fixed">
      <div className="container mx-auto max-w-6xl">
        
        {/* CABEÇALHO */}
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-display font-bold text-red-500 flex items-center gap-2">
                <ShieldAlert className="w-8 h-8" /> PAINEL ADMIN
            </h1>
            <button onClick={() => navigate('/')} className="text-sm text-muted-foreground hover:text-white flex items-center gap-1">
                Sair do Modo Admin <ExternalLink size={14}/>
            </button>
        </div>

        {/* CARDS DE ESTATÍSTICAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Faturamento Total */}
            <div className="rpg-card bg-black/60 border-green-500/30 p-6 flex items-center gap-4">
                <div className="p-4 rounded-full bg-green-500/20 text-green-400">
                    <TrendingUp size={32} />
                </div>
                <div>
                    <p className="text-muted-foreground text-sm uppercase font-bold">Faturamento Total</p>
                    <h2 className="text-3xl font-bold text-white">R$ {totalFaturado.toFixed(2).replace('.', ',')}</h2>
                </div>
            </div>

            {/* Vendas Aprovadas */}
            <div className="rpg-card bg-black/60 border-primary/30 p-6 flex items-center gap-4">
                <div className="p-4 rounded-full bg-primary/20 text-primary">
                    <ShoppingBag size={32} />
                </div>
                <div>
                    <p className="text-muted-foreground text-sm uppercase font-bold">Vendas Aprovadas</p>
                    <h2 className="text-3xl font-bold text-white">{totalVendas}</h2>
                </div>
            </div>

            {/* Pendentes */}
            <div className="rpg-card bg-black/60 border-yellow-500/30 p-6 flex items-center gap-4">
                <div className="p-4 rounded-full bg-yellow-500/20 text-yellow-400">
                    <Users size={32} />
                </div>
                <div>
                    <p className="text-muted-foreground text-sm uppercase font-bold">Aguardando Pagto</p>
                    <h2 className="text-3xl font-bold text-white">{vendasPendentes}</h2>
                </div>
            </div>
        </div>

        {/* TABELA DE PEDIDOS */}
        <div className="rpg-card bg-black/80 backdrop-blur-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Últimas Transações</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Buscar por Nick ou ID..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-black/50 border border-white/10 rounded-lg text-sm focus:border-primary/50 outline-none w-64"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-white/10 text-muted-foreground uppercase text-xs">
                            <th className="pb-3 pl-2">Data</th>
                            <th className="pb-3">Cliente (Discord)</th>
                            <th className="pb-3">Itens</th>
                            <th className="pb-3">Valor</th>
                            <th className="pb-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                                <td className="py-4 pl-2 font-mono text-gray-400">
                                    {new Date(order.created_at).toLocaleDateString()} <br/>
                                    <span className="text-[10px] opacity-50">{new Date(order.created_at).toLocaleTimeString()}</span>
                                </td>
                                <td className="py-4">
                                    <div className="font-bold text-white">{order.discord_username || "Visitante"}</div>
                                    <div className="text-[10px] text-muted-foreground font-mono">{order.payment_id}</div>
                                </td>
                                <td className="py-4 text-gray-300">
                                    {order.items.map((i: any) => i.title).join(", ")}
                                </td>
                                <td className="py-4 font-mono text-primary">
                                    R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}
                                </td>
                                <td className="py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold border ${
                                        order.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                                        order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                                        'bg-red-500/10 text-red-400 border-red-500/20'
                                    }`}>
                                        {order.status === 'approved' ? 'APROVADO' : order.status === 'pending' ? 'PENDENTE' : order.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {filteredOrders.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">Nenhum pedido encontrado.</div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}