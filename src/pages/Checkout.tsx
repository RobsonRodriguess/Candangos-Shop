import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { 
  ArrowLeft, Trash2, Minus, Plus, Check, Mail, Gamepad2, 
  Copy, ExternalLink, QrCode, ShieldCheck, User, CreditCard, Wallet 
} from 'lucide-react';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';
import emailjs from '@emailjs/browser';
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabase = createClient(
  'https://vrlswaqvswzcapbzshcp.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZybHN3YXF2c3d6Y2FwYnpzaGNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0ODI1NjYsImV4cCI6MjA4NTA1ODU2Nn0.YooTRks2-zy4hqAIpSQmhDpTCf134QHrzl7Ry5TbKn8'
);

// SEU ID CORRETO DO EMAILJS
const SERVICE_ID = "service_eem5brc"; 
const TEMPLATE_ID = "template_pk19neg";
const PUBLIC_KEY = "z5D7x94VJzfiiK8tk";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'cart' | 'info' | 'payment' | 'pix_waiting' | 'success'>('cart');
  
  // Dados do PIX
  const [pixData, setPixData] = useState<{ qr_code: string, qr_code_base64: string, payment_id: number } | null>(null);

  // Formulário
  const [formData, setFormData] = useState({ username: '', email: '', confirmEmail: '' });
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | null>(null);

  // PREENCHIMENTO AUTOMÁTICO SE ESTIVER LOGADO
  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setFormData(prev => ({
          ...prev,
          email: user.email || '',
          confirmEmail: user.email || '',
          username: user.user_metadata.full_name || user.user_metadata.name || prev.username
        }));
      }
    };
    loadUserData();
  }, []);

  // --- ROBÔ DE VERIFICAÇÃO DO PIX ---
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (step === 'pix_waiting' && pixData?.payment_id) {
      interval = setInterval(async () => {
        try {
          const check = await supabase.functions.invoke(`checkout?action=check_status`, {
            body: { payment_id: pixData.payment_id }
          });

          if (check.data?.status === 'approved') {
             clearInterval(interval);
             finishOrder(check.data.status, pixData.payment_id);
          }
        } catch (e) {
          console.error("Verificando pix...", e);
        }
      }, 4000); 
    }

    return () => clearInterval(interval);
  }, [step, pixData]);

  // --- HANDLERS ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateInfo = () => {
    if (!formData.username.trim()) { toast.error('Digite seu nick'); return false; }
    if (!formData.email.trim() || !formData.email.includes('@')) { toast.error('Email inválido'); return false; }
    if (formData.email !== formData.confirmEmail) { toast.error('Emails não coincidem'); return false; }
    return true;
  };

  const startPayment = async () => {
    if (!paymentMethod) { toast.error('Selecione um método de pagamento'); return; }
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('checkout', {
        body: {
          items: items,
          buyer_name: formData.username, 
          buyer_email: formData.email,
          payment_method: paymentMethod
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      if (data.type === 'pix_generated') {
        setPixData(data);
        setStep('pix_waiting');
      } 
      else if (data.type === 'redirect') {
        window.location.href = data.url;
      }

    } catch (error: any) {
      console.error('Erro no processamento:', error);
      toast.error(error.message || 'Erro ao processar pagamento.');
    } finally {
      setIsProcessing(false);
    }
  };

  // --- AQUI QUE A MÁGICA DO BANCO DE DADOS ACONTECE ---
  const finishOrder = async (status: string, paymentId: any) => {
      setStep('success');
      
      try {
        const { data: { user } } = await supabase.auth.getUser();

        const { error: dbError } = await supabase
          .from('orders')
          .insert({
            user_id: user?.id || null, 
            payment_id: String(paymentId),
            status: status,
            total_amount: totalPrice,
            items: items, 
            discord_username: formData.username
          });

        if (dbError) {
            console.error("Erro ao salvar no banco:", dbError);
        } else {
            console.log("Pedido salvo no banco com sucesso!");
        }

        const itemsListString = items.map(item => `${item.quantity}x ${item.title}`).join(", ");
        const totalFormatted = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
        
        await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
            to_name: formData.username,
            to_email: formData.email,
            status: `APROVADO ✅ (ID: ${paymentId})`,
            total_value: totalFormatted,
            items_list: itemsListString,
        }, PUBLIC_KEY);
        
        clearCart();
        toast.success("Pedido confirmado e salvo!");

      } catch (err) {
        console.warn("Erro no processo final:", err);
      }
  };

  const copyPixCode = () => {
    if (pixData?.qr_code) {
      navigator.clipboard.writeText(pixData.qr_code);
      toast.success("Código Pix copiado!");
    }
  };

  // --- RENDERIZAÇÃO ---

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 bg-[url(@/assets/bg-pattern.png)] bg-cover">
        <div className="max-w-md w-full rpg-card text-center animate-scale-in border-green-500/30 bg-black/80 backdrop-blur-md p-8">
          <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
            <Check className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-2">Pagamento Aprovado!</h2>
          <p className="text-muted-foreground mb-8">Recebemos sua confirmação. O histórico foi salvo na sua conta.</p>
          <button onClick={() => { navigate('/'); setStep('cart'); clearCart(); }} className="rpg-button w-full py-4 text-lg">Voltar à Loja</button>
        </div>
      </div>
    );
  }

  // Carrinho Vazio
  if (items.length === 0 && step !== 'pix_waiting') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-center opacity-50">
          <Wallet className="w-20 h-20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Seu inventário está vazio</h2>
        </div>
        <button onClick={() => navigate('/')} className="rpg-button flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Voltar às Compras
        </button>
      </div>
    );
  }

  // Steps Visualizer
  const renderSteps = () => (
    <div className="flex justify-between items-center mb-8 px-2 relative">
      <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -z-10 rounded-full" />
      {[
        { id: 'cart', label: 'Carrinho', icon: Wallet },
        { id: 'info', label: 'Dados', icon: User },
        { id: 'payment', label: 'Pagamento', icon: CreditCard }
      ].map((s, idx) => {
        const isActive = step === s.id || step === 'pix_waiting';
        const isPast = ['cart', 'info', 'payment'].indexOf(step) > idx;
        return (
          <div key={s.id} className={`flex flex-col items-center gap-2 transition-all ${isActive || isPast ? 'opacity-100' : 'opacity-40'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isActive || isPast ? 'bg-primary border-primary text-black' : 'bg-black border-white/20 text-white'} transition-colors`}>
              <s.icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">{s.label}</span>
          </div>
        )
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-8 px-4 font-sans text-foreground">
      <div className="container mx-auto max-w-5xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => step === 'cart' ? navigate('/') : setStep(prev => prev === 'payment' ? 'info' : 'cart')} 
                  className="hover:text-primary transition-colors flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" /> <span className="hidden sm:inline">Voltar</span>
          </button>
          <img src={logo} alt="Hywer" className="h-8 w-auto opacity-80" />
        </div>

        {renderSteps()}

        {/* Layout Grid (Empilha no mobile, divide no PC) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          
          {/* LADO ESQUERDO (Formulários) */}
          <div className="space-y-6">
            
            {/* ETAPA 1: CARRINHO */}
            {step === 'cart' && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500 space-y-4">
                <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
                  <Wallet className="text-primary" /> Seus Itens
                </h2>
                {items.map((item) => (
                  // RESPONSIVIDADE AQUI: Flex-col no mobile, flex-row no PC
                  <div key={item.id} className="rpg-card group hover:border-primary/50 transition-colors p-4 flex flex-col sm:flex-row items-center gap-4 bg-black/40 backdrop-blur-sm">
                    {/* Imagem centralizada no mobile */}
                    <div className="w-20 h-20 shrink-0 rounded bg-gradient-to-br from-black to-gray-900 border border-white/10 flex items-center justify-center p-2">
                      <img src={item.image} alt={item.title} className="w-full h-full object-contain drop-shadow-lg" />
                    </div>
                    
                    {/* Texto centralizado no mobile */}
                    <div className="flex-1 w-full text-center sm:text-left">
                      <h4 className="font-bold text-lg">{item.title}</h4>
                      <p className="text-primary font-bold">R$ {item.price.toFixed(2).replace('.', ',')}</p>
                    </div>

                    {/* Controles: Espalhados no mobile */}
                    <div className="flex items-center justify-center gap-4 w-full sm:w-auto">
                        <div className="flex items-center gap-3 bg-black/50 rounded-lg p-1 border border-white/5">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 hover:bg-white/10 rounded"><Minus className="w-4 h-4" /></button>
                            <span className="w-6 text-center font-bold">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:bg-white/10 rounded"><Plus className="w-4 h-4" /></button>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="p-3 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                ))}
                <div className="pt-4">
                   <button onClick={() => setStep('info')} className="rpg-button w-full py-4 text-lg">Continuar para Dados</button>
                </div>
              </div>
            )}

            {/* ETAPA 2: DADOS */}
            {step === 'info' && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
                  <User className="text-primary" /> Identificação
                </h2>
                <div className="rpg-card bg-black/40 backdrop-blur-sm p-6 space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground uppercase font-bold tracking-wider">Nick no Servidor</label>
                    <div className="relative">
                      <Gamepad2 className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                      <input 
                        type="text" 
                        name="username" 
                        value={formData.username} 
                        onChange={handleInputChange} 
                        placeholder="Ex: RobsonGamer" 
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/50 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary outline-none transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground uppercase font-bold tracking-wider">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                        <input 
                          type="email" 
                          name="email" 
                          value={formData.email} 
                          onChange={handleInputChange} 
                          placeholder="seu@email.com" 
                          className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/50 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground uppercase font-bold tracking-wider">Confirmar Email</label>
                      <div className="relative">
                        <Check className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                        <input 
                          type="email" 
                          name="confirmEmail" 
                          value={formData.confirmEmail} 
                          onChange={handleInputChange} 
                          placeholder="Confirme o email" 
                          className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/50 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <button onClick={() => validateInfo() && setStep('payment')} className="rpg-button w-full py-4 text-lg mt-4">Confirmar Dados</button>
                </div>
              </div>
            )}

            {/* ETAPA 3: PAGAMENTO (ESCOLHA) */}
            {step === 'payment' && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
                  <CreditCard className="text-primary" /> Método de Pagamento
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Botão PIX */}
                  <button 
                    onClick={() => setPaymentMethod('pix')} 
                    className={`relative p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 group overflow-hidden ${
                      paymentMethod === 'pix' 
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                      : 'border-white/10 bg-black/40 hover:border-emerald-500/50 hover:bg-black/60'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${paymentMethod === 'pix' ? 'bg-emerald-500 text-black' : 'bg-white/5 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black'}`}>
                      <QrCode className="w-7 h-7" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold text-lg">PIX</h3>
                      <p className="text-sm text-muted-foreground">Aprovação Imediata</p>
                    </div>
                    {paymentMethod === 'pix' && <div className="absolute top-3 right-3 text-emerald-500"><Check className="w-5 h-5"/></div>}
                  </button>

                  {/* Botão CARTÃO */}
                  <button 
                    onClick={() => setPaymentMethod('card')} 
                    className={`relative p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 group overflow-hidden ${
                      paymentMethod === 'card' 
                      ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]' 
                      : 'border-white/10 bg-black/40 hover:border-blue-500/50 hover:bg-black/60'
                    }`}
                  >
                     <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${paymentMethod === 'card' ? 'bg-blue-500 text-white' : 'bg-white/5 text-blue-500 group-hover:bg-blue-500 group-hover:text-white'}`}>
                      <CreditCard className="w-7 h-7" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold text-lg">Cartão</h3>
                      <p className="text-sm text-muted-foreground">Crédito e Débito</p>
                    </div>
                    {paymentMethod === 'card' && <div className="absolute top-3 right-3 text-blue-500"><Check className="w-5 h-5"/></div>}
                  </button>
                </div>

                <div className="rpg-card bg-black/40 border-primary/20 p-6 text-center">
                   {!paymentMethod ? (
                     <p className="text-muted-foreground py-2">Selecione uma opção acima para continuar.</p>
                   ) : (
                     <div className="animate-in fade-in slide-in-from-bottom-2">
                        <p className="mb-4 text-sm text-muted-foreground max-w-md mx-auto">
                          Você será redirecionado para o ambiente seguro do <b>Mercado Pago</b>.
                          {paymentMethod === 'pix' ? ' O QR Code será gerado na próxima tela.' : ''}
                        </p>
                        <button 
                          onClick={startPayment}
                          disabled={isProcessing}
                          className="rpg-button w-full py-4 text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/20"
                        >
                          {isProcessing ? (
                            <>
                              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"/>
                              Processando...
                            </>
                          ) : (
                            <>
                              {paymentMethod === 'pix' ? 'Gerar QR Code' : 'Pagar com Cartão'} <ExternalLink className="w-5 h-5" />
                            </>
                          )}
                        </button>
                     </div>
                   )}
                </div>
              </div>
            )}

            {/* ETAPA 4: PIX ESPERANDO (Tela Exclusiva) */}
            {step === 'pix_waiting' && pixData && (
               <div className="animate-in zoom-in duration-300">
                  <div className="rpg-card border-emerald-500/50 bg-black/80 p-8 text-center max-w-md mx-auto shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                     <h2 className="text-2xl font-display font-bold text-white mb-2">Escaneie o QR Code</h2>
                     <p className="text-emerald-400 text-sm mb-6 font-medium">Abra o app do seu banco e pague via Pix.</p>
                     
                     <div className="bg-white p-4 rounded-xl mx-auto w-fit mb-6 shadow-inner">
                        <img src={`data:image/png;base64,${pixData.qr_code_base64}`} alt="QR Code Pix" className="w-56 h-56 object-contain max-w-full" />
                     </div>

                     <div className="space-y-4">
                         <div className="relative">
                            <input readOnly value={pixData.qr_code} className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-xs text-muted-foreground truncate" />
                            <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black to-transparent pointer-events-none" />
                         </div>
                         <button onClick={copyPixCode} className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]">
                            <Copy className="w-5 h-5" /> Copiar Código Pix
                         </button>
                     </div>

                     <div className="mt-8 flex items-center justify-center gap-2 text-sm text-yellow-500/80 animate-pulse bg-yellow-500/5 py-2 rounded-full">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"/>
                        Aguardando confirmação automática...
                     </div>
                  </div>
               </div>
            )}
          </div>

          {/* LADO DIREITO (RESUMO) */}
          {/* Mantém a altura automática para não quebrar no mobile */}
          <div className="h-fit space-y-4">
            <div className="rpg-card lg:sticky lg:top-8 bg-black/60 backdrop-blur-xl border-gold/20 p-6 shadow-2xl">
              <h3 className="text-xl font-display font-bold mb-6 pb-4 border-b border-white/10 flex items-center gap-2">
                <ShieldCheck className="text-primary w-5 h-5"/> Resumo do Pedido
              </h3>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-start text-sm group">
                    <span className="text-muted-foreground group-hover:text-white transition-colors">
                      <span className="text-primary font-bold">{item.quantity}x</span> {item.title}
                    </span>
                    <span className="font-mono text-white/80">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex justify-between text-muted-foreground text-sm">
                  <span>Subtotal</span>
                  <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between items-center font-bold text-xl text-primary pt-2">
                  <span>Total</span>
                  <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              <div className="mt-6 text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Pagamento 100% Seguro
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;