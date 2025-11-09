import React, { useState, useEffect, useRef } from 'react';

interface SnakeGameProps {
  onGameEnd?: () => void;
}

const SnakeGame: React.FC<SnakeGameProps> = ({ onGameEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [canvasSize, setCanvasSize] = useState(400);

  // Game settings
  const snakeSize = 20;
  const initialSnake = [{ x: 10, y: 10 }];
  const initialFood = { x: 15, y: 15 };

  // Game state
  const [snake, setSnake] = useState(initialSnake);
  const [food, setFood] = useState(initialFood);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const directionRef = useRef(direction);

  useEffect(() => {
    const handleResize = () => {
      const size = Math.min(window.innerWidth * 0.9, 400);
      setCanvasSize(size);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentDirection = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
          if (currentDirection.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (currentDirection.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (currentDirection.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (currentDirection.x === 0) setDirection({ x: 1, y: 0 });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = event.changedTouches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLCanvasElement>) => {
    const start = touchStartRef.current;
    const touch = event.changedTouches[0];
    touchStartRef.current = null;
    if (!start || !touch) return;

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const threshold = 20;

    if (Math.max(absX, absY) < threshold) return;

    const currentDirection = directionRef.current;

    if (absX > absY) {
      if (dx > 0 && currentDirection.x === 0) {
        setDirection({ x: 1, y: 0 });
      } else if (dx < 0 && currentDirection.x === 0) {
        setDirection({ x: -1, y: 0 });
      }
    } else {
      if (dy > 0 && currentDirection.y === 0) {
        setDirection({ x: 0, y: 1 });
      } else if (dy < 0 && currentDirection.y === 0) {
        setDirection({ x: 0, y: -1 });
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-5 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-5">Snake Game</h1>
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        className="border border-border max-w-full touch-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => (touchStartRef.current = null)}
      />
      <div className="mt-5">
        <button onClick={() => setDirection({ x: 0, y: -1 })} className="p-3 text-2xl">↑</button>
        <div className="flex justify-center gap-5 mt-2.5">
          <button onClick={() => setDirection({ x: -1, y: 0 })} className="p-3 text-2xl">←</button>
          <button onClick={() => setDirection({ x: 1, y: 0 })} className="p-3 text-2xl">→</button>
        </div>
        <button className="mt-2.5 p-3 text-2xl" onClick={() => setDirection({ x: 0, y: 1 })}>↓</button>
      </div>
      {gameOver && (
        <div className="mt-5 text-center">
          <h2 className="text-xl font-bold">Game Over</h2>
          <button onClick={restartGame} className="mr-2.5 mt-2.5 p-3 text-lg bg-primary text-primary-foreground rounded-md">Restart</button>
          {onGameEnd && <button onClick={onGameEnd} className="p-3 text-lg bg-secondary text-secondary-foreground rounded-md">Exit</button>}
        </div>
      )}
    </div>
  );
};

export default SnakeGame;
