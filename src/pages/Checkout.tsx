import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { 
  ArrowLeft, Trash2, Minus, Plus, Check, Mail, Gamepad2, 
  Copy, ExternalLink, QrCode, ShieldCheck, User, CreditCard, Wallet, Tag, Sparkles, Lock, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';
import { createClient } from '@supabase/supabase-js';

// Configuração Supabase

const supabase = createClient(
'https://vrlswaqvswzcapbzshcp.supabase.co',
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZybHN3YXF2c3d6Y2FwYnpzaGNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0ODI1NjYsImV4cCI6MjA4NTA1ODU2Nn0.YooTRks2-zy4hqAIpSQmhDpTCf134QHrzl7Ry5TbKn8'
);

// Configuração EmailJS
const SERVICE_ID = "service_eem5brc"; 
const TEMPLATE_ID = "template_pk19neg";
const PUBLIC_KEY = "z5D7x94VJzfiiK8tk";

// Função auxiliar de email (Mantida original)
const generateEmailHTML = (userName: string, items: any[], total: string, paymentId: string) => {
  const date = new Date().toLocaleDateString('pt-BR');
  const logoUrl = "https://media.discordapp.net/attachments/1057787918468526131/1465732500067455121/4dd4da52fa571380fa2d4f269867c2f5_logo.png?ex=697a2d44&is=6978dbc4&hm=b73af4519f72ba7c6d1a6cc4a04f67b9f4588932803e79e908af9fe3cf373786&=&format=webp&quality=lossless";

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #27272a; width: 60px;">
        <img src="${item.image}" alt="${item.title}" width="48" height="48" style="border-radius: 8px; object-fit: cover; border: 1px solid #3f3f46; display: block;" />
      </td>
      <td style="padding: 12px 15px; border-bottom: 1px solid #27272a; color: #e4e4e7; font-family: 'Segoe UI', sans-serif;">
        <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${item.title}</div>
        <div style="color: #71717a; font-size: 12px;">Qtd: ${item.quantity}</div>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #27272a; text-align: right; color: #fff; font-weight: 600; font-family: 'Segoe UI', sans-serif; white-space: nowrap;">
        R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}
      </td>
    </tr>
  `).join('');

  return `
    <div style="background-color: #000000; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px 10px;">
      <div style="max-width: 480px; margin: 0 auto; background-color: #09090b; border-radius: 16px; border: 1px solid #27272a; overflow: hidden; box-shadow: 0 10px 40px -10px rgba(74, 222, 128, 0.2);">
        <div style="background-color: #18181b; padding: 30px 20px; text-align: center; border-bottom: 2px solid #4ade80;">
          <img src="${logoUrl}" width="70" style="margin-bottom: 15px; border-radius: 12px;">
          <h1 style="color: #4ade80; margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Pagamento Confirmado</h1>
          <p style="color: #a1a1aa; margin-top: 8px; font-size: 14px;">Olá, <span style="color: #fff;">${userName}</span>! Obrigado pela compra.</p>
        </div>
        <div style="padding: 30px 25px;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            ${itemsHtml}
          </table>
          <div style="text-align: right; margin-bottom: 30px;">
            <p style="color: #71717a; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 1px;">Valor Total</p>
            <p style="color: #4ade80; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -1px;">${total}</p>
          </div>
          <div style="background-color: #18181b; border-radius: 8px; padding: 15px; text-align: center; color: #52525b; font-size: 11px; margin-bottom: 25px;">
            <p style="margin: 0 0 5px 0;">ID da Transação: <span style="color: #a1a1aa; font-family: monospace;">#${paymentId}</span></p>
            <p style="margin: 0;">Data: <span style="color: #a1a1aa;">${date}</span></p>
          </div>
          <div style="text-align: center;">
            <a href="https://discord.gg/Hcu7y4Cz" style="background-color: #5865F2; color: #fff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
              Entrar na Comunidade VIP
            </a>
          </div>
        </div>
        <div style="background-color: #09090b; padding: 15px; text-align: center; border-top: 1px solid #27272a;">
          <p style="color: #3f3f46; font-size: 11px; margin: 0;">© 2026 Hywer Store. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  `;
};

const Checkout = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'cart' | 'info' | 'payment' | 'pix_waiting' | 'success'>('cart');
  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false);
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string, discount: number } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const discountAmount = appliedCoupon ? (totalPrice * (appliedCoupon.discount / 100)) : 0;
  const finalTotal = totalPrice - discountAmount;

  const [pixData, setPixData] = useState<{ qr_code: string, qr_code_base64: string, payment_id: number } | null>(null);
  const [formData, setFormData] = useState({ username: '', email: '', confirmEmail: '' });
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserLoggedIn(true);
        setFormData(prev => ({
          ...prev,
          email: user.email || '',
          confirmEmail: user.email || '',
          username: user.user_metadata.full_name || user.user_metadata.name || prev.username
        }));
      } else {
        setUserLoggedIn(false);
      }
    };
    loadUserData();
  }, []);

  const handleDiscordLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: { redirectTo: window.location.href }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error("Erro ao invocar o Discord: " + error.message);
    }
  };

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
        } catch (e) { console.error("Verificando pix...", e); }
      }, 4000); 
    }
    return () => clearInterval(interval);
  }, [step, pixData]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true);
    try {
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase().trim())
        .eq('active', true)
        .single();

      if (error || !coupon) {
        toast.error("Cupom inválido ou expirado.");
        setAppliedCoupon(null);
        return;
      }

      const { data: alreadyUsed } = await supabase
        .from('orders')
        .select('id')
        .eq('buyer_email', formData.email)
        .eq('coupon_used', couponCode.toUpperCase().trim())
        .eq('status', 'approved')
        .maybeSingle();

      if (alreadyUsed) {
        toast.error("Você já usou este cupom.");
        return;
      }

      if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
        toast.error("Cupom esgotado.");
        return;
      }

      setAppliedCoupon({ code: coupon.code, discount: coupon.discount_percent });
      toast.success(`Cupom ${coupon.code} aplicado!`);
      
    } catch (err) {
      toast.error("Erro ao validar cupom.");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateInfo = () => {
    if (!formData.username.trim()) { toast.error('Digite seu nick'); return false; }
    if (!formData.email.trim() || !formData.email.includes('@')) { toast.error('Email inválido'); return false; }
    if (formData.email !== formData.confirmEmail) { toast.error('Emails não coincidem'); return false; }
    return true;
  };

const checkEventEligibility = async () => {
  // Identifica o ticket pelo ID 1 ou pelo nome conforme seu banco
  const hasEventTicket = items.some(item => item.id === 1 || item.title.includes("Inscrição"));
  if (!hasEventTicket) return true;

  // Busca pedidos APROVADOS para o e-mail digitado no checkout
  const { data, error } = await supabase
    .from('orders')
    .select('items')
    .eq('buyer_email', formData.email.trim())
    .eq('status', 'approved');

  if (error) return true;

  // Verifica se o ticket já existe em alguma compra anterior
  const alreadyBought = data?.some(order => 
    Array.isArray(order.items) && order.items.some((i: any) => i.title.includes("Inscrição") || i.id === 1)
  );

  if (alreadyBought) {
    toast.error("LIMITE EXCEDIDO!", {
      description: "Você já possui uma inscrição aprovada para este Torneio."
    });
    return false;
  }
  return true;
};

const startPayment = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    toast.error('Login necessário para continuar.');
    return;
  }

  // 🔒 Ativa o carregamento
  setIsProcessing(true);

  // 🛡️ Roda a verificação de elegibilidade antes de gerar o Pix
  const canProceed = await checkEventEligibility();
  if (!canProceed) {
    setIsProcessing(false);
    return; // Interrompe o processo se já comprou
  }

  if (!paymentMethod) {
    toast.error('Selecione um método de pagamento');
    setIsProcessing(false);
    return;
  }

  // ... segue o seu código original de geração de cobrança
  try {
    const { data, error } = await supabase.functions.invoke('checkout', {
      body: {
        items,
        buyer_name: formData.username, 
        buyer_email: formData.email,
        payment_method: paymentMethod,
        coupon_code: appliedCoupon?.code || null
      }
    });

    if (data?.error) throw new Error(data.error);

    if (data.type === 'pix_generated') {
      setPixData(data);
      setStep('pix_waiting');
    } else if (data.type === 'redirect') {
      window.location.href = data.url;
    }
  } catch (error: any) {
    toast.error(error.message || 'Erro ao processar pagamento.');
  } finally {
    setIsProcessing(false);
  }
};

  const finishOrder = async (status: string, paymentId: any) => {
      if (step === 'success') return; 
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const { data: existingOrder } = await supabase
            .from('orders')
            .select('id')
            .eq('payment_id', String(paymentId))
            .maybeSingle();

        if (existingOrder) {
            setStep('success');
            clearCart();
            return;
        }

        const discordName = user?.user_metadata?.full_name || user?.user_metadata?.name || formData.username;
        const discordAvatar = user?.user_metadata?.avatar_url || null;

        const { error: dbError } = await supabase
          .from('orders')
          .insert({
            user_id: user?.id || null, 
            payment_id: String(paymentId),
            status: status,
            total_amount: finalTotal,
            items: items, 
            user_name: discordName,
            user_avatar: discordAvatar,
            discord_username: formData.username,
            buyer_email: formData.email, 
            coupon_used: appliedCoupon?.code || null
          });

        if (dbError && dbError.code === '23505') { 
            setStep('success');
            clearCart();
            return;
        }

        const totalFormatted = `R$ ${finalTotal.toFixed(2).replace('.', ',')}`;
        const emailHtml = generateEmailHTML(formData.username, items, totalFormatted, String(paymentId));
        await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
            to_name: formData.username,
            to_email: formData.email,
            message_html: emailHtml,
        }, PUBLIC_KEY);
        
        setStep('success');
        clearCart();
        toast.success("Pedido confirmado!");
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

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="max-w-md w-full relative z-10 bg-[#121212] border border-green-500/30 p-8 rounded-2xl text-center shadow-2xl">
          <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.3)] animate-pulse">
            <Check className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-3xl font-display font-bold text-white mb-2">Pagamento Aprovado!</h2>
          <p className="text-gray-400 mb-8">Recebemos sua confirmação. O recibo foi enviado por e-mail e os itens já estão sendo processados.</p>
          <button 
             onClick={() => { navigate('/'); setStep('cart'); clearCart(); }} 
             className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold uppercase tracking-wide transition-all"
          >
            Voltar à Loja
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0 && step !== 'pix_waiting') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-center opacity-50 text-white/50">
          <Wallet className="w-20 h-20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Seu inventário está vazio</h2>
        </div>
        <button onClick={() => navigate('/')} className="px-6 py-2 border border-white/20 hover:bg-white/5 rounded-lg text-white flex items-center gap-2 transition-all">
          <ArrowLeft className="w-4 h-4" /> Voltar às Compras
        </button>
      </div>
    );
  }

  // --- COMPONENTE DE STEPS (VISUAL NOVO) ---
  const renderSteps = () => (
    <div className="flex justify-between items-center mb-10 relative max-w-2xl mx-auto">
      {/* Linha de Fundo */}
      <div className="absolute top-1/2 left-0 w-full h-1 bg-white/5 -z-10 rounded-full" />
      
      {/* Linha de Progresso Ativa */}
      <div 
        className="absolute top-1/2 left-0 h-1 bg-green-500 -z-10 rounded-full transition-all duration-500"
        style={{ 
            width: step === 'cart' ? '0%' : step === 'info' ? '50%' : '100%' 
        }} 
      />

      {[
        { id: 'cart', label: 'Carrinho', icon: Wallet },
        { id: 'info', label: 'Dados', icon: User },
        { id: 'payment', label: 'Pagamento', icon: CreditCard }
      ].map((s, idx) => {
        const isActive = step === s.id || step === 'pix_waiting';
        const isPast = ['cart', 'info', 'payment'].indexOf(step) > idx;
        const isCurrent = step === s.id;

        return (
          <div key={s.id} className="relative flex flex-col items-center gap-2">
            <div 
                className={`
                    w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 shadow-xl
                    ${isCurrent 
                        ? 'bg-green-500 border-green-400 text-black scale-110 shadow-[0_0_20px_rgba(34,197,94,0.4)]' 
                        : isPast 
                            ? 'bg-[#121212] border-green-500 text-green-500' 
                            : 'bg-[#121212] border-white/10 text-gray-500'
                    }
                `}
            >
              {isPast ? <Check className="w-6 h-6" /> : <s.icon className="w-5 h-5" />}
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${isCurrent ? 'text-green-400' : 'text-gray-500'}`}>
                {s.label}
            </span>
          </div>
        )
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8 px-4 font-sans text-foreground overflow-x-hidden relative">
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10">
        
        {/* Header Simples */}
        <div className="flex items-center justify-between mb-8">
          <button 
             onClick={() => step === 'cart' ? navigate('/') : setStep(prev => prev === 'payment' ? 'info' : 'cart')} 
             className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-lg border border-white/5 hover:border-white/20"
          >
            <ArrowLeft className="w-4 h-4" /> <span>Voltar</span>
          </button>
          <div className="flex items-center gap-2 text-white font-display font-bold text-xl">
             <Zap className="text-green-500 fill-green-500" /> CHECKOUT
          </div>
        </div>

        {renderSteps()}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
          
          {/* --- COLUNA ESQUERDA (FORMULÁRIOS) --- */}
          <div className="space-y-6">
            
            {/* ETAPA 1: CARRINHO */}
            {step === 'cart' && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500 space-y-4">
                <h2 className="text-2xl font-display font-bold mb-4 flex items-center gap-2 text-white">
                  <Wallet className="text-green-500" /> Revisar Itens
                </h2>
                
                <div className="space-y-3">
                    {items.map((item) => (
                    <div key={item.id} className="group flex flex-col sm:flex-row items-center gap-4 bg-[#121212] border border-white/5 p-4 rounded-xl hover:border-green-500/30 transition-all shadow-lg">
                        <div className="w-20 h-20 shrink-0 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center p-2">
                        <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 w-full text-center sm:text-left">
                        <h4 className="font-bold text-lg text-white">{item.title}</h4>
                        <p className="text-green-400 font-bold">R$ {item.price.toFixed(2).replace('.', ',')}</p>
                        </div>
                        <div className="flex items-center justify-center gap-4 w-full sm:w-auto">
                            <div className="flex items-center gap-1 bg-black/60 rounded-lg p-1 border border-white/10">
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"><Minus className="w-3 h-3" /></button>
                                <span className="w-8 text-center font-bold text-white text-sm">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"><Plus className="w-3 h-3" /></button>
                            </div>
                            <button onClick={() => removeItem(item.id)} className="p-2.5 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                    ))}
                </div>
                
                <div className="pt-6">
                    {userLoggedIn ? (
                        <button 
                            onClick={() => setStep('info')} 
                            className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold uppercase tracking-wide transition-all shadow-lg hover:shadow-green-500/20"
                        >
                            Continuar para Dados
                        </button>
                    ) : (
                        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 text-center">
                            <Lock className="w-8 h-8 text-red-500 mx-auto mb-3" />
                            <h3 className="text-white font-bold text-lg mb-1">Acesso Restrito</h3>
                            <p className="text-gray-400 text-sm mb-4">Você precisa se conectar ao Discord para garantir a entrega dos itens.</p>
                            <button onClick={handleDiscordLogin} className="w-full py-3 bg-[#5865F2] hover:bg-[#4752c4] text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors">
                            <Gamepad2 className="w-5 h-5" /> Conectar com Discord
                            </button>
                        </div>
                    )}
                </div>
              </div>
            )}

            {/* ETAPA 2: DADOS */}
            {step === 'info' && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2 text-white">
                  <User className="text-green-500" /> Identificação
                </h2>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-8 space-y-6 shadow-2xl">
                  
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 uppercase font-bold tracking-wider ml-1">Nick no Servidor</label>
                    <div className="relative group">
                      <Gamepad2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors w-5 h-5" />
                      <input 
                        type="text" 
                        name="username" 
                        value={formData.username} 
                        onChange={handleInputChange} 
                        placeholder="Ex: RobsonGamer" 
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/40 border border-white/10 focus:border-green-500 outline-none text-white transition-all placeholder:text-gray-600" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs text-gray-500 uppercase font-bold tracking-wider ml-1">Email</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors w-5 h-5" />
                        <input 
                            type="email" 
                            name="email" 
                            value={formData.email} 
                            onChange={handleInputChange} 
                            placeholder="seu@email.com" 
                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/40 border border-white/10 focus:border-green-500 outline-none text-white transition-all placeholder:text-gray-600" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-gray-500 uppercase font-bold tracking-wider ml-1">Confirmar Email</label>
                      <div className="relative group">
                        <Check className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors w-5 h-5" />
                        <input 
                            type="email" 
                            name="confirmEmail" 
                            value={formData.confirmEmail} 
                            onChange={handleInputChange} 
                            placeholder="Confirme o email" 
                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/40 border border-white/10 focus:border-green-500 outline-none text-white transition-all placeholder:text-gray-600" 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => validateInfo() && setStep('payment')} 
                    className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold uppercase tracking-wide transition-all shadow-lg mt-4"
                  >
                    Confirmar Dados
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 3: PAGAMENTO */}
            {step === 'payment' && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2 text-white">
                  <CreditCard className="text-green-500" /> Método de Pagamento
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Card PIX */}
                  <button 
                    onClick={() => setPaymentMethod('pix')} 
                    className={`relative p-6 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all duration-300 group ${
                        paymentMethod === 'pix' 
                        ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                        : 'border-white/5 bg-[#121212] hover:border-white/20'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${paymentMethod === 'pix' ? 'bg-emerald-500 text-black' : 'bg-white/5 text-gray-500 group-hover:text-white'}`}>
                        <QrCode className="w-7 h-7" />
                    </div>
                    <div className="text-center">
                        <h3 className={`font-bold text-lg ${paymentMethod === 'pix' ? 'text-emerald-500' : 'text-gray-300'}`}>PIX</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Aprovação Imediata</p>
                    </div>
                  </button>
                  
                  {/* Card Cartão */}
                  <button 
                    onClick={() => setPaymentMethod('card')} 
                    className={`relative p-6 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all duration-300 group ${
                        paymentMethod === 'card' 
                        ? 'border-blue-500 bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                        : 'border-white/5 bg-[#121212] hover:border-white/20'
                    }`}
                  >
                     <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${paymentMethod === 'card' ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-500 group-hover:text-white'}`}>
                        <CreditCard className="w-7 h-7" />
                    </div>
                    <div className="text-center">
                        <h3 className={`font-bold text-lg ${paymentMethod === 'card' ? 'text-blue-500' : 'text-gray-300'}`}>Cartão</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Crédito e Débito</p>
                    </div>
                  </button>
                </div>

                <div className="bg-[#121212] border border-white/5 rounded-xl p-6 text-center shadow-2xl">
                   {!paymentMethod ? (
                     <div className="py-8 flex flex-col items-center gap-3 opacity-50">
                        <ShieldCheck className="w-10 h-10" />
                        <p className="text-sm">Selecione uma opção acima para desbloquear o pagamento.</p>
                     </div>
                   ) : (
                     <div className="animate-in fade-in slide-in-from-bottom-2">
                        <button 
                          onClick={startPayment} 
                          disabled={isProcessing || !userLoggedIn} 
                          className={`w-full py-4 rounded-xl text-lg font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg ${
                             isProcessing ? 'bg-gray-700 text-gray-400 cursor-wait' : 
                             !userLoggedIn ? 'bg-red-900/50 text-red-200 cursor-not-allowed' :
                             'bg-green-600 hover:bg-green-500 text-white hover:scale-[1.02]'
                          }`}
                        >
                          {isProcessing ? "Processando..." : (userLoggedIn ? "Finalizar Compra" : "Login necessário")} 
                          {!isProcessing && <ExternalLink className="w-5 h-5" />}
                        </button>
                     </div>
                   )}
                </div>
              </div>
            )}

            {/* ETAPA 4: ESPERANDO PIX */}
            {step === 'pix_waiting' && pixData && (
               <div className="animate-in zoom-in duration-300 flex justify-center">
                  <div className="bg-[#121212] border border-emerald-500/30 p-8 rounded-2xl text-center max-w-md w-full shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                      <h2 className="text-2xl font-display font-bold text-white mb-2">Escaneie o QR Code</h2>
                      <p className="text-sm text-gray-400 mb-6">Abra seu app do banco e pague via Pix.</p>
                      
                      <div className="bg-white p-3 rounded-xl mx-auto w-fit mb-6 shadow-xl">
                         <img src={`data:image/png;base64,${pixData.qr_code_base64}`} alt="QR Code Pix" className="w-56 h-56" />
                      </div>
                      
                      <button onClick={copyPixCode} className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg font-bold flex items-center justify-center gap-2 transition-all">
                         <Copy className="w-5 h-5" /> Copiar Código Pix
                      </button>
                      
                      <div className="mt-8 flex items-center justify-center gap-3 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-500 text-xs font-bold uppercase tracking-wide animate-pulse">
                         <div className="w-2 h-2 bg-yellow-500 rounded-full"/> Aguardando pagamento...
                      </div>
                  </div>
               </div>
            )}
          </div>

          {/* --- COLUNA DIREITA (RESUMO STICKY) --- */}
          <div className="h-fit space-y-4">
            <motion.div layout className="lg:sticky lg:top-8 bg-[#121212] border border-white/5 rounded-xl p-6 shadow-2xl relative overflow-hidden">
              <AnimatePresence>
                {appliedCoupon && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-green-500/5 pointer-events-none" />
                )}
              </AnimatePresence>

              <h3 className="text-lg font-display font-bold mb-6 pb-4 border-b border-white/10 flex items-center gap-2 text-white">
                <ShieldCheck className="text-green-500 w-5 h-5"/> Resumo do Pedido
              </h3>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-start text-sm group">
                    <span className="text-gray-400 group-hover:text-gray-200 transition-colors">
                        <span className="text-green-500 font-bold mr-1">{item.quantity}x</span> 
                        {item.title}
                    </span>
                    <span className="font-mono text-white">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                  </div>
                ))}
              </div>

              <div className="mb-6 pt-4 border-t border-white/5 space-y-3 relative">
                 <label className="text-[10px] font-black uppercase text-green-500 tracking-widest flex items-center gap-1">
                   <Tag className="w-3 h-3" /> Pergaminho de Desconto
                 </label>
                 <div className="flex gap-2">
                   <input 
                     type="text" 
                     value={couponCode} 
                     onChange={(e) => setCouponCode(e.target.value)}
                     placeholder="CÓDIGO MÁGICO" 
                     className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs uppercase outline-none focus:border-green-500 transition-all text-white placeholder:text-gray-600"
                   />
                   <motion.button 
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     onClick={handleApplyCoupon} 
                     disabled={isValidatingCoupon}
                     className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 text-[10px] font-bold px-4 py-2 rounded-lg transition-all"
                   >
                     {isValidatingCoupon ? '...' : 'APLICAR'}
                   </motion.button>
                 </div>

                 <AnimatePresence>
                   {appliedCoupon && (
                     <motion.div initial={{ height: 0, opacity: 0, scale: 0.9 }} animate={{ height: 'auto', opacity: 1, scale: 1 }} exit={{ height: 0, opacity: 0, scale: 0.9 }} className="overflow-hidden">
                       <div className="flex items-center justify-between text-[10px] bg-green-500/10 text-green-400 p-3 rounded-lg border border-green-500/20 mt-2">
                         <div className="flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-green-400" />
                            <span className="font-bold uppercase tracking-tighter">CUPOM ATIVO: {appliedCoupon.code}</span>
                         </div>
                         <button onClick={() => setAppliedCoupon(null)} className="text-red-400 hover:text-red-300 font-bold uppercase text-[9px]">Remover</button>
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex justify-between text-gray-500 text-sm font-medium">
                  <span>Subtotal</span>
                  <span className="text-gray-300">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                </div>
                
                <AnimatePresence>
                  {appliedCoupon && (
                    <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex justify-between text-green-500 text-sm font-medium">
                      <span>Desconto (-{appliedCoupon.discount}%)</span>
                      <span>- R$ {discountAmount.toFixed(2).replace('.', ',')}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-between items-end pt-2">
                  <span className="text-gray-400 font-bold text-sm mb-1">Total</span>
                  <motion.span
                    key={finalTotal}
                    initial={{ scale: 1.2, color: "#fff" }}
                    animate={{ scale: 1, color: "#4ade80" }}
                    className="text-2xl font-bold text-green-400"
                  >
                    R$ {finalTotal.toFixed(2).replace('.', ',')}
                  </motion.span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 text-[10px] text-center text-gray-600 flex items-center justify-center gap-1 uppercase font-bold tracking-wider">
                <ShieldCheck className="w-3 h-3" /> Compra 100% Segura
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;