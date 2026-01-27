import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, Calendar, ArrowLeft } from 'lucide-react';

// Configuração do Supabase
const supabase = createClient(
  'https://vrlswaqvswzcapbzshcp.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZybHN3YXF2c3d6Y2FwYnpzaGNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0ODI1NjYsImV4cCI6MjA4NTA1ODU2Nn0.YooTRks2-zy4hqAIpSQmhDpTCf134QHrzl7Ry5TbKn8'
);

export default function MyOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    // 1. Pega o usuário logado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/'); // Se não tiver logado, chuta pra home
      return;
    }

    // 2. Busca os pedidos DELE
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id) // Só os pedidos DESSE usuário
      .order('created_at', { ascending: false }); // Do mais novo pro mais velho

    if (data) setOrders(data);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background py-10 px-4 font-sans text-foreground bg-[url(@/assets/bg-pattern.png)] bg-fixed bg-cover">
      <div className="container mx-auto max-w-4xl">
        
        <div className="flex items-center gap-4 mb-8">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-display font-bold text-gold-gradient flex items-center gap-2">
            <Package className="w-8 h-8 text-primary" /> Meus Pedidos
            </h1>
        </div>

        {loading ? (
           <div className="text-center py-20 animate-pulse">Carregando histórico...</div>
        ) : orders.length === 0 ? (
           <div className="rpg-card bg-black/60 p-10 text-center">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Nenhum pedido encontrado</h3>
              <p className="text-muted-foreground">Você ainda não comprou nada na nossa loja.</p>
           </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rpg-card bg-black/60 hover:border-primary/40 transition-all p-6 group">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 border-b border-white/5 pb-4">
                    <div>
                        <div className="text-xs text-muted-foreground font-mono mb-1 uppercase tracking-wider">ID do Pedido: {order.payment_id}</div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Calendar className="w-4 h-4" />
                            {new Date(order.created_at).toLocaleDateString()} às {new Date(order.created_at).toLocaleTimeString()}
                        </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className={`px-4 py-1 rounded-full text-sm font-bold flex items-center gap-2 w-fit ${
                        order.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                        'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                        {order.status === 'approved' && <CheckCircle className="w-4 h-4" />}
                        {order.status === 'pending' && <Clock className="w-4 h-4" />}
                        {order.status === 'cancelled' && <XCircle className="w-4 h-4" />}
                        {order.status === 'approved' ? 'APROVADO' : order.status === 'pending' ? 'PENDENTE' : 'CANCELADO'}
                    </div>
                </div>

                {/* Lista de Itens */}
                <div className="space-y-3">
                    {order.items.map((item: any, index: number) => (
                        <div key={index} className="flex items-center gap-4 bg-black/40 p-3 rounded-lg">
                            <img src={item.image} alt="Item" className="w-10 h-10 object-contain" />
                            <div className="flex-1">
                                <p className="font-bold text-sm text-white">{item.title}</p>
                                <p className="text-xs text-muted-foreground">Qtd: {item.quantity}</p>
                            </div>
                            <div className="font-mono text-primary text-sm">
                                R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex justify-end pt-2">
                    <span className="text-lg font-bold text-white">Total: <span className="text-primary">R$ {order.total_amount.toFixed(2).replace('.', ',')}</span></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}