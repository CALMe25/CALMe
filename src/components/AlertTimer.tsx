// Removed unused import

interface AlertTimerProps {
  timeRemaining: number | null;
}

export function AlertTimer({ timeRemaining }: AlertTimerProps) {
  if (timeRemaining === null) return null;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-full animate-pulse">
      <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
      <span className="text-sm font-medium">
        {minutes}:{seconds.toString().padStart(2, "0")}
      </span>
      <span className="text-xs opacity-75">Alert Active</span>
    </div>
  );
}
