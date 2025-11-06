
import { useEffect, useRef, useState } from 'react';
import { Button } from '../chat_interface/ui/button';

interface DigitalCanvasProps {
  onGameEnd?: () => void;
}

const BRUSH_SIZES = [3, 6, 10, 16] as const;
const PALETTE = [
  'var(--foreground)', 
  '#ef4444', 
  '#f97316', 
  '#facc15', 
  '#22c55e', 
  '#0ea5e9', 
  '#a855f7', 
  '#ec4899', 
  'var(--background)', 
] as const;

const getCssVariableValue = (variable: string) => {
  if (variable.startsWith('var(')) {
    const varName = variable.substring(4, variable.length - 1);
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  }
  return variable;
};

export default function DigitalCanvas({ onGameEnd }: DigitalCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState<typeof BRUSH_SIZES[number]>(BRUSH_SIZES[1]);
  const [brushColor, setBrushColor] = useState<string>(PALETTE[0]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const context = canvas.getContext('2d');
      if (!context) return;

      context.scale(dpr, dpr);
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.lineWidth = brushSize;
      context.strokeStyle = getCssVariableValue(brushColor);
      context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--background');
      context.fillRect(0, 0, rect.width, rect.height);

      contextRef.current = context;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.lineWidth = brushSize;
    }
  }, [brushSize]);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = getCssVariableValue(brushColor);
    }
  }, [brushColor]);

  const getCanvasCoordinates = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const context = contextRef.current;
    if (!context) return;
    const { x, y } = getCanvasCoordinates(event);
    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const context = contextRef.current;
    if (!context) return;
    const { x, y } = getCanvasCoordinates(event);
    context.lineTo(x, y);
    context.stroke();
  };

  const finishDrawing = () => {
    const context = contextRef.current;
    if (!context) return;
    context.closePath();
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;
    context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--background');
    context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

  };

  return (
    <div className="flex h-full w-full items-center justify-center bg-background p-4 text-foreground">
      <div className="flex h-full w-full max-w-5xl flex-col gap-5 rounded-2xl border border-border bg-card p-4 shadow-lg lg:gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/50 p-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="font-semibold">Brush</div>
            <div className="flex items-center gap-2">
              {BRUSH_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={`flex h-7 w-7 items-center justify-center rounded-full border transition ${brushSize === size ? 'border-primary bg-primary/20' : 'border-border bg-secondary'}`}>
                  <span
                    className="rounded-full bg-foreground"
                    style={{ width: size / 2 + 4, height: size / 2 + 4 }}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="font-semibold">Colors</div>
            <div className="flex items-center gap-2">
              {PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`h-7 w-7 rounded-full border transition ${brushColor === color ? 'border-primary scale-110' : 'border-border'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setBrushColor(color)}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleClear}>
              Clear
            </Button>
            {onGameEnd && (
              <Button variant="primary" onClick={onGameEnd}>
                Done
              </Button>
            )}
          </div>
        </div>
        <div className="relative flex-1 min-h-[320px] overflow-hidden rounded-2xl border border-border bg-background shadow-inner sm:min-h-[420px] lg:min-h-[560px] xl:min-h-[640px]">
          <canvas
            ref={canvasRef}
            className="h-full w-full touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishDrawing}
            onPointerLeave={finishDrawing}
          />
        </div>
      </div>
    </div>
  );
}
