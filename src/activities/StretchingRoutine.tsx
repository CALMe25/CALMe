import { useEffect, useRef, useState } from 'react';

interface Exercise {
  id: number;
  name: string;
  duration: number; // in seconds
  description: string;
  instructions: string[];
}

const exercises: Exercise[] = [
  {
    id: 1,
    name: 'Neck Rolls',
    duration: 30,
    description: 'Gentle neck stretches to release tension',
    instructions: [
      'Sit or stand with good posture',
      'Slowly roll your head in a circular motion',
      'Complete 5 circles clockwise',
      'Then 5 circles counterclockwise',
    ],
  },
  {
    id: 2,
    name: 'Shoulder Shrugs',
    duration: 30,
    description: 'Release shoulder tension',
    instructions: [
      'Stand with arms at your sides',
      'Lift shoulders up toward ears',
      'Hold for 3 seconds',
      'Release and repeat 10 times',
    ],
  },
  {
    id: 3,
    name: 'Arm Circles',
    duration: 45,
    description: 'Loosen shoulder joints',
    instructions: [
      'Extend arms straight out to sides',
      'Make small circles forward for 15 seconds',
      'Make small circles backward for 15 seconds',
      'Rest for 15 seconds',
    ],
  },
  {
    id: 4,
    name: 'Side Stretch',
    duration: 40,
    description: 'Stretch your sides and obliques',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Raise one arm overhead',
      'Lean to the opposite side',
      'Hold for 20 seconds each side',
    ],
  },
  {
    id: 5,
    name: 'Forward Fold',
    duration: 30,
    description: 'Stretch hamstrings and lower back',
    instructions: [
      'Stand with feet hip-width apart',
      'Slowly fold forward from hips',
      'Let arms hang or hold opposite elbows',
      'Breathe deeply for 30 seconds',
    ],
  },
];

export default function StretchingRoutine() {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(exercises[0].duration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startExercise = () => {
    setIsActive(true);
    setTimeRemaining(exercises[currentExercise].duration);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          timerRef.current = null;
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    timerRef.current = interval;
  };

  const nextExercise = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (currentExercise < exercises.length - 1) {
      const next = currentExercise + 1;
      setCurrentExercise(next);
      setTimeRemaining(exercises[next].duration);
      setIsActive(false);
    }
  };

  const previousExercise = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (currentExercise > 0) {
      const prev = currentExercise - 1;
      setCurrentExercise(prev);
      setTimeRemaining(exercises[prev].duration);
      setIsActive(false);
    }
  };

  const resetRoutine = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCurrentExercise(0);
    setTimeRemaining(exercises[0].duration);
    setIsActive(false);
  };

  const exercise = exercises[currentExercise];
  const progress = ((exercise.duration - timeRemaining) / exercise.duration) * 100;

  return (
    <div className="flex h-full w-full flex-col items-center overflow-y-auto bg-background p-3 text-foreground sm:p-4 md:p-6">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary">Stretching Routine</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Exercise {currentExercise + 1} of {exercises.length}</p>
        </div>

        <div className="mt-4 rounded-2xl bg-card p-4 shadow-xl sm:p-5 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-8">
            <div className="flex-1">
              <h3 className="text-xl sm:text-2xl font-semibold mb-1 text-primary">{exercise.name}</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">{exercise.description}</p>

              <div className="mb-5 sm:mb-6">
                <div className="text-4xl sm:text-5xl font-bold text-primary text-center mb-2">
                  {timeRemaining}s
                </div>
                <div className="w-full bg-secondary rounded-full h-2.5 sm:h-3 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-1000 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 rounded-xl border border-border/60 bg-muted/30 p-3 sm:p-4">
              <h4 className="text-base sm:text-lg font-semibold mb-3 text-primary">Instructions</h4>
              <ol className="list-decimal list-inside space-y-2">
                {exercise.instructions.map((instruction, index) => (
                  <li key={index} className="text-sm sm:text-base text-muted-foreground">
                    {instruction}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="sticky bottom-3 z-20 mt-6 space-y-2 rounded-2xl border border-border/60 bg-card/95 p-3 shadow-lg backdrop-blur-sm xs:flex xs:flex-col xs:space-y-2 sm:static sm:mt-6 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-0 sm:space-y-0">
            <div className="flex flex-col gap-2 xs:flex-row xs:flex-wrap sm:gap-3">
              <button
                onClick={previousExercise}
                disabled={currentExercise === 0}
                className="min-h-[44px] flex-1 rounded-lg bg-secondary px-4 py-2 text-sm transition-all hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
              >
                ← Previous
              </button>

              <button
                onClick={isActive ? () => {
                if (timerRef.current) {
                  clearInterval(timerRef.current);
                  timerRef.current = null;
                }
                  setIsActive(false);
                } : startExercise}
                className={`min-h-[44px] flex-1 rounded-lg px-6 py-2 text-sm font-semibold transition-all active:scale-95 sm:text-base ${isActive ? 'bg-destructive text-destructive-foreground hover:bg-destructive/80' : 'bg-primary text-primary-foreground hover:bg-primary/80'}`}>
                {isActive ? 'Pause' : timeRemaining === 0 ? 'Restart' : 'Start'}
              </button>

              <button
                onClick={nextExercise}
                disabled={currentExercise === exercises.length - 1}
                className="min-h-[44px] flex-1 rounded-lg bg-secondary px-4 py-2 text-sm transition-all hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
              >
                Next →
              </button>
            </div>

            <button
              onClick={resetRoutine}
              className="w-full min-h-[44px] rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground transition-all hover:bg-primary/80 active:scale-95 sm:text-base"
            >
              Reset Routine
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground sm:text-sm">
          Take your time with each stretch. Listen to your body and never force a movement.
        </p>
      </div>
    </div>
  );
}
