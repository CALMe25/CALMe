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
  const [isCompactLayout, setIsCompactLayout] = useState(false);

  useEffect(() => {
    setKey(prev => prev + 1);
  }, [presetKey, repeatCount]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') return;
    const media = window.matchMedia('(max-height: 600px)');
    const handleChange = () => setIsCompactLayout(media.matches);
    handleChange();
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', handleChange);
      return () => media.removeEventListener('change', handleChange);
    } else {
      media.addListener(handleChange);
      return () => media.removeListener(handleChange);
    }
  }, []);

  const { timings, label } = TIMING_PRESETS[presetKey];

  const renderPresetButton = (keyName: string, label: string, timing: BreathingTimings) => (
    <button
      key={keyName}
      onClick={() => setPresetKey(keyName as keyof typeof TIMING_PRESETS)}
      className={`w-full p-2.5 sm:p-3 rounded-2xl border text-left transition-all duration-200 min-h-[60px] active:scale-95 ${
        presetKey === keyName
          ? 'border-blue-400 bg-blue-50 dark:bg-blue-500/15 dark:border-blue-500/30'
          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
      }`}
    >
      <div className="font-semibold text-sm sm:text-base text-slate-800 dark:text-slate-200 mb-1">{label}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400">
        {timing[0] / 1000}s · {timing[1] / 1000}s · {timing[2] / 1000}s
      </div>
    </button>
  );

  const presetCards = Object.entries(TIMING_PRESETS).map(([keyName, preset]) => ({
    key: keyName,
    node: renderPresetButton(keyName, preset.label, preset.timings),
  }));

  const cyclesCard = (
    <div
      key="cycles"
      className="p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 min-h-[60px]"
    >
      <div className="font-semibold text-sm sm:text-base mb-2">Cycles</div>
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => setRepeatCount(prev => Math.max(2, prev - 1))}
          className="w-9 h-9 sm:w-10 sm:h-10 min-w-[44px] min-h-[44px] rounded-md border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 text-xl leading-none active:scale-95"
        >
          −
        </button>
        <span className="text-base sm:text-lg font-semibold min-w-[2ch] text-center">{repeatCount}</span>
        <button
          onClick={() => setRepeatCount(prev => Math.min(12, prev + 1))}
          className="w-9 h-9 sm:w-10 sm:h-10 min-w-[44px] min-h-[44px] rounded-md border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 text-xl leading-none active:scale-95"
        >
          +
        </button>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 hidden xs:block">
        Recommended: 4–8 cycles.
      </p>
    </div>
  );

  const allCards = [...presetCards, { key: 'cycles', node: cyclesCard }];

  const handleComplete = () => {
    setIsActive(false);
    onGameEnd?.();
  };

  const restartExercise = () => {
    setIsActive(true);
    setKey(prev => prev + 1);
  };

  return (
    <div className="p-3 sm:p-4 bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-800 h-full max-h-screen overflow-y-auto flex flex-col text-slate-900 dark:text-slate-50 font-sans">
      <div className="max-w-xl mx-auto w-full px-2">
        <header className="flex justify-between items-center mb-3 sm:mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">Breathing Exercise</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">Follow the rhythm to calm your nervous system.</p>
          </div>
        </header>

        {isCompactLayout ? (
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1 sm:mb-5">
            {allCards.map(({ key, node }) => (
              <div key={key} className="min-w-[200px] flex-shrink-0">
                {node}
              </div>
            ))}
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-2 sm:gap-3 md:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] mb-4 sm:mb-5">
            {allCards.map(({ key, node }) => (
              <div key={key}>{node}</div>
            ))}
          </section>
        )}

        <div className="relative min-h-[14rem] xs:min-h-[16rem] sm:min-h-[20rem] lg:min-h-[24rem] rounded-2xl bg-slate-100 dark:bg-slate-800/50 dark:bg-radial-gradient-t-blue-900/30 border border-slate-200 dark:border-blue-500/20 flex items-center justify-center mb-4 sm:mb-5 overflow-hidden">
          <div className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 text-blue-400 dark:text-blue-300 font-semibold tracking-widest uppercase text-xs">{label}</div>
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 text-slate-600 dark:text-slate-400 text-xs sm:text-sm">{isActive ? 'Follow the breathing guide' : 'Paused'}</div>

          {isActive && (
            <BreathingCircle key={`${key}-${presetKey}-${repeatCount}`} timings={timings} repeat={repeatCount} />
          )}
        </div>

        <div className="sticky bottom-0 z-10 mb-4 flex flex-col gap-2 rounded-2xl bg-white/90 p-2 shadow-sm backdrop-blur dark:bg-slate-900/80 xs:flex-row xs:items-center sm:gap-3 md:static md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none">
          <button
            onClick={restartExercise}
            className="flex-1 min-h-[48px] p-3 bg-blue-600 text-white border-none rounded-xl text-sm font-semibold cursor-pointer transition-all hover:bg-blue-700 active:scale-95">
            Restart Exercise
          </button>
          <button
            onClick={handleComplete}
            className="flex-1 min-h-[48px] p-3 bg-emerald-500 text-white border-none rounded-xl text-sm font-semibold cursor-pointer transition-all hover:bg-emerald-600 active:scale-95">
            I Feel Better
          </button>
        </div>

        <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
          <h3 className="text-sm sm:text-base font-semibold mb-2 text-slate-700 dark:text-slate-200">How it helps</h3>
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
