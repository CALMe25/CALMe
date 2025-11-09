import React, { useEffect, useRef, useState } from 'react';
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState<typeof BRUSH_SIZES[number]>(BRUSH_SIZES[1]);
  const [brushColor, setBrushColor] = useState<string>(PALETTE[0]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = containerRef.current;
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
    const observer = new ResizeObserver(resizeCanvas);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => {
      observer.disconnect();
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
    <div className="flex h-full w-full items-center justify-center overflow-hidden bg-background p-2 text-foreground sm:p-3 md:p-4">
      <div className="flex h-full w-full max-w-5xl flex-col gap-3 rounded-2xl border border-border bg-card p-2 shadow-lg sm:gap-4 sm:p-3 md:p-4">
        <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-muted/40 p-3 shadow-lg sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex flex-1 items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground xs:text-xs sm:text-sm">Brush</span>
            <div className="flex items-center gap-1">
              {BRUSH_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setBrushSize(size)}
                  aria-pressed={brushSize === size}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border transition active:scale-95 sm:h-10 sm:w-10 ${brushSize === size ? 'border-primary bg-primary/20 shadow-inner' : 'border-border bg-secondary'}`}
                >
                  <span
                    className="rounded-full bg-foreground"
                    style={{ width: Math.max(4, size / 2 + 2), height: Math.max(4, size / 2 + 2) }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-1 items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground xs:text-xs sm:text-sm">Colors</span>
            <div className="flex items-center gap-1 pr-1">
              {PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Select color ${color}`}
                  aria-pressed={brushColor === color}
                  className={`h-8 w-8 rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:h-10 sm:w-10 ${brushColor === color ? 'border-primary scale-105' : 'border-border'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setBrushColor(color)}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 sm:justify-end">
            <Button
              variant="secondary"
              onClick={handleClear}
              className="min-h-[44px] px-4 text-sm sm:px-5 sm:text-base"
            >
              Clear
            </Button>
            {onGameEnd && (
              <Button
                onClick={onGameEnd}
                className="min-h-[44px] px-4 text-sm sm:px-5 sm:text-base"
              >
                Done
              </Button>
            )}
          </div>
        </div>

        <div
          ref={containerRef}
          className="relative flex-1 min-h-[280px] overflow-hidden rounded-2xl border border-border bg-background shadow-inner sm:min-h-[360px] md:min-h-[460px] lg:min-h-[560px]"
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishDrawing}
            onPointerLeave={finishDrawing}
            onPointerCancel={finishDrawing}
          />
        </div>
      </div>
    </div>
  );
}
