import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Package, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

// Configuração do Supabase
const supabase = createClient(
  'https://vrlswaqvswzcapbzshcp.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZybHN3YXF2c3d6Y2FwYnpzaGNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0ODI1NjYsImV4cCI6MjA4NTA1ODU2Nn0.YooTRks2-zy4hqAIpSQmhDpTCf134QHrzl7Ry5TbKn8'
);

// ATUALIZADO AQUI TAMBÉM:
const ADMIN_EMAIL = 'vinicciusdede@gmail.com'; 

export function AuthButton() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo: window.location.origin }
    });
    if (error) toast.error("Erro: " + error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Saiu da conta.");
    navigate('/'); 
  };

  if (user) {
    const avatarUrl = user.user_metadata.avatar_url;
    const discordName = user.user_metadata.full_name || user.user_metadata.name || "Usuário";

    return (
      <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-full pr-4 pl-1 py-1">
        {avatarUrl ? (
           <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full border border-purple-500" />
        ) : (
           <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center"><User size={16}/></div>
        )}
        <div className="flex flex-col">
            <span className="text-xs font-bold text-white leading-none mb-1">{discordName}</span>
            <div className="flex gap-3 text-[10px]">
                {/* BOTÃO ADMIN SÓ PARA O E-MAIL CORRETO */}
                {user.email === ADMIN_EMAIL && (
                    <button onClick={() => navigate('/admin')} className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1 transition-colors border-r border-white/10 pr-2 mr-1">
                        ADMIN <ShieldAlert size={10}/>
                    </button>
                )}
                <button onClick={() => navigate('/meus-pedidos')} className="text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
                    Pedidos <Package size={10}/>
                </button>
                <button onClick={handleLogout} className="text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors ml-1">
                    Sair <LogOut size={10}/>
                </button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <button onClick={handleLogin} className="flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white px-4 py-2 rounded-lg font-bold transition-all text-sm shadow-lg shadow-purple-500/20">
      Entrar com Discord
    </button>
  );
}