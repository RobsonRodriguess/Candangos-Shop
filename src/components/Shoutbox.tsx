import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, User, Crown } from 'lucide-react';
import { toast } from 'sonner';

// Configuração Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Som de mensagem (opcional, coloque msg.mp3 na pasta public se quiser)
const msgSound = new Audio('/msg.mp3'); 
msgSound.volume = 0.4;

export default function Shoutbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Carrega Usuário e Mensagens Iniciais
  useEffect(() => {
    checkUser();
    fetchMessages();

    // 2. Ativa o "Ouvido Bionico" (Realtime)
    const channel = supabase
      .channel('shoutbox_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'shoutbox_messages' }, (payload) => {
        // Quando entra mensagem nova:
        setMessages((prev) => [...prev, payload.new]);
        
        // Se a mensagem não for minha, toca som
        if (payload.new.user_id !== user?.id) {
            msgSound.currentTime = 0;
            msgSound.play().catch(() => {});
        }
        
        scrollToBottom();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]); // Dependência do user para o som funcionar certo

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('shoutbox_messages')
      .select('*')
      .order('created_at', { ascending: true }) // Mais antigas primeiro para o chat fluir de cima pra baixo
      .limit(50); // Pega as últimas 50

    if (!error && data) {
        setMessages(data);
        setTimeout(scrollToBottom, 200);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    if (!user) {
        toast.error("Faça login para entrar na treta!");
        return;
    }

    setLoading(true);
    
    // Pega dados do usuário para salvar snapshot
    const userName = user.user_metadata.full_name || user.user_metadata.name || 'Anônimo';
    const userAvatar = user.user_metadata.avatar_url;
    // Lógica simples de role (você pode melhorar isso depois pegando do banco)
    const role = user.email === 'admin@admin.com' ? 'admin' : 'user'; 

    const { error } = await supabase
      .from('shoutbox_messages')
      .insert({
        user_id: user.id,
        username: userName,
        avatar_url: userAvatar,
        content: newMessage.trim(),
        role: role
      });

    if (error) {
        toast.error("Erro ao enviar mensagem");
    } else {
        setNewMessage('');
    }
    setLoading(false);
  };

  return (
    <>
      {/* Botão Flutuante (Canto Inferior Esquerdo) */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => { setIsOpen(!isOpen); setTimeout(scrollToBottom, 100); }}
        className="fixed bottom-6 left-6 z-50 p-4 bg-green-600 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:bg-green-500 transition-colors border-2 border-green-400 group"
      >
        <MessageSquare className="text-black w-6 h-6 group-hover:text-white transition-colors" />
        {/* Notificaçãozinha Fake se quiser */}
        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
      </motion.button>

      {/* Janela do Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 left-6 z-50 w-[350px] h-[500px] bg-[#09090b]/95 backdrop-blur-md border-2 border-green-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="p-4 bg-green-900/20 border-b border-green-500/20 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <h3 className="text-green-500 font-bold uppercase tracking-wider text-sm">Bar do Submundo</h3>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                    <X size={18} />
                </button>
            </div>

            {/* Lista de Mensagens */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-green-500/30 scrollbar-track-transparent"
            >
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 text-xs mt-10">
                        <p>O bar está vazio...</p>
                        <p>Seja o primeiro a pedir uma bebida!</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className="flex gap-3 items-start group">
                            {/* Avatar */}
                            <div className="mt-1 shrink-0">
                                {msg.avatar_url ? (
                                    <img src={msg.avatar_url} alt="" className="w-8 h-8 rounded-full border border-white/10" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                                        <User size={14} className="text-gray-400" />
                                    </div>
                                )}
                            </div>
                            
                            {/* Balão */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className={`text-xs font-bold ${msg.role === 'admin' ? 'text-red-400' : 'text-gray-300'}`}>
                                        {msg.username}
                                    </span>
                                    {msg.role === 'admin' && <Crown size={10} className="text-yellow-500" />}
                                    <span className="text-[10px] text-gray-600">
                                        {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-200 break-words leading-relaxed">
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-3 bg-black/40 border-t border-white/10">
                {user ? (
                    <div className="relative flex items-center gap-2">
                        <input 
                            type="text" 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Mande o papo..."
                            className="w-full bg-[#121212] border border-white/10 rounded-lg pl-3 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-green-500 transition-colors placeholder:text-gray-600"
                        />
                        <button 
                            type="submit" 
                            disabled={loading || !newMessage.trim()}
                            className="absolute right-2 p-1.5 bg-green-600 hover:bg-green-500 rounded-md text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={14} />
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-2">
                        <p className="text-xs text-red-400 font-bold mb-1">Acesso Negado</p>
                        <p className="text-[10px] text-gray-500">Faça login para entrar na conversa.</p>
                    </div>
                )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}