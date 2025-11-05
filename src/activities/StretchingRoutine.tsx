import { useState } from 'react';

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
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const startExercise = () => {
    setIsActive(true);
    setTimeRemaining(exercises[currentExercise].duration);

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimer(interval);
  };

  const nextExercise = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }

    if (currentExercise < exercises.length - 1) {
      const next = currentExercise + 1;
      setCurrentExercise(next);
      setTimeRemaining(exercises[next].duration);
      setIsActive(false);
    }
  };

  const previousExercise = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }

    if (currentExercise > 0) {
      const prev = currentExercise - 1;
      setCurrentExercise(prev);
      setTimeRemaining(exercises[prev].duration);
      setIsActive(false);
    }
  };

  const resetRoutine = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    setCurrentExercise(0);
    setTimeRemaining(exercises[0].duration);
    setIsActive(false);
  };

  const exercise = exercises[currentExercise];
  const progress = ((exercise.duration - timeRemaining) / exercise.duration) * 100;

  return (
    <div className="flex flex-col items-center justify-center p-6 text-white h-full">
      <h2 className="text-3xl font-bold text-sky-400 mb-2">Stretching Routine</h2>
      <p className="text-gray-300 mb-6">Exercise {currentExercise + 1} of {exercises.length}</p>

      <div className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full shadow-xl">
        <h3 className="text-2xl font-semibold mb-2">{exercise.name}</h3>
        <p className="text-gray-400 mb-4">{exercise.description}</p>

        {/* Timer Display */}
        <div className="mb-6">
          <div className="text-5xl font-bold text-sky-400 text-center mb-2">
            {timeRemaining}s
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-sky-400 h-full transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3">Instructions:</h4>
          <ol className="list-decimal list-inside space-y-2">
            {exercise.instructions.map((instruction, index) => (
              <li key={index} className="text-gray-300">
                {instruction}
              </li>
            ))}
          </ol>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3 justify-center mb-4">
          <button
            onClick={previousExercise}
            disabled={currentExercise === 0}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            ← Previous
          </button>

          <button
            onClick={isActive ? () => {
              if (timer) clearInterval(timer);
              setIsActive(false);
            } : startExercise}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              isActive
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-sky-500 hover:bg-sky-600'
            }`}
          >
            {isActive ? 'Pause' : timeRemaining === 0 ? 'Restart' : 'Start'}
          </button>

          <button
            onClick={nextExercise}
            disabled={currentExercise === exercises.length - 1}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Next →
          </button>
        </div>

        <button
          onClick={resetRoutine}
          className="w-full px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors"
        >
          Reset Routine
        </button>
      </div>

      <p className="mt-6 text-gray-400 text-sm text-center max-w-md">
        Take your time with each stretch. Listen to your body and never force a movement.
      </p>
    </div>
  );
}
