import React, { useState, useEffect, useRef } from 'react';

interface SnakeGameProps {
  onGameEnd?: () => void;
}

const SnakeGame: React.FC<SnakeGameProps> = ({ onGameEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const [gameOver, setGameOver] = useState(false);
  const [canvasSize, setCanvasSize] = useState(360);

  // Game settings
  const snakeSize = 20;
  const initialSnake = [{ x: 10, y: 10 }];
  const initialFood = { x: 15, y: 15 };

  // Game state
  const [snake, setSnake] = useState(initialSnake);
  const [food, setFood] = useState(initialFood);
  const [direction, setDirection] = useState({ x: 1, y: 0 });

  useEffect(() => {
    const resize = () => {
      if (!boardRef.current) return;
      const hostWidth = boardRef.current.offsetWidth;
      const size = Math.min(hostWidth, 520);
      const rounded = Math.floor(size / snakeSize) * snakeSize;
      setCanvasSize(Math.max(240, rounded));
    };

    resize();
    const observer = new ResizeObserver(resize);
    if (boardRef.current) {
      observer.observe(boardRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  useEffect(() => {
    if (gameOver) return;

    const gameLoop = setInterval(() => {
      const newSnake = [...snake];
      const head = { ...newSnake[0] };
      head.x += direction.x;
      head.y += direction.y;

      // Wall collision
      if (head.x < 0 || head.x >= canvasSize / snakeSize || head.y < 0 || head.y >= canvasSize / snakeSize) {
        setGameOver(true);
        return;
      }

      // Self collision
      for (let i = 1; i < newSnake.length; i++) {
        if (head.x === newSnake[i].x && head.y === newSnake[i].y) {
          setGameOver(true);
          return;
        }
      }

      newSnake.unshift(head);

      // Food collision
      if (head.x === food.x && head.y === food.y) {
        setFood({
          x: Math.floor(Math.random() * (canvasSize / snakeSize)),
          y: Math.floor(Math.random() * (canvasSize / snakeSize)),
        });
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);
    }, 200);

    return () => clearInterval(gameLoop);
  }, [snake, direction, food, gameOver, canvasSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isDarkMode = document.documentElement.classList.contains('dark');

    // Clear canvas
    ctx.fillStyle = isDarkMode ? '#2d3748' : '#f0f0f0';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Draw food
    ctx.fillStyle = isDarkMode ? '#f56565' : '#c53030';
    ctx.fillRect(food.x * snakeSize, food.y * snakeSize, snakeSize, snakeSize);

    // Draw snake
    ctx.fillStyle = isDarkMode ? '#68d391' : '#4a5568';
    snake.forEach(segment => {
      ctx.fillRect(segment.x * snakeSize, segment.y * snakeSize, snakeSize, snakeSize);
    });
  }, [snake, food, canvasSize]);

  const restartGame = () => {
    setSnake(initialSnake);
    setFood(initialFood);
    setDirection({ x: 1, y: 0 });
    setGameOver(false);
  };

  return (
    <div className="flex h-full w-full flex-col items-center overflow-y-auto bg-background p-3 text-foreground sm:p-4">
      <div className="w-full max-w-3xl space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h1 className="text-2xl font-bold text-primary">Snake Game</h1>
          {gameOver && (
            <span className="text-sm font-semibold text-destructive">Game over — try again.</span>
          )}
        </div>

        <div
          ref={boardRef}
          className="relative aspect-square w-full overflow-hidden rounded-3xl border border-border bg-card shadow-inner"
        >
          <canvas
            ref={canvasRef}
            width={canvasSize}
            height={canvasSize}
            className="h-full w-full"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 sm:mx-auto sm:w-64">
          <button
            onClick={() => setDirection({ x: 0, y: -1 })}
            className="col-span-3 rounded-2xl bg-secondary py-3 text-lg font-semibold"
            aria-label="Move up"
          >
            ↑
          </button>
          <button
            onClick={() => setDirection({ x: -1, y: 0 })}
            className="rounded-2xl bg-secondary py-3 text-lg font-semibold"
            aria-label="Move left"
          >
            ←
          </button>
          <button
            onClick={() => setDirection({ x: 1, y: 0 })}
            className="rounded-2xl bg-secondary py-3 text-lg font-semibold"
            aria-label="Move right"
          >
            →
          </button>
          <button
            onClick={() => setDirection({ x: 0, y: 1 })}
            className="col-span-3 rounded-2xl bg-secondary py-3 text-lg font-semibold"
            aria-label="Move down"
          >
            ↓
          </button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            onClick={restartGame}
            className="min-h-[44px] rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/80 sm:text-base"
          >
            Restart
          </button>
          {onGameEnd && (
            <button
              onClick={onGameEnd}
              className="min-h-[44px] rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-accent sm:text-base"
            >
              Exit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
