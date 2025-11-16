import React, { useEffect, useRef, useState } from "react";
import { Button } from "../chat_interface/ui/button";
import { m } from "../paraglide/messages.js";
import { useUserPreferences } from "../contexts/UserPreferencesContext";

interface DigitalCanvasProps {
  onGameEnd?: () => void;
}

const BRUSH_SIZES = [3, 6, 10, 16] as const;
const PALETTE = [
  "var(--foreground)",
  "#ef4444",
  "#f97316",
  "#facc15",
  "#22c55e",
  "#0ea5e9",
  "#a855f7",
  "#ec4899",
  "var(--background)",
] as const;

const getCssVariableValue = (variable: string) => {
  if (variable.startsWith("var(")) {
    const varName = variable.substring(4, variable.length - 1);
    return getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
  }
  return variable;
};

export default function DigitalCanvas({ onGameEnd }: DigitalCanvasProps) {
  const { userGender } = useUserPreferences();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState<(typeof BRUSH_SIZES)[number]>(
    BRUSH_SIZES[1],
  );
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

      const context = canvas.getContext("2d");
      if (!context) return;

      context.scale(dpr, dpr);
      context.lineCap = "round";
      context.lineJoin = "round";
      context.lineWidth = brushSize;
      context.strokeStyle = getCssVariableValue(brushColor);
      context.fillStyle = getComputedStyle(
        document.documentElement,
      ).getPropertyValue("--background");
      context.fillRect(0, 0, rect.width, rect.height);

      contextRef.current = context;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [brushColor, brushSize]);

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

  const getCanvasCoordinates = (
    event: React.PointerEvent<HTMLCanvasElement>,
  ) => {
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
    context.fillStyle = getComputedStyle(
      document.documentElement,
    ).getPropertyValue("--background");
    context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  };

  return (
    <div className="flex h-full w-full items-center justify-center bg-background p-2 sm:p-3 md:p-4 text-foreground overflow-hidden">
      <div className="flex h-full w-full max-w-5xl flex-col gap-3 sm:gap-4 lg:gap-5 rounded-2xl border border-border bg-card p-2 sm:p-3 md:p-4 shadow-lg">
        {/* Toolbar - properly responsive with proportional scaling */}
        <div className="flex flex-col gap-2.5 sm:gap-3 rounded-xl border border-border bg-muted/50 p-2.5 sm:p-3 md:p-4 shadow-lg">
          {/* Brush sizes section */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <div className="font-semibold text-[10px] xs:text-xs sm:text-sm whitespace-nowrap">
              {m.activities_paint_brush()}
            </div>
            <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-1.5">
              {BRUSH_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setBrushSize(size);
                  }}
                  className={`flex h-7 w-7 xs:h-8 xs:w-8 sm:h-10 sm:w-10 md:h-11 md:w-11 items-center justify-center rounded-full border transition active:scale-95 ${brushSize === size ? "border-primary bg-primary/20 scale-105" : "border-border bg-secondary"}`}
                >
                  <span
                    className="rounded-full bg-foreground"
                    style={{
                      width: Math.max(3, size / 2 + 1),
                      height: Math.max(3, size / 2 + 1),
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Colors section */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <div className="font-semibold text-[10px] xs:text-xs sm:text-sm whitespace-nowrap">
              {m.activities_paint_colors()}
            </div>
            <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-1.5 overflow-x-auto scrollbar-hide pr-1">
              {PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`h-7 w-7 xs:h-8 xs:w-8 sm:h-10 sm:w-10 md:h-11 md:w-11 rounded-full border transition active:scale-95 flex-shrink-0 ${brushColor === color ? "border-primary scale-105 ring-1 ring-primary ring-offset-0" : "border-border"}`}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    setBrushColor(color);
                  }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5 justify-end pt-1">
            <Button
              variant="secondary"
              onClick={handleClear}
              className="min-h-[44px] h-10 sm:h-11 px-4 sm:px-5 text-sm sm:text-base"
            >
              {m.activities_paint_clear({ userGender })}
            </Button>
            {onGameEnd && (
              <Button
                variant="default"
                onClick={onGameEnd}
                className="min-h-[44px] h-10 sm:h-11 px-4 sm:px-5 text-sm sm:text-base"
              >
                {m.activities_paint_done()}
              </Button>
            )}
          </div>
        </div>

        {/* Canvas area - properly responsive */}
        <div className="relative flex-1 min-h-[280px] sm:min-h-[380px] md:min-h-[480px] lg:min-h-[560px] overflow-hidden rounded-2xl border border-border bg-background shadow-inner">
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
