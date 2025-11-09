import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../chat_interface/ui/button';

interface AccessibilityToolbarProps {
  open: boolean;
  onClose: () => void;
}

const FONT_MIN = 90;
const FONT_MAX = 130;
const FONT_STEP = 10;
const STORAGE_KEY = 'calme-accessibility';

interface AccessibilityState {
  fontScale: number;
  highContrast: boolean;
  dyslexicFont: boolean;
  highlightLinks: boolean;
  reduceMotion: boolean;
}

const defaultState: AccessibilityState = {
  fontScale: 100,
  highContrast: false,
  dyslexicFont: false,
  highlightLinks: false,
  reduceMotion: false,
};

const features: Array<{
  key: keyof Omit<AccessibilityState, 'fontScale'>;
  title: string;
  description: string;
}> = [
  {
    key: 'highContrast',
    title: 'High contrast',
    description: 'Boosts color contrast for improved readability.',
  },
  {
    key: 'dyslexicFont',
    title: 'Readable font',
    description: 'Switches body copy to a dyslexia-friendly font stack.',
  },
  {
    key: 'highlightLinks',
    title: 'Highlight links',
    description: 'Adds strong underlines and outlines to every link.',
  },
  {
    key: 'reduceMotion',
    title: 'Reduce motion',
    description: 'Disables UI animations and transitions.',
  },
];

export function AccessibilityToolbar({ open, onClose }: AccessibilityToolbarProps) {
  const [state, setState] = useState<AccessibilityState>(defaultState);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as AccessibilityState;
        setState(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('Unable to load accessibility settings', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Unable to persist accessibility settings', error);
    }
  }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--calme-font-scale', `${state.fontScale}%`);
    root.style.fontSize = `${state.fontScale}%`;
    root.classList.toggle('a11y-high-contrast', state.highContrast);
    root.classList.toggle('a11y-dyslexic-font', state.dyslexicFont);
    root.classList.toggle('a11y-highlight-links', state.highlightLinks);
    root.classList.toggle('a11y-reduce-motion', state.reduceMotion);

    return () => {
      root.classList.remove('a11y-high-contrast', 'a11y-dyslexic-font', 'a11y-highlight-links', 'a11y-reduce-motion');
      root.style.removeProperty('--calme-font-scale');
      root.style.fontSize = '';
    };
  }, [state]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => {
      previouslyFocused?.focus();
    };
  }, [open]);

  const decreaseFont = () => {
    setState(prev => ({ ...prev, fontScale: Math.max(FONT_MIN, prev.fontScale - FONT_STEP) }));
  };

  const increaseFont = () => {
    setState(prev => ({ ...prev, fontScale: Math.min(FONT_MAX, prev.fontScale + FONT_STEP) }));
  };

  const resetAll = () => {
    setState(defaultState);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:p-8" aria-hidden={!open}>
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="accessibility-toolbar-title"
        className="relative z-50 w-full max-w-lg rounded-3xl border border-border/70 bg-card shadow-2xl"
        ref={dialogRef}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border/80 px-5 py-4">
          <div>
            <h2 id="accessibility-toolbar-title" className="text-lg font-semibold text-foreground">
              Accessibility options
            </h2>
            <p className="text-sm text-muted-foreground">
              Adjust contrast, text size, motion, and link emphasis without leaving the page.
            </p>
          </div>
          <Button variant="ghost" size="icon" aria-label="Close" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </header>

        <div className="space-y-6 px-5 py-4">
          <section className="rounded-2xl border border-border/60 bg-muted/40 p-4">
            <p className="text-sm font-semibold text-muted-foreground">Text size</p>
            <div className="mt-3 flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={decreaseFont} aria-label="Decrease font size">
                A−
              </Button>
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>90%</span>
                  <span>130%</span>
                </div>
                <input
                  type="range"
                  min={FONT_MIN}
                  max={FONT_MAX}
                  step={FONT_STEP}
                  value={state.fontScale}
                  onChange={(event) =>
                    setState(prev => ({ ...prev, fontScale: Number(event.target.value) }))
                  }
                  className="mt-1 w-full"
                  aria-label="Adjust base font size"
                />
              </div>
              <Button variant="secondary" size="sm" onClick={increaseFont} aria-label="Increase font size">
                A+
              </Button>
              <span className="min-w-[2ch] text-sm font-semibold text-foreground">{state.fontScale}%</span>
            </div>
          </section>

          <section className="space-y-3">
            {features.map(({ key, title, description }) => (
              <button
                key={key}
                type="button"
                onClick={() => setState(prev => ({ ...prev, [key]: !prev[key] }))}
                className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition hover:border-primary/60 ${
                  state[key] ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <span
                  aria-hidden
                  className={`mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border ${
                    state[key] ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                  }`}
                >
                  {state[key] ? '✓' : ''}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">{title}</span>
                  <span className="text-xs text-muted-foreground">{description}</span>
                </span>
              </button>
            ))}
          </section>
        </div>

        <footer className="flex flex-col gap-3 border-t border-border/80 px-5 py-4 sm:flex-row sm:justify-between">
          <Button variant="ghost" onClick={resetAll} className="justify-center">
            Reset defaults
          </Button>
          <Button onClick={onClose} className="justify-center">
            Done
          </Button>
        </footer>
      </div>
    </div>
  );
}
