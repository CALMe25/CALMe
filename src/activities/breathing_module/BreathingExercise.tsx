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
    <div style={{
      padding: '12px',
      background: 'linear-gradient(180deg, #0f172a 0%, #111827 100%)',
      height: '100%',
      maxHeight: '100vh',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      color: '#f8fafc',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ maxWidth: '620px', margin: '0 auto', width: '100%', padding: '0 8px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>Breathing Exercise</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Follow the rhythm to calm your nervous system.</p>
          </div>
          {onGameEnd && (
            <button
              onClick={onGameEnd}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                borderRadius: '999px',
                border: '1px solid rgba(148,163,184,0.4)',
                background: 'transparent',
                color: '#94a3b8',
                fontSize: '0.75rem',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <span style={{ fontSize: '0.875rem', lineHeight: 1 }}>✕</span>
              Exit
            </button>
          )}
        </header>

        <section style={{
          display: 'grid',
          gap: '12px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          marginBottom: '20px',
        }}>
          {Object.entries(TIMING_PRESETS).map(([keyName, preset]) => (
            <button
              key={keyName}
              onClick={() => setPresetKey(keyName as keyof typeof TIMING_PRESETS)}
              style={{
                padding: '12px 14px',
                borderRadius: '16px',
                border: presetKey === keyName ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(148,163,184,0.2)',
                background: presetKey === keyName ? 'rgba(37, 99, 235, 0.15)' : 'rgba(148,163,184,0.08)',
                color: '#e2e8f0',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all .2s ease'
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>{preset.label}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                {preset.timings[0] / 1000}s inhale · {preset.timings[1] / 1000}s hold · {preset.timings[2] / 1000}s exhale
              </div>
            </button>
          ))}

          <div style={{
            padding: '12px 16px',
            borderRadius: '16px',
            border: '1px solid rgba(148,163,184,0.2)',
            background: 'rgba(148,163,184,0.05)',
            color: '#e2e8f0'
          }}>
            <div style={{ fontWeight: 600, marginBottom: '8px' }}>Cycles</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setRepeatCount(prev => Math.max(2, prev - 1))}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  border: '1px solid rgba(148,163,184,0.3)',
                  background: 'transparent',
                  color: '#e2e8f0',
                  fontSize: '1.25rem',
                  lineHeight: 1,
                  cursor: 'pointer'
                }}
              >
                −
              </button>
              <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>{repeatCount}</span>
              <button
                onClick={() => setRepeatCount(prev => Math.min(12, prev + 1))}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  border: '1px solid rgba(148,163,184,0.3)',
                  background: 'transparent',
                  color: '#e2e8f0',
                  fontSize: '1.25rem',
                  lineHeight: 1,
                  cursor: 'pointer'
                }}
              >
                +
              </button>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>
              Recommended: 4–8 cycles for a complete calm down.
            </p>
          </div>
        </section>

        <div style={{
          position: 'relative',
          height: '280px',
          borderRadius: '20px',
          background: 'radial-gradient(circle at top, rgba(59,130,246,0.12), transparent 65%)',
          border: '1px solid rgba(59,130,246,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#bae6fd',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontSize: '0.75rem'
          }}>
            {label}
          </div>
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#cbd5f5',
            fontSize: '0.85rem'
          }}>
            {isActive ? 'Follow the breathing guide' : 'Paused'}
          </div>

          {isActive && (
            <BreathingCircle key={`${key}-${presetKey}-${repeatCount}`} timings={timings} repeat={repeatCount} />
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={restartExercise}
            style={{
              flex: '1 1 140px',
              padding: '10px 14px',
              backgroundColor: '#1d4ed8',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background .2s'
            }}
          >
            Restart Exercise
          </button>
          <button
            onClick={handleComplete}
            style={{
              flex: '1 1 140px',
              padding: '10px 14px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background .2s'
            }}
          >
            I Feel Better
          </button>
        </div>

        <div style={{
          padding: '14px',
          borderRadius: '14px',
          background: 'rgba(148,163,184,0.08)',
          border: '1px solid rgba(148,163,184,0.15)',
          color: '#94a3b8',
          fontSize: '0.85rem'
        }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px', color: '#e2e8f0' }}>How it helps</h3>
          <ul style={{ paddingLeft: '18px', margin: 0 }}>
            <li style={{ marginBottom: '6px' }}>Inhale through your nose for 4 seconds</li>
            <li style={{ marginBottom: '6px' }}>Hold your breath gently for 7 seconds — allow your body to soften</li>
            <li>Exhale slowly through your mouth for 8 seconds, imagining stress leaving your body</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
