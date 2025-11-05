import { createContext, type ReactElement } from 'react';
import BreathingExercise from './activities/breathing_module/BreathingExercise';
import MatchingGame from './activities/MatchingGame';

export interface AppInterface {
  name: 'breathing' | 'stretching' | 'matching-cards' | 'sudoku' | 'puzzle' | 'paint';
  type: 'activities' | 'games';
  label: string;
  icon?: ReactElement | undefined;
  main: ReactElement;
  description?: string | undefined;
}

export const InnerApps: AppInterface[] = [
  {
    name: 'breathing',
    type: 'activities',
    label: 'Breathing Exercise',
    icon: <div>🫁</div>,
    main: <BreathingExercise />,
    description: 'A guided breathing exercise to help you relax and focus.',
  },
  {
    name: 'stretching',
    type: 'activities',
    label: 'Stretching Routine',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14.12 10H19V8.2H15.38L13.38 4.87C13.08 4.37 12.54 4.03 11.92 4.03C11.74 4.03 11.58 4.06 11.42 4.11L6.3 5.8L7 7.68L11.42 6.15L12.89 8.54L8 14.89V22H9.8V16.31L13.31 12.9L14.8 14.39V22H16.6V13.89L14.12 10.34V10M8.5 12C9.88 12 11 10.88 11 9.5C11 8.12 9.88 7 8.5 7C7.12 7 6 8.12 6 9.5C6 10.88 7.12 12 8.5 12Z"/>
      </svg>
    ),
    main: (
      <div className="text-center p-6 bg-gray-600 rounded-lg text-white">
        <p className="text-xl font-bold mb-2">Stretching Routine App</p>
        <p>Content for various stretching exercises will go here.</p>
      </div>
    ),
    description: 'Follow along with simple stretching exercises to improve flexibility.',
  },
  {
    name: 'matching-cards',
    type: 'games',
    label: 'Matching Cards',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <g>
          <rect x="2" y="4" width="4" height="6" rx="1" opacity="0.3" />
          <rect x="7" y="4" width="4" height="6" rx="1" fill="currentColor" />
          <rect x="12" y="4" width="4" height="6" rx="1" opacity="0.3" />
          <rect x="17" y="4" width="4" height="6" rx="1" fill="currentColor" />
          <rect x="2" y="12" width="4" height="6" rx="1" fill="currentColor" />
          <rect x="7" y="12" width="4" height="6" rx="1" opacity="0.3" />
          <rect x="12" y="12" width="4" height="6" rx="1" fill="currentColor" />
          <rect x="17" y="12" width="4" height="6" rx="1" opacity="0.3" />
        </g>
      </svg>
    ),
    main: <MatchingGame onGameEnd={() => {}} />,
    description: 'Test your memory and concentration with this classic matching game.',
  },
  {
    name: 'sudoku',
    type: 'games',
    label: 'Sudoku',
    icon: (
      <div className="w-5 h-5 border border-current grid grid-cols-3 gap-0.5">
        <div className="bg-current"></div>
        <div></div>
        <div className="bg-current"></div>
        <div></div>
        <div className="bg-current"></div>
        <div></div>
        <div className="bg-current"></div>
        <div></div>
        <div className="bg-current"></div>
      </div>
    ),
    main: (
      <div className="text-center p-6 bg-gray-600 rounded-lg text-white">
        <p className="text-xl font-bold mb-2">Sudoku Game</p>
        <p>The interactive Sudoku grid will appear here.</p>
      </div>
    ),
    description: 'A challenging number puzzle game to sharpen your logic skills.',
  },
  {
    name: 'puzzle',
    type: 'games',
    label: 'Jigsaw Puzzle',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z"/>
      </svg>
    ),
    main: (
      <div className="text-center p-6 bg-gray-600 rounded-lg text-white">
        <p className="text-xl font-bold mb-2">Jigsaw Puzzle Game</p>
        <p>Drag and drop pieces to complete the puzzle.</p>
      </div>
    ),
    description: 'Assemble various images by dragging and dropping puzzle pieces.',
  },
  {
    name: 'paint',
    type: 'activities',
    label: 'Digital Canvas',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3c-4.97 0-9 4.03-9 9 0 4.17 2.84 7.67 6.69 8.69L12 22l2.31-1.31C18.16 19.67 21 16.17 21 12c0-4.97-4.03-9-9-9zm0 2c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"/>
      </svg>
    ),
    main: (
      <div className="text-center p-6 bg-gray-600 rounded-lg text-white">
        <p className="text-xl font-bold mb-2">Digital Canvas App</p>
        <p>Unleash your creativity with this simple drawing tool.</p>
      </div>
    ),
    description: 'A simple drawing application to unleash your creativity.',
  },
];

export const AppsContext = createContext<AppInterface[] | undefined>(undefined);
export const AppsProvider = AppsContext.Provider;
export const AppsConsumer = AppsContext.Consumer;
