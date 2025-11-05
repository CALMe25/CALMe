import { useEffect, useState } from 'react';
import BreathingCircle from './BreathingCircle';

type BreathingTimings = [number, number, number];

interface BreathingExerciseProps {
  onGameEnd?: () => void;
}

const TIMING_PRESETS: Record<string, { timings: BreathingTimings; label: string }> = {
  classic: {
    timings: [4000, 7000, 8000],
    label: 'Classic 4-7-8',
  },
  short: {
    timings: [3000, 5000, 6000],
    label: 'Calm Starter',
  },
  gentle: {
    timings: [5000, 5000, 6000],
    label: 'Gentle Flow',
  },
};

export default function BreathingExercise({ onGameEnd }: BreathingExerciseProps) {
  const [presetKey, setPresetKey] = useState<keyof typeof TIMING_PRESETS>('classic');
  const [key, setKey] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [repeatCount, setRepeatCount] = useState(4);

  useEffect(() => {
    setKey(prev => prev + 1);
  }, [presetKey, repeatCount]);

  const { timings, label } = TIMING_PRESETS[presetKey];

  const handleComplete = () => {
    setIsActive(false);
    onGameEnd?.();
  };

  const restartExercise = () => {
    setIsActive(true);
    setKey(prev => prev + 1);
  };

  return (
    <div className="p-3 bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-800 h-full max-h-screen overflow-y-auto flex flex-col text-slate-900 dark:text-slate-50 font-sans">
      <div className="max-w-xl mx-auto w-full px-2">
        <header className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">Breathing Exercise</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Follow the rhythm to calm your nervous system.</p>
          </div>
        </header>

        <section className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-5">
          {Object.entries(TIMING_PRESETS).map(([keyName, preset]) => (
            <button
              key={keyName}
              onClick={() => setPresetKey(keyName as keyof typeof TIMING_PRESETS)}
              className={`p-3 rounded-2xl border text-left transition-all duration-200 ${presetKey === keyName ? 'border-blue-400 bg-blue-50 dark:bg-blue-500/15 dark:border-blue-500/30' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'}`}>
              <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{preset.label}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {preset.timings[0] / 1000}s inhale · {preset.timings[1] / 1000}s hold · {preset.timings[2] / 1000}s exhale
              </div>
            </button>
          ))}

          <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200">
            <div className="font-semibold mb-2">Cycles</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRepeatCount(prev => Math.max(2, prev - 1))}
                className="w-8 h-8 rounded-md border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 text-xl leading-none">
                −
              </button>
              <span className="text-lg font-semibold">{repeatCount}</span>
              <button
                onClick={() => setRepeatCount(prev => Math.min(12, prev + 1))}
                className="w-8 h-8 rounded-md border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 text-xl leading-none">
                +
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              Recommended: 4–8 cycles.
            </p>
          </div>
        </section>

        <div className="relative h-72 rounded-2xl bg-slate-100 dark:bg-slate-800/50 dark:bg-radial-gradient-t-blue-900/30 border border-slate-200 dark:border-blue-500/20 flex items-center justify-center mb-5 overflow-hidden">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-blue-400 dark:text-blue-300 font-semibold tracking-widest uppercase text-xs">{label}</div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-slate-600 dark:text-slate-400 text-sm">{isActive ? 'Follow the breathing guide' : 'Paused'}</div>

          {isActive && (
            <BreathingCircle key={`${key}-${presetKey}-${repeatCount}`} timings={timings} repeat={repeatCount} />
          )}
        </div>

        <div className="flex gap-3 mb-4 flex-wrap">
          <button
            onClick={restartExercise}
            className="flex-1 basis-32 p-2.5 bg-blue-600 text-white border-none rounded-xl text-sm font-semibold cursor-pointer transition-colors hover:bg-blue-700">
            Restart Exercise
          </button>
          <button
            onClick={handleComplete}
            className="flex-1 basis-32 p-2.5 bg-emerald-500 text-white border-none rounded-xl text-sm font-semibold cursor-pointer transition-colors hover:bg-emerald-600">
            I Feel Better
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm">
          <h3 className="text-base font-semibold mb-2 text-slate-700 dark:text-slate-200">How it helps</h3>
          <ul className="list-disc list-inside space-y-1.5">
            <li>Inhale through your nose for 4 seconds</li>
            <li>Hold your breath gently for 7 seconds — allow your body to soften</li>
            <li>Exhale slowly through your mouth for 8 seconds, imagining stress leaving your body</li>
          </ul>
        </div>
      </div>
    </div>
  );
}