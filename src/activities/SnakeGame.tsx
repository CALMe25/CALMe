import React, { useState, useEffect, useRef } from 'react';

interface SnakeGameProps {
  onGameEnd?: () => void;
}

const SnakeGame: React.FC<SnakeGameProps> = ({ onGameEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

    // Clear canvas
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Draw food
    ctx.fillStyle = '#f56565';
    ctx.fillRect(food.x * snakeSize, food.y * snakeSize, snakeSize, snakeSize);

    // Draw snake
    ctx.fillStyle = '#68d391';
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '20px', color: 'white' }}>
      <h1 style={{ marginBottom: '20px' }}>Snake Game</h1>
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        style={{ border: '1px solid #ccc', maxWidth: '100%' }}
      />
      <div style={{ marginTop: '20px' }}>
        <button onClick={() => setDirection({ x: 0, y: -1 })} style={{ padding: '10px 20px', fontSize: '1.2rem' }}>↑</button>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
          <button onClick={() => setDirection({ x: -1, y: 0 })} style={{ padding: '10px 20px', fontSize: '1.2rem' }}>←</button>
          <button onClick={() => setDirection({ x: 1, y: 0 })} style={{ padding: '10px 20px', fontSize: '1.2rem' }}>→</button>
        </div>
        <button style={{ marginTop: '10px', padding: '10px 20px', fontSize: '1.2rem' }} onClick={() => setDirection({ x: 0, y: 1 })}>↓</button>
      </div>
      {gameOver && (
        <div style={{ marginTop: '20px' }}>
          <h2>Game Over</h2>
          <button onClick={restartGame} style={{ marginRight: '10px', padding: '10px 20px', fontSize: '1.2rem' }}>Restart</button>
          {onGameEnd && <button onClick={onGameEnd} style={{ padding: '10px 20px', fontSize: '1.2rem' }}>Exit</button>}
        </div>
      )}
    </div>
  );
};

export default SnakeGame;