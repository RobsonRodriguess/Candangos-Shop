import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, AlertTriangle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import SnakeGame from './SnakeGame';

// Sons
const hackSound = new Audio('/hack.mp3'); 
hackSound.volume = 0.5;

export default function KonamiCode() {
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [isHacked, setIsHacked] = useState(false);
  const [showGame, setShowGame] = useState(false);
  
  // Timer para limpar o código se o usuário parar de digitar
  const resetTimer = useRef<NodeJS.Timeout | null>(null);

  const KONAMI_SEQUENCE = [
    'ArrowUp', 'ArrowUp', 
    'ArrowDown', 'ArrowDown', 
    'ArrowLeft', 'ArrowRight', 
    'ArrowLeft', 'ArrowRight', 
    'b', 'a'
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Limpa o timer anterior
      if (resetTimer.current) clearTimeout(resetTimer.current);

      // 2. Normaliza a tecla (b ou B vira b)
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      
      console.log(`Tecla detectada: ${key}`); // <--- ABRA O CONSOLE (F12) PRA VER ISSO

      setInputHistory((prev) => {
        // Adiciona a nova tecla e mantém apenas as últimas 10
        const newHistory = [...prev, key].slice(-10);
        
        // Verifica se a sequência bate
        if (JSON.stringify(newHistory) === JSON.stringify(KONAMI_SEQUENCE)) {
          console.log("🔥 KONAMI CODE ATIVADO!");
          triggerHack();
          return []; // Reseta o histórico após ativar
        }
        return newHistory;
      });

      // 3. Configura timer para resetar se ficar 2s sem digitar
      resetTimer.current = setTimeout(() => {
        setInputHistory([]);
        // console.log("⏳ Timeout: Sequência resetada");
      }, 2000);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const triggerHack = () => {
    if(isHacked) return;
    setIsHacked(true);
    setShowGame(false);
    
    // Tenta tocar o som
    hackSound.currentTime = 0;
    hackSound.play().catch((err) => console.warn("Erro ao tocar som:", err));

    toast.error("⚠️ SISTEMA COMPROMETIDO ⚠️", {
        duration: 4000,
        className: "!bg-red-600 !text-white !border-red-500 font-black uppercase tracking-widest animate-pulse",
        icon: <AlertTriangle className="w-5 h-5 animate-bounce" />
    });
  };

  const handleClose = () => {
      setIsHacked(false);
      setShowGame(false);
      setInputHistory([]);
  }

  return (
    <AnimatePresence>
      {isHacked && (
        <div className="fixed inset-0 z-[9999] bg-black/95 font-mono text-green-500 p-4 overflow-hidden flex flex-col items-center justify-center selection:bg-green-500 selection:text-black">
          
          {/* Scanlines Effect */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_3px,3px_100%] pointer-events-none opacity-50 animate-scanlines"></div>
          
          <motion.div 
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ scaleY: 0, opacity: 0 }}
            className="relative z-20 max-w-lg w-full border-2 border-green-500 bg-black p-6 rounded-sm shadow-[0_0_100px_rgba(34,197,94,0.4)]"
          >
            {/* Header do Terminal */}
            <div className="flex items-center justify-between mb-4 border-b border-green-500/50 pb-2">
                <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-green-400" />
                    <span className="text-sm font-bold tracking-widest uppercase">Root_Access_V4.20</span>
                </div>
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
            </div>

            {/* Conteúdo: Texto ou Jogo */}
            {!showGame ? (
                <div className="space-y-2 text-sm md:text-base h-[300px] flex flex-col justify-end pb-4">
                    <TypingText text="> Conectando ao mainframe..." delay={200} />
                    <TypingText text="> Quebrando criptografia SHA-256..." delay={1200} />
                    <TypingText text="> Acesso concedido." delay={2500} className="text-green-300 font-bold" />
                    <TypingText text="> Escaneando arquivos ocultos..." delay={3500} />
                    <TypingText text="> ENCONTRADO: snake_game.exe" delay={5000} className="text-yellow-400 font-black" />
                    <TypingText text="> Executando..." delay={6000} onComplete={() => setTimeout(() => setShowGame(true), 1000)} />
                </div>
            ) : (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <SnakeGame onClose={handleClose} />
                </motion.div>
            )}

            {/* Botão de Emergência se o cara cansar */}
            {!showGame && (
                 <button onClick={handleClose} className="absolute top-2 right-2 text-red-500 opacity-50 hover:opacity-100">
                    <XCircle size={16} />
                 </button>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Componente de digitação
const TypingText = ({ text, delay, className = "", onComplete }: { text: string, delay: number, className?: string, onComplete?: () => void }) => {
    const [displayed, setDisplayed] = useState('');
    const [started, setStarted] = useState(false);
    
    useEffect(() => {
        const startTimeout = setTimeout(() => {
            setStarted(true);
            let i = 0;
            const typeChar = () => {
                setDisplayed(text.slice(0, i + 1));
                i++;
                if (i <= text.length) {
                    setTimeout(typeChar, 30);
                } else {
                    if (onComplete) onComplete();
                }
            };
            typeChar();
        }, delay);
        return () => clearTimeout(startTimeout);
    }, [text, delay]);

    return <p className={`${className} ${started ? 'opacity-100' : 'opacity-0'} font-mono`}>
        {displayed}
    </p>;
};