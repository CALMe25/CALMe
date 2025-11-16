import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { m } from "../paraglide/messages.js";
import { useLanguage } from "../contexts/LanguageContext";
import { useUserPreferences } from "../contexts/UserPreferencesContext";

interface Exercise {
  id: number;
  name: string;
  duration: number; // in seconds
  description: string;
  instructions: string[];
}

const EXERCISE_KEYS = [
  "neckRolls",
  "shoulderShrugs",
  "armCircles",
  "sideStretch",
  "forwardFold",
] as const;

const EXERCISE_DURATIONS = [30, 30, 45, 40, 30];

export default function StretchingRoutine() {
  const { currentLocale } = useLanguage();
  const { userGender } = useUserPreferences();

  const buildInstructions = useCallback(
    (
      getter: (args: { step: string; userGender: string }) => string,
      count = 4,
    ) =>
      Array.from({ length: count }, (_, index) =>
        getter({ step: (index + 1).toString(), userGender }),
      ),
    [userGender],
  );

  const exercises: Exercise[] = useMemo(() => {
    // Force recomputation when language changes by referencing currentLocale
    void currentLocale;

    const exercisesMap: Record<string, Exercise> = {
      neckRolls: {
        id: 1,
        name: m.activities_stretching_exercises_neckRolls_name(),
        duration: EXERCISE_DURATIONS[0],
        description: m.activities_stretching_exercises_neckRolls_description(),
        instructions: buildInstructions(
          m.activities_stretching_exercises_neckRolls_instructions,
        ),
      },
      shoulderShrugs: {
        id: 2,
        name: m.activities_stretching_exercises_shoulderShrugs_name(),
        duration: EXERCISE_DURATIONS[1],
        description:
          m.activities_stretching_exercises_shoulderShrugs_description({
            userGender,
          }),
        instructions: buildInstructions(
          m.activities_stretching_exercises_shoulderShrugs_instructions,
        ),
      },
      armCircles: {
        id: 3,
        name: m.activities_stretching_exercises_armCircles_name(),
        duration: EXERCISE_DURATIONS[2],
        description: m.activities_stretching_exercises_armCircles_description({
          userGender,
        }),
        instructions: buildInstructions(
          m.activities_stretching_exercises_armCircles_instructions,
        ),
      },
      sideStretch: {
        id: 4,
        name: m.activities_stretching_exercises_sideStretch_name(),
        duration: EXERCISE_DURATIONS[3],
        description: m.activities_stretching_exercises_sideStretch_description({
          userGender,
        }),
        instructions: buildInstructions(
          m.activities_stretching_exercises_sideStretch_instructions,
        ),
      },
      forwardFold: {
        id: 5,
        name: m.activities_stretching_exercises_forwardFold_name(),
        duration: EXERCISE_DURATIONS[4],
        description: m.activities_stretching_exercises_forwardFold_description({
          userGender,
        }),
        instructions: buildInstructions(
          m.activities_stretching_exercises_forwardFold_instructions,
        ),
      },
    };

    return EXERCISE_KEYS.map((key) => exercisesMap[key]);
  }, [currentLocale, buildInstructions, userGender]);
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
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const initialDuration =
      timeRemaining === 0 ? exercises[currentExercise].duration : timeRemaining;

    setIsActive(true);
    setTimeRemaining(initialDuration);

    let remaining = initialDuration;
    const interval = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(interval);
        timerRef.current = null;
        setIsActive(false);
        setTimeRemaining(0);
        return;
      }
      setTimeRemaining(remaining);
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

  const pauseExercise = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsActive(false);
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
  const progress =
    ((exercise.duration - timeRemaining) / exercise.duration) * 100;

  return (
    <div className="flex h-full w-full flex-col items-center overflow-y-auto bg-background p-3 text-foreground sm:p-4 md:p-6">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary">
            {m.activities_stretching_label()}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            {m.activities_stretching_exerciseProgress({
              current: (currentExercise + 1).toString(),
              total: exercises.length.toString(),
            })}
          </p>
        </div>

        <div className="mt-4 rounded-2xl bg-card p-4 shadow-xl sm:p-5 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-8">
            <div className="flex-1">
              <h3 className="text-xl sm:text-2xl font-semibold mb-1 text-primary">
                {exercise.name}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">
                {exercise.description}
              </p>

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
              <h4 className="text-base sm:text-lg font-semibold mb-3 text-primary">
                {m.activities_stretching_instructions()}
              </h4>
              <ol className="list-decimal list-inside space-y-2">
                {exercise.instructions.map((instruction, index) => (
                  <li
                    key={index}
                    className="text-sm sm:text-base text-muted-foreground"
                  >
                    {instruction}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="sticky bottom-3 z-20 mt-6 space-y-2 rounded-2xl border border-border/60 bg-card/95 p-3 shadow-lg backdrop-blur-0 xs:flex xs:flex-col xs:space-y-2 sm:static sm:mt-6 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-0 sm:space-y-0">
            <div className="flex flex-col gap-2 xs:flex-row xs:flex-wrap sm:gap-3">
              <button
                onClick={previousExercise}
                disabled={currentExercise === 0}
                className="min-h-[44px] flex-1 rounded-lg bg-secondary px-4 py-2 text-sm transition-all hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
              >
                {m.activities_stretching_previous()}
              </button>

              <button
                onClick={isActive ? pauseExercise : startExercise}
                className={`min-h-[44px] flex-1 rounded-lg px-6 py-2 text-sm font-semibold transition-all active:scale-95 sm:text-base ${isActive ? "bg-destructive text-destructive-foreground hover:bg-destructive/80" : "bg-primary text-primary-foreground hover:bg-primary/80"}`}
              >
                {isActive
                  ? m.activities_stretching_pause({ userGender })
                  : timeRemaining === 0
                    ? m.activities_stretching_restart({ userGender })
                    : m.activities_stretching_start({ userGender })}
              </button>

              <button
                onClick={nextExercise}
                disabled={currentExercise === exercises.length - 1}
                className="min-h-[44px] flex-1 rounded-lg bg-secondary px-4 py-2 text-sm transition-all hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
              >
                {m.activities_stretching_next()}
              </button>
            </div>

            <button
              onClick={resetRoutine}
              className="w-full min-h-[44px] rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground transition-all hover:bg-primary/80 active:scale-95 sm:text-base"
            >
              {m.activities_stretching_reset({ userGender })}
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground sm:text-sm">
          {m.activities_stretching_disclaimer({ userGender })}
        </p>
      </div>
    </div>
  );
}
