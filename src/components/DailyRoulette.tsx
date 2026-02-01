import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Gift, Zap, XCircle, Timer, Lock } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Áudios
const audioSpin = new Audio('/spin.mp3');
const audioWin = new Audio('/win.mp3');

// Configuração Visual dos Segmentos
const SEGMENTS = [
  { label: '50% OFF', value: 50, color: '#facc15', text: '#000', type: 'win' },   
  { label: 'Nada', value: 0, color: '#1f2937', text: '#6b7280', type: 'loss' }, 
  { label: '10% OFF', value: 10, color: '#22c55e', text: '#000', type: 'win' }, 
  { label: 'Nada', value: 0, color: '#111827', text: '#4b5563', type: 'loss' }, 
  { label: '30% OFF', value: 30, color: '#a855f7', text: '#fff', type: 'win' },   
  { label: 'Nada', value: 0, color: '#1f2937', text: '#6b7280', type: 'loss' }, 
  { label: '10% OFF', value: 10, color: '#22c55e', text: '#000', type: 'win' },
  { label: 'Nada', value: 0, color: '#111827', text: '#4b5563', type: 'loss' },
];

export default function DailyRoulette({ userEmail, onSpinComplete }: { userEmail: string, onSpinComplete?: () => void }) {
  const [canSpin, setCanSpin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const controls = useAnimation();
  
  const spinAudioRef = useRef<HTMLAudioElement>(audioSpin);

  useEffect(() => {
    checkSpinAvailability();
    spinAudioRef.current.volume = 0.5;
    audioWin.volume = 0.5;
  }, [userEmail]);

  async function checkSpinAvailability() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const discordName = user.user_metadata.full_name || user.user_metadata.name;
    const now = new Date().getTime();
    const oneDay = 24 * 60 * 60 * 1000; 

    // 1. CHECAGEM RÁPIDA (LocalStorage) - Bloqueia instantaneamente
    const localLastSpin = localStorage.getItem(`last_spin_${user.id}`);
    if (localLastSpin) {
        const lastSpinTime = parseInt(localLastSpin);
        if (now - lastSpinTime < oneDay) {
            blockSpin(lastSpinTime);
            setLoading(false);
            return; // Se tá bloqueado no local, nem perde tempo com o banco agora
        }
    }

    // 2. CHECAGEM DO BANCO (Supabase)
    const { data } = await supabase
      .from('ranking')
      .select('last_spin_at')
      .ilike('player_name', discordName)
      .maybeSingle();

    if (data && data.last_spin_at) {
      const dbSpinTime = new Date(data.last_spin_at).getTime();
      if (now - dbSpinTime < oneDay) {
        // Sincroniza o localstorage se o banco diz que tá bloqueado
        localStorage.setItem(`last_spin_${user.id}`, dbSpinTime.toString());
        blockSpin(dbSpinTime);
      } else {
        setCanSpin(true);
      }
    } else {
      setCanSpin(true);
    }
    setLoading(false);
  }

  // Função auxiliar para calcular tempo e bloquear
  function blockSpin(lastSpinTime: number) {
      setCanSpin(false);
      const now = new Date().getTime();
      const oneDay = 24 * 60 * 60 * 1000;
      const diff = oneDay - (now - lastSpinTime);
      
      if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeLeft(`${hours}h ${minutes}m`);
      } else {
          setCanSpin(true); // Se já passou o tempo, libera
      }
  }

  const spinWheel = async () => {
    if (!canSpin || spinning || !userId) return;
    setSpinning(true);
    
    // Toca som rápido
    spinAudioRef.current.currentTime = 0;
    spinAudioRef.current.loop = false; 
    spinAudioRef.current.play().catch(() => {}); 

    // --- LÓGICA ULTRA HARDCORE ---
    const random = Math.random() * 100;
    let selectedIndex = 1; // Padrão: Nada (Preto)

    // 50% OFF: 0.1% chance (1 em 1000)
    if (random < 0.1) selectedIndex = 0;      
    // 30% OFF: 1% chance (1 em 100)
    else if (random < 1.1) selectedIndex = 4; 
    // 10% OFF: 10% chance
    else if (random < 11.1) selectedIndex = Math.random() > 0.5 ? 2 : 6; 
    // Nada: 88.9% chance
    else selectedIndex = [1, 3, 5, 7][Math.floor(Math.random() * 4)]; 

    const result = SEGMENTS[selectedIndex];
    const segmentAngle = 360 / SEGMENTS.length;
    
    // Giro rápido (3s)
    const stopAngle = (360 * 5) + (360 - (selectedIndex * segmentAngle)) - (segmentAngle/2);

    await controls.start({
      rotate: stopAngle,
      transition: { duration: 3, ease: "easeOut" }
    });

    // --- SALVAMENTO DUPLO (BANCO + LOCAL) ---
    const spinDate = new Date();
    localStorage.setItem(`last_spin_${userId}`, spinDate.getTime().toString()); // Salva no navegador NA HORA
    
    // Tenta salvar no banco em segundo plano
    const { data: { user } } = await supabase.auth.getUser();
    if(user) {
        const discordName = user.user_metadata.full_name || user.user_metadata.name;
        await supabase
            .from('ranking')
            .update({ last_spin_at: spinDate.toISOString() })
            .ilike('player_name', discordName);
    }

    if (result.type === 'win') {
        audioWin.play().catch(() => {});
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: [result.color, '#ffffff'] });

        const code = `LUCK-${result.value}-${Math.floor(Math.random() * 99999)}`;
        await supabase.from('user_coupons').insert({
            user_id: userId,
            code: code,
            discount_percent: result.value
        });
        
        toast.success(`GANHOU ${result.label}!`, {
            description: "Cupom salvo na bolsa.",
            icon: <Gift className="text-yellow-500"/>,
            duration: 5000
        });
    } else {
        toast.error("Não foi dessa vez.", { icon: <XCircle className="text-red-500"/> });
    }

    // Bloqueia visualmente imediatamente
    blockSpin(spinDate.getTime());
    setSpinning(false);
    if (onSpinComplete) onSpinComplete();
  };

  if (loading) return (
    <div className="h-64 flex flex-col items-center justify-center gap-2">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-8 py-4 relative">
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/20 blur-[80px] rounded-full transition-all duration-500 ${spinning ? 'scale-150 opacity-100' : 'scale-100 opacity-50'}`} />

      <div className="relative w-72 h-72 md:w-80 md:h-80 group">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 filter drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]">
            <div className="w-8 h-10 bg-gradient-to-b from-yellow-400 to-yellow-600 [clip-path:polygon(50%_100%,_0_0,_100%_0)]"></div>
        </div>

        <div className="absolute inset-0 rounded-full border-[12px] border-[#1a1a1a] shadow-2xl z-20 pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className={`absolute w-2 h-2 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/30 ${spinning ? 'animate-pulse' : ''}`} style={{ transform: `rotate(${i * 30}deg) translateY(-145px)` }} />
            ))}
        </div>

        <motion.div 
            className="w-full h-full rounded-full overflow-hidden relative border-4 border-gray-800"
            animate={controls}
            style={{ background: `conic-gradient(${SEGMENTS.map((seg, i) => `${seg.color} ${i * (100/SEGMENTS.length)}% ${(i+1) * (100/SEGMENTS.length)}%`).join(', ')})` }}
        >
            {SEGMENTS.map((seg, i) => {
                const rotation = (360 / SEGMENTS.length) * i + (360 / SEGMENTS.length) / 2;
                return (
                    <div key={i} className="absolute top-0 left-1/2 w-[1px] h-[50%] origin-bottom flex justify-center pt-6" style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}>
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-widest vertical-text drop-shadow-md" style={{ color: seg.text, writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                            {seg.label}
                        </span>
                    </div>
                );
            })}
            <div className="absolute inset-0 m-auto w-16 h-16 bg-gradient-to-br from-gray-800 to-black rounded-full border-2 border-white/10 flex items-center justify-center z-10 shadow-xl">
                <Zap size={24} className={`text-yellow-500 ${spinning ? 'animate-bounce' : ''}`} />
            </div>
        </motion.div>
      </div>

      <div className="text-center z-10 space-y-4">
        {!canSpin ? (
            <div className="flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-2 px-5 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 font-bold uppercase text-xs tracking-wide">
                    <Lock size={14} /> Volte em {timeLeft}
                </div>
            </div>
        ) : (
            <button
                onClick={spinWheel}
                disabled={spinning}
                className={`relative group px-10 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-sm overflow-hidden transition-all ${spinning ? 'cursor-not-allowed opacity-80' : 'hover:scale-105 hover:shadow-[0_0_40px_rgba(168,85,247,0.4)]'}`}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 animate-gradient-xy"></div>
                <span className="relative z-10 text-white flex items-center gap-2">{spinning ? 'Girando...' : 'GIRAR AGORA'}</span>
            </button>
        )}
      </div>
    </div>
  );
}