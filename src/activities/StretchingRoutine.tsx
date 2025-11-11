import { useEffect, useRef, useState, useMemo } from "react";
import { useI18n } from "../i18n";

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

interface ExerciseData {
  name: string;
  description: string;
  instructions: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isExerciseData(value: unknown): value is ExerciseData {
  if (!isRecord(value)) return false;
  return (
    typeof value.name === "string" &&
    typeof value.description === "string" &&
    Array.isArray(value.instructions) &&
    value.instructions.every((item) => typeof item === "string")
  );
}

export default function StretchingRoutine() {
  const { t, messages } = useI18n();

  const exercises: Exercise[] = useMemo(() => {
    if (!isRecord(messages)) return [];
    const activities = messages.activities;
    if (!isRecord(activities)) return [];
    const stretching = activities.stretching;
    if (!isRecord(stretching)) return [];
    const exercisesData = stretching.exercises;
    if (!isRecord(exercisesData)) return [];

    return EXERCISE_KEYS.map((key, index) => {
      const exerciseValue = exercisesData[key];
      if (!isExerciseData(exerciseValue)) {
        return {
          id: index + 1,
          name: "",
          duration: EXERCISE_DURATIONS[index],
          description: "",
          instructions: [],
        };
      }
      return {
        id: index + 1,
        name: exerciseValue.name,
        duration: EXERCISE_DURATIONS[index],
        description: exerciseValue.description,
        instructions: exerciseValue.instructions,
      };
    });
  }, [messages]);
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
            {t("activities.stretching.title")}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t("activities.stretching.exerciseProgress", {
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
                {t("activities.stretching.instructions")}
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
                {t("activities.stretching.previous")}
              </button>

              <button
                onClick={isActive ? pauseExercise : startExercise}
                className={`min-h-[44px] flex-1 rounded-lg px-6 py-2 text-sm font-semibold transition-all active:scale-95 sm:text-base ${isActive ? "bg-destructive text-destructive-foreground hover:bg-destructive/80" : "bg-primary text-primary-foreground hover:bg-primary/80"}`}
              >
                {isActive
                  ? t("activities.stretching.pause")
                  : timeRemaining === 0
                    ? t("activities.stretching.restart")
                    : t("activities.stretching.start")}
              </button>

              <button
                onClick={nextExercise}
                disabled={currentExercise === exercises.length - 1}
                className="min-h-[44px] flex-1 rounded-lg bg-secondary px-4 py-2 text-sm transition-all hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
              >
                {t("activities.stretching.next")}
              </button>
            </div>

            <button
              onClick={resetRoutine}
              className="w-full min-h-[44px] rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground transition-all hover:bg-primary/80 active:scale-95 sm:text-base"
            >
              {t("activities.stretching.reset")}
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground sm:text-sm">
          {t("activities.stretching.disclaimer")}
        </p>
      </div>
    </div>
  );
}
