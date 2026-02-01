import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// CONFIGURAÇÃO: 5 Minutos (300.000 ms)
const TIMEOUT_MS = 300000; 

export default function AFKScreen() {
  const [isAfk, setIsAfk] = useState(false);
  const lastActivityRef = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 1. Lógica do Timer (Baseada em Intervalo para ser infalível)
  useEffect(() => {
    // Função que reseta o tempo da última atividade
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
      if (isAfk) setIsAfk(false);
    };

    // Listeners
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);
    window.addEventListener('touchstart', updateActivity);

    // Checa a cada 1 segundo se já estourou o tempo
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;
      
      // Se passou do tempo limite E não está AFK ainda
      if (timeSinceLastActivity > TIMEOUT_MS && !isAfk) {
        setIsAfk(true);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
    };
  }, [isAfk]);

  // 2. Efeito Matrix
  useEffect(() => {
    if (!isAfk || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = Array(Math.ceil(columns)).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0F0';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, [isAfk]);

  return (
    <AnimatePresence>
      {isAfk && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] bg-black cursor-none flex items-center justify-center overflow-hidden"
        >
          <canvas ref={canvasRef} className="absolute inset-0 block" />
          
          <div className="relative z-10 text-center pointer-events-none select-none p-4">
            <h1 className="text-4xl md:text-6xl font-black text-white bg-black/60 px-6 py-2 mb-4 glitch-text tracking-widest backdrop-blur-sm border-y-2 border-green-500/50">
              SYSTEM_LOCKED
            </h1>
            <div className="flex justify-center">
                <p className="text-green-500 font-mono text-xs md:text-sm animate-pulse bg-black/80 px-4 py-2 rounded border border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                MOVA O MOUSE PARA RETORNAR
                </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}