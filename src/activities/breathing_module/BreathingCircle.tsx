import { useState, useEffect } from "react";

// Define the types for the component's props
interface BreathingCircleProps {
  timings: number[];
  repeat: number;
  color?: string; // The '?' makes this prop optional
  scaleTo?: number; // This one is optional too
}

export default function BreathingCircle({
  timings,
  repeat,
  color = "bg-sky-500",
  scaleTo = 1.5,
}: BreathingCircleProps) {
  const [scale, setScale] = useState(1);
  const [stage, setStage] = useState("...");
  const [transitionDuration, setTransitionDuration] = useState("0ms");
  // State to track the current animation cycle
  const [cycle, setCycle] = useState(0);
  const sideSize: number = 8;

  useEffect(() => {
    // --- Validation and Loop Control ---
    // Stop the effect if we have completed the desired number of repetitions.
    // The check is cycle >= repeat because cycles are 0-indexed.
    if (repeat !== Infinity && cycle >= repeat) {
      return;
    }

    // Ensure timings are valid
    if (!timings || timings.length < 3) {
      console.error(
        "Invalid timings prop. It must be an array of at least 3 numbers.",
      );
      return;
    }

    const [enlargeTime, pauseTime, shrinkTime] = timings;
    const totalCycleTime = enlargeTime + pauseTime + shrinkTime;

    // --- Animation Sequence for one cycle ---

    // 1. Enlarge
    // Set transition duration and then trigger the scale change in the next tick.
    setTransitionDuration(`${enlargeTime}ms`);
    const enlargeTimer = setTimeout(() => {
      setScale(scaleTo);
      setStage("Inhale");
    }, 20); // Small delay to ensure CSS transition is applied

    // 2. Hold
    // After enlarge duration, initiate the shrink phase.
    const holdTimer = setTimeout(() => {
      if (pauseTime < 2000) return;
      setTransitionDuration(`${pauseTime}ms`);
      setStage("Hold Breath");
    }, enlargeTime);

    // 3. Shrink
    // After enlarge + pause duration, initiate the shrink phase.
    const shrinkTimer = setTimeout(() => {
      setTransitionDuration(`${shrinkTime}ms`);
      setScale(1);
      setStage("Exhale");
    }, enlargeTime + pauseTime);

    // 4. Trigger Next Cycle
    // After the full cycle is complete, we increment the cycle counter.
    // This will cause the component to re-render and the useEffect to run again for the next loop.
    const nextCycleTimer = setTimeout(() => {
      setCycle((currentCycle) => currentCycle + 1);
    }, totalCycleTime);

    // --- Cleanup ---
    // This function is crucial to clear timeouts when the component unmounts
    // or when props change, preventing memory leaks and unexpected behavior.
    return () => {
      // setCycle(0);
      clearTimeout(enlargeTimer);
      clearTimeout(shrinkTimer);
      clearTimeout(holdTimer);
      clearTimeout(nextCycleTimer);
    };
  }, [timings, scaleTo, repeat, cycle]); // Rerun effect if these dependencies change

  const circleStyle = {
    width: "4rem",
    height: "4rem",
    backgroundColor: "skyblue",
    borderRadius: "50%",
    border: "5px solid teal",
    transform: `scale(${scale})`,
    transition: `transform ${transitionDuration} ease-in-out`,
  };

  return (
    <div
      className={`flex items-center justify-center w-${sideSize}rem h-${sideSize}rem`}
      style={{
        // width: '8rem',
        // height: '8rem',
        alignSelf: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-around",
      }}
    >
      <div>{stage}</div>
      <br></br>
      <div
        style={circleStyle}
        className={`w-${sideSize / 2}rem h-${sideSize / 2}rem rounded-full shadow-lg ${color}`}
      ></div>
    </div>
  );
}
