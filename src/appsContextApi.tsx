import { createContext, type ReactElement } from 'react';
import { InnerApps } from './appsData';
import BreathingExercise from './activities/breathing_module/BreathingExercise';
import MatchingGame from './activities/MatchingGame';

// Define the App interface as provided by the user
// Using a union type for 'name' for strict type checking
export interface AppInterface {
  name: 'breathing' | 'stretching' | 'matching-cards' | 'sudoku' | 'puzzle' | 'paint';
  type: 'activities' | 'games';
  label: string;
  // icon is a ReactElement that renders an SVG, e.g., <svg>...</svg>
  icon?: ReactElement | undefined;
  main: any; // The main component/element to render for this app
  description?: string | undefined;
}

// Define the type for the context value
// interface AppsContextType {
//   apps: App[];
// }


// Create the context with a default undefined value.
export const AppsContext = createContext<AppInterface[] | undefined>(undefined);
export const AppsProvider  = AppsContext.Provider
export const AppsConsumer = AppsContext.Consumer;

/**
 * useApps Hook
 * A custom hook to consume the AppsContext.
 * Throws an error if used outside of an AppsProvider, ensuring proper usage.
 * returns {AppsContextType} The context value containing the array of apps.
 */
// export const useApps = (): AppsContextType => {
//   const context = useContext(AppsContext);
//   if (context === undefined) {
//     throw new Error('useApps must be used within an AppsProvider');
//   }
//   return context;
// };
