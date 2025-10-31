import { useState } from 'react';
import BreathingCircle from './BreathingCircle'

// Default timings for the animation phases (in milliseconds)
const DEFAULT_TIMINGS = [7000, 4000, 8000]; // Enlarge for 7s, pause for 4s, shrink for 8s
const DEFAULT_REPEAT = 4; // Default number of repetitions


// // Define the types for the component's props
// interface BreathingAppProps {
//   timings: number[];
//   color?: string; // The '?' makes this prop optional
//   scaleTo?: number; // This one is optional too
// }

// Main App component to demonstrate and control the BreathingCircle
// export default function BreathingApp() {
//   const [timings, setTimings] = useState(DEFAULT_TIMINGS);
//   const [key, setKey] = useState(Date.now()); // Key to force re-render of the circle

//   const handleTimingChange = (index: number, value: string) => {
//     const newTimings = [...timings];
//     // Use 0 if input is empty or not a number
//     newTimings[index] = value ? parseInt(value, 10) : 0;
//     setTimings(newTimings);
//   };
  
//   const restartAnimation = () => {
//     // Changing the key of the BreathingCircle component will unmount the old one
//     // and mount a new one, which restarts the animation effect.
//     setKey(Date.now());
//   }

//   return (
//     <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4 font-sans">
//       <div className="w-full max-w-md text-center">
//         <h1 className="text-4xl font-bold text-sky-400 mb-2">Breathing Circle</h1>
//         <p className="text-gray-400 mb-8">A React component for timed animations.</p>
//       </div>

//       {/* The key prop is essential here to restart the animation on demand */}
//       <BreathingCircle key={key} timings={timings} />

//         {/*Manually change EPS timings  */}
//       <div className="mt-8 p-6 bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
//         <h2 className="text-xl font-semibold mb-4 text-center">Animation Controls (ms)</h2>
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//           {['Enlarge', 'Pause', 'Shrink'].map((timelabel: string, index:number) => (
//              <div key={timelabel}>
//               <label htmlFor={`timing-${timelabel}`} className="block text-sm font-medium text-gray-300 mb-1">{timelabel} Time</label>
//               <input
//                 type="number"
//                 id={`timing-${timelabel}`}
//                 value={timings[index]}
//                 onChange={(e) => handleTimingChange(index, e.target.value)}
//                 className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
//                 placeholder="e.g., 2000"
//             />
//             </div>
//           ))}
//         </div>
//         <div className="mt-6 flex justify-center">
//             <button 
//                 onClick={restartAnimation}
//                 className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
//             >
//                 Restart Animation
//             </button>
//         </div>
//     </div>
//        <div className="mt-8 text-center text-gray-500 text-sm">
//         <p>Modify the timings and click "Restart Animation" to see your changes.</p>
//       </div>
//     </div>
//   );
// }

// Main App component to demonstrate and control the BreathingCircle
export default function App() {
  const [timings, setTimings] = useState(DEFAULT_TIMINGS);
  const [repeatCount, setRepeatCount] = useState(DEFAULT_REPEAT);
  const [key, setKey] = useState(Date.now()); // Key to force re-render of the circle

    const handleTimingChange = (index: number, value: string)  => {
    const newTimings = [...timings];
    newTimings[index] = value ? parseInt(value, 10) : 0;
    setTimings(newTimings);
  };


  const handleRepeatChange = (value: any) => {
      if (value === 'Infinity') {
          setRepeatCount(Infinity);
      } else {
          setRepeatCount(value ? parseInt(value, 10) : 0);
      }
  }
  
  const restartAnimation = () => {
    // Changing the key of the BreathingCircle component will unmount the old one
    // and mount a new one, which restarts its internal state (like the cycle count).
    setKey(Date.now());
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4 font-sans"
        style={{
            backgroundColor: '#111827',
            color: 'white',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            padding: '1rem',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif'
        }}
    >
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-sky-400 mb-2">Breathing Circle</h1>
        <p className="text-gray-400 mb-8">as the circle grows inhale</p>
      </div>

      {/* The key prop is essential here to restart the animation on demand */}
      <BreathingCircle key={key} timings={timings} repeat={repeatCount} />

        {/*The Controllers will be removed in the future  */}
      <div className="mt-8 p-6 bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4 text-center">Animation Controls</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {['Enlarge', 'Pause', 'Shrink'].map((label, index) => (
            <div key={label}>
              <label htmlFor={`timing-${label}`} className="block text-sm font-medium text-gray-300 mb-1">{label} (ms)</label>
              <input
                type="number"
                id={`timing-${label}`}
                value={timings[index]}
                onChange={(e) => handleTimingChange(index, e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="e.g., 2000"
              />
            </div>
          ))}
           <div>
              <label htmlFor="repeat-count" className="block text-sm font-medium text-gray-300 mb-1">Repeat</label>
              <input
                type="text" // Use text to allow for "Infinity"
                id="repeat-count"
                value={repeatCount}
                onChange={(e) => handleRepeatChange(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="e.g., 3 or Infinity"
              />
            </div>
        </div>
         <br></br>
      </div>
      <div className="mt-6 flex justify-center">
            <button 
                onClick={restartAnimation}
                className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-black font-bold rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
            >
                Repeat Breathing Excersize
            </button>
        </div>
       <div className="mt-8 text-center text-gray-500 text-sm max-w-lg">
        <p>Modify the timings or repeat count and click "Restart Animation". Try entering Infinity in the repeat field for a non-stop loop.</p>
      </div>
    </div>
  );
}