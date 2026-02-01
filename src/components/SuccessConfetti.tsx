import { useEffect, useRef } from 'react';

export default function SuccessConfetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Configuração das "Cédulas"
    const bills: any[] = [];
    const billCount = 50;
    
    // Cria as notas
    for (let i = 0; i < billCount; i++) {
      bills.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height, // Começa acima da tela
        w: 60,
        h: 30,
        speed: Math.random() * 3 + 2,
        angle: Math.random() * 360,
        spin: Math.random() * 0.2 - 0.1
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      bills.forEach(bill => {
        ctx.save();
        ctx.translate(bill.x + bill.w / 2, bill.y + bill.h / 2);
        ctx.rotate(bill.angle * Math.PI / 180);
        
        // Desenha a nota (Verde com cifrão)
        ctx.fillStyle = '#22c55e'; // Verde Dinheiro
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 5;
        ctx.fillRect(-bill.w / 2, -bill.h / 2, bill.w, bill.h);
        
        // Borda e Cifrão
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 2;
        ctx.strokeRect(-bill.w / 2, -bill.h / 2, bill.w, bill.h);
        
        ctx.fillStyle = '#14532d'; // Verde Escuro
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 0);

        ctx.restore();

        // Movimento
        bill.y += bill.speed;
        bill.angle += bill.spin;
        bill.x += Math.sin(bill.y * 0.01); // Balanço lateral

        // Loop infinito (se cair, volta pro topo)
        if (bill.y > canvas.height) {
          bill.y = -50;
          bill.x = Math.random() * canvas.width;
        }
      });

      requestAnimationFrame(draw);
    };

    const animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
}