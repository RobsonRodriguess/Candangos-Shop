import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Trophy } from 'lucide-react';

// Configurações do Tabuleiro
const GRID_SIZE = 20;
const SPEED = 100; // ms

export default function SnakeGame({ onClose }: { onClose: () => void }) {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 10 });
  const [direction, setDirection] = useState({ x: 0, y: 0 }); // Começa parado
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('snake_highscore') || '0'));
  const [isPaused, setIsPaused] = useState(true);
  
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  // Controle de Teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (direction.y === 0) setDirection({ x: 0, y: -1 }); break;
        case 'ArrowDown': if (direction.y === 0) setDirection({ x: 0, y: 1 }); break;
        case 'ArrowLeft': if (direction.x === 0) setDirection({ x: -1, y: 0 }); break;
        case 'ArrowRight': if (direction.x === 0) setDirection({ x: 1, y: 0 }); break;
      }
      if (isPaused && !gameOver) setIsPaused(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, isPaused, gameOver]);

  // Loop do Jogo
  useEffect(() => {
    if (isPaused || gameOver) return;

    gameLoopRef.current = setInterval(() => {
      setSnake((prev) => {
        const newHead = { x: prev[0].x + direction.x, y: prev[0].y + direction.y };

        // Colisão com Paredes
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          handleGameOver();
          return prev;
        }

        // Colisão com o Próprio Corpo
        if (prev.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          handleGameOver();
          return prev;
        }

        const newSnake = [newHead, ...prev];

        // Comer Comida
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          generateFood();
          // Não remove a cauda (cresce)
        } else {
          newSnake.pop(); // Remove a cauda (move)
        }

        return newSnake;
      });
    }, SPEED);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [direction, isPaused, gameOver, food]);

  const generateFood = () => {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    setFood({ x, y });
  };

  const handleGameOver = () => {
    setGameOver(true);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snake_highscore', score.toString());
    }
  };

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ x: 0, y: 0 });
    setScore(0);
    setGameOver(false);
    setIsPaused(true);
    generateFood();
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      
      {/* Placar */}
      <div className="flex justify-between w-full max-w-[300px] text-green-500 font-mono text-sm uppercase font-bold">
        <span>Score: {score}</span>
        <span className="flex items-center gap-1"><Trophy size={14} /> HI: {highScore}</span>
      </div>

      {/* Área do Jogo */}
      <div 
        className="relative bg-black border-4 border-green-900 shadow-[0_0_20px_rgba(34,197,94,0.2)]"
        style={{ 
            width: '300px', 
            height: '300px', 
            display: 'grid', 
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
        }}
      >
        {/* Renderiza Grid Vazio (opcional, para visual) */}
        {/* Cobra */}
        {snake.map((segment, i) => (
          <div 
            key={`${segment.x}-${segment.y}`}
            className="bg-green-500 border-[0.5px] border-black"
            style={{ 
                gridColumnStart: segment.x + 1, 
                gridRowStart: segment.y + 1,
                opacity: i === 0 ? 1 : 0.6 // Cabeça mais forte
            }}
          />
        ))}

        {/* Comida */}
        <div 
            className="bg-red-500 animate-pulse rounded-full"
            style={{ gridColumnStart: food.x + 1, gridRowStart: food.y + 1 }}
        />

        {/* Telas de Overlay */}
        {(isPaused && !gameOver) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-green-500">
                <Play className="w-12 h-12 mb-2 animate-bounce" />
                <p className="text-xs font-bold uppercase tracking-widest">Use as Setas para Jogar</p>
            </div>
        )}

        {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/90 text-white z-10">
                <h2 className="text-3xl font-black uppercase mb-2">Game Over</h2>
                <p className="mb-4 font-mono">Score Final: {score}</p>
                <button 
                    onClick={resetGame}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-red-900 font-bold rounded hover:scale-105 transition-transform"
                >
                    <RotateCcw size={16} /> Tentar De Novo
                </button>
            </div>
        )}
      </div>

      <div className="text-[10px] text-green-700 font-mono text-center">
        SNAKE_V1.0.exe /// SYSTEM_ROOT
      </div>
      
      <button onClick={onClose} className="mt-2 text-xs text-red-500 hover:text-red-400 font-bold uppercase underline">
        [ Fechar Sistema ]
      </button>
    </div>
  );
}