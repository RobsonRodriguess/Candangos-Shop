import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Package, ShieldAlert, ChevronDown, Gamepad2 } from 'lucide-react';
import { toast } from 'sonner';

// Configuração do Supabase
const supabase = createClient(
  'https://vrlswaqvswzcapbzshcp.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZybHN3YXF2c3d6Y2FwYnpzaGNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0ODI1NjYsImV4cCI6MjA4NTA1ODU2Nn0.YooTRks2-zy4hqAIpSQmhDpTCf134QHrzl7Ry5TbKn8'
);

const ADMIN_EMAIL = 'vinicciusdede@gmail.com'; 

export function AuthButton() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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
    toast.success("Você saiu da conta.");
    setMenuOpen(false);
    navigate('/'); 
  };

  if (user) {
    const avatarUrl = user.user_metadata.avatar_url;
    const discordName = user.user_metadata.full_name || user.user_metadata.name || "Guerreiro";
    const isAdmin = user.email === ADMIN_EMAIL;

    return (
      <div className="relative">
        {/* Trigger do Menu (Avatar + Nome) */}
        <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className={`
                flex items-center gap-3 pl-1 pr-4 py-1 rounded-full border transition-all duration-300
                ${menuOpen ? 'bg-white/10 border-white/20' : 'bg-black/40 border-white/10 hover:bg-white/5'}
            `}
        >
            <div className="relative">
                {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-9 h-9 rounded-full border border-white/20" />
                ) : (
                    <div className="w-9 h-9 rounded-full bg-[#5865F2] flex items-center justify-center text-white"><User size={18}/></div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
            </div>
            
            <div className="flex flex-col items-start text-left">
                <span className="text-xs font-bold text-white leading-none mb-0.5 max-w-[100px] truncate">{discordName}</span>
                <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                    {isAdmin ? <span className="text-red-400">ADMIN</span> : "Membro"} <ChevronDown size={10} className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                </span>
            </div>
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
            <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#121212] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 space-y-1">
                        {isAdmin && (
                            <button 
                                onClick={() => { navigate('/admin'); setMenuOpen(false); }} 
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                <ShieldAlert size={14} /> PAINEL ADMIN
                            </button>
                        )}
                        
                        <button 
                            onClick={() => { navigate('/meus-pedidos'); setMenuOpen(false); }} 
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <Package size={14} /> Meus Pedidos
                        </button>

                        <div className="h-px bg-white/5 my-1" />
                        
                        <button 
                            onClick={handleLogout} 
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                            <LogOut size={14} /> Sair da Conta
                        </button>
                    </div>
                </div>
            </>
        )}
      </div>
    );
  }

  return (
    <button 
        onClick={handleLogin} 
        className="group relative inline-flex h-10 items-center justify-center overflow-hidden rounded-lg bg-[#5865F2] px-6 font-medium text-white transition-all duration-300 hover:bg-[#4752c4] hover:shadow-[0_0_20px_rgba(88,101,242,0.4)]"
    >
      <span className="mr-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
        <Gamepad2 className="w-4 h-4 transition-transform group-hover:scale-110" /> 
        Entrar
      </span>
    </button>
  );
}