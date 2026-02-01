import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { 
  Package, Clock, CheckCircle, XCircle, Calendar, ArrowLeft, 
  Tag, Wallet, ShoppingBag, Truck 
} from 'lucide-react';

// --- CONFIGURAÇÃO SUPABASE SEGURA ---
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function MyOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/'); 
      return;
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id) 
      .order('created_at', { ascending: false });

    if (data) setOrders(data);
    setLoading(false);
  }

  // Cálculos de Estatísticas
  const totalSpent = orders.reduce((acc, order) => order.status === 'approved' ? acc + (Number(order.total_amount) || 0) : acc, 0);
  const totalOrders = orders.length;
  const activeOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8 px-4 font-sans text-foreground overflow-hidden relative">
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto max-w-5xl relative z-10">
        
        {/* --- HEADER DA PÁGINA --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/')} className="group p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all hover:scale-105">
                    <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white" />
                </button>
                <div>
                    <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
                       <Truck className="w-8 h-8 text-green-500" /> Histórico de Drop
                    </h1>
                    <p className="text-sm text-gray-500">Gerencie suas aquisições da guilda.</p>
                </div>
            </div>
        </div>

        {/* --- STATS CARDS --- */}
        {!loading && orders.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-[#121212] border border-white/5 p-5 rounded-xl flex items-center gap-4 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Wallet size={60} /></div>
                    <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20 text-green-500"><Wallet size={24} /></div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Investido</p>
                        <p className="text-2xl font-bold text-white">R$ {totalSpent.toFixed(2).replace('.', ',')}</p>
                    </div>
                </div>
                <div className="bg-[#121212] border border-white/5 p-5 rounded-xl flex items-center gap-4 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><ShoppingBag size={60} /></div>
                    <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20 text-orange-500"><ShoppingBag size={24} /></div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total de Pedidos</p>
                        <p className="text-2xl font-bold text-white">{totalOrders}</p>
                    </div>
                </div>
                <div className="bg-[#121212] border border-white/5 p-5 rounded-xl flex items-center gap-4 relative overflow-hidden group">
                      <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Clock size={60} /></div>
                      <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 text-blue-500"><Clock size={24} /></div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Em Processamento</p>
                        <p className="text-2xl font-bold text-white">{activeOrders}</p>
                    </div>
                </div>
            </div>
        )}

        {loading ? (
           <div className="space-y-4">
               {[1,2,3].map(i => (
                   <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse border border-white/5" />
               ))}
           </div>
        ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-[#121212] border border-dashed border-white/10 rounded-2xl">
               <div className="p-6 bg-white/5 rounded-full mb-4 animate-pulse">
                   <Package className="w-12 h-12 text-gray-500" />
               </div>
               <h3 className="text-xl font-bold mb-2 text-white">Inventário Vazio</h3>
               <p className="text-gray-500 mb-6">Você ainda não adquiriu nenhum item da guilda.</p>
               <button onClick={() => navigate('/')} className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors">
                   Ir para a Loja
               </button>
            </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order, index) => (
              <div 
                key={order.id} 
                className="group bg-[#121212] hover:bg-[#161616] border border-white/5 hover:border-green-500/30 rounded-xl overflow-hidden transition-all duration-300 shadow-lg relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Status Bar Lateral */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${
                     order.status === 'approved' ? 'bg-green-500' :
                     order.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />

                {/* --- HEADER DO CARD --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-5 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex flex-col gap-1 pl-2">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Pedido</span>
                            <span className="text-sm font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded">#{order.payment_id || order.id.slice(0,8)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(order.created_at).toLocaleDateString()} às {new Date(order.created_at).toLocaleTimeString().slice(0,5)}
                        </div>
                    </div>
                    
                    <div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 uppercase tracking-wide border ${
                        order.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                        {order.status === 'approved' && <CheckCircle className="w-3.5 h-3.5" />}
                        {order.status === 'pending' && <Clock className="w-3.5 h-3.5 animate-pulse" />}
                        {order.status === 'cancelled' && <XCircle className="w-3.5 h-3.5" />}
                        {order.status === 'approved' ? 'Entregue' : order.status === 'pending' ? 'Processando' : 'Cancelado'}
                    </div>
                </div>

                {/* --- CONTEÚDO (ITENS) --- */}
                <div className="p-5 pl-7 space-y-4">
                    {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center p-2">
                                <img src={item.image} alt="Item" className="w-full h-full object-contain drop-shadow-sm" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-sm text-gray-200 group-hover:text-white transition-colors">{item.title}</p>
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Qtd: {item.quantity}x</p>
                            </div>
                            <div className="text-sm font-bold text-gray-400">
                                R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- FOOTER (TOTAIS) --- */}
                <div className="bg-black/20 p-4 pl-7 flex flex-col items-end gap-1 border-t border-white/5">
                    {order.coupon_used && (
                      <div className="flex items-center gap-1.5 text-[10px] text-green-400 font-bold bg-green-500/10 px-2 py-1 rounded border border-green-500/20 mb-1">
                        <Tag className="w-3 h-3" />
                        CUPOM: {order.coupon_used.toUpperCase()}
                      </div>
                    )}
                    <div className="flex items-baseline gap-2">
                        <span className="text-xs text-gray-500 font-bold uppercase">Total do Pedido</span>
                        <span className="text-xl font-bold text-white text-shadow-sm">
                           R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}
                        </span>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}