import { useState, useEffect, useCallback } from "react";

type CellValue = number | null;
type Grid = CellValue[][];
type Difficulty = "easy" | "medium" | "hard";

// Multiple solution templates for variety
const solutionTemplates: Grid[] = [
  [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ],
  [
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [4, 5, 6, 7, 8, 9, 1, 2, 3],
    [7, 8, 9, 1, 2, 3, 4, 5, 6],
    [2, 1, 4, 3, 6, 5, 8, 9, 7],
    [3, 6, 5, 8, 9, 7, 2, 1, 4],
    [8, 9, 7, 2, 1, 4, 3, 6, 5],
    [5, 3, 1, 6, 4, 2, 9, 7, 8],
    [6, 4, 2, 9, 7, 8, 5, 3, 1],
    [9, 7, 8, 5, 3, 1, 6, 4, 2],
  ],
  [
    [8, 2, 7, 1, 5, 4, 3, 9, 6],
    [9, 6, 5, 3, 2, 7, 1, 4, 8],
    [3, 4, 1, 6, 8, 9, 7, 5, 2],
    [5, 9, 3, 4, 6, 8, 2, 7, 1],
    [4, 7, 2, 5, 1, 3, 6, 8, 9],
    [6, 1, 8, 9, 7, 2, 4, 3, 5],
    [7, 8, 6, 2, 3, 5, 9, 1, 4],
    [1, 5, 4, 7, 9, 6, 8, 2, 3],
    [2, 3, 9, 8, 4, 1, 5, 6, 7],
  ],
];

const generatePuzzle = (
  difficulty: Difficulty,
): { puzzle: Grid; solution: Grid } => {
  // Pick a random solution template
  const solution = solutionTemplates[
    Math.floor(Math.random() * solutionTemplates.length)
  ].map((row) => [...row]);

  // Create puzzle by removing cells based on difficulty
  const puzzle: Grid = solution.map((row) => [...row]);

  const cellsToRemove = {
    easy: 35, // 35 removed = 46 given
    medium: 45, // 45 removed = 36 given
    hard: 55, // 55 removed = 26 given
  }[difficulty];

  const removed = new Set<string>();

  while (removed.size < cellsToRemove) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    const key = `${row},${col}`;

    if (!removed.has(key)) {
      puzzle[row][col] = null;
      removed.add(key);
    }
  }

  return { puzzle, solution };
};

interface SudokuGameProps {
  onGameEnd?: () => void;
}

export default function SudokuGame({ onGameEnd }: SudokuGameProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [{ puzzle, solution }, setPuzzleData] = useState(() =>
    generatePuzzle("easy"),
  );
  const [grid, setGrid] = useState<Grid>(puzzle.map((row) => [...row]));
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(
    null,
  );
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);

  const checkCompletion = useCallback(() => {
    const isFilled = grid.every((row) => row.every((cell) => cell !== null));
    if (!isFilled) return;

    const isCorrect = grid.every((row, i) =>
      row.every((cell, j) => cell === solution[i][j]),
    );

    if (isCorrect) {
      setIsComplete(true);
    }
  }, [grid, solution]);

  useEffect(() => {
    checkCompletion();
  }, [grid, checkCompletion]);

  const handleCellClick = (row: number, col: number) => {
    if (puzzle[row][col] !== null) return; // Can't edit original numbers
    setSelectedCell([row, col]);
  };

  const handleNumberInput = (num: number | null) => {
    if (!selectedCell) return;

    const [row, col] = selectedCell;
    if (puzzle[row][col] !== null) return;

    const newGrid = grid.map((r) => [...r]);
    newGrid[row][col] = num;
    setGrid(newGrid);

    // Check for errors
    if (num !== null && num !== solution[row][col]) {
      setErrors((prev) => new Set(prev).add(`${row},${col}`));
    } else {
      setErrors((prev) => {
        const newErrors = new Set(prev);
        newErrors.delete(`${row},${col}`);
        return newErrors;
      });
    }
  };

  const startNewGame = (newDifficulty?: Difficulty) => {
    const diff = newDifficulty || difficulty;
    const newPuzzleData = generatePuzzle(diff);
    setPuzzleData(newPuzzleData);
    setGrid(newPuzzleData.puzzle.map((row) => [...row]));
    setSelectedCell(null);
    setErrors(new Set());
    setIsComplete(false);
    if (newDifficulty) setDifficulty(newDifficulty);
  };

  const getCellClass = (row: number, col: number) => {
    const isOriginal = puzzle[row][col] !== null;
    const isSelected = selectedCell?.[0] === row && selectedCell?.[1] === col;
    const hasError = errors.has(`${row},${col}`);

    let className =
      "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center text-sm sm:text-base md:text-lg font-semibold cursor-pointer transition-colors ";

    if (isOriginal) {
      className += "bg-secondary text-primary font-bold cursor-not-allowed ";
    } else if (isSelected) {
      className +=
        "bg-primary text-primary-foreground ring-1 sm:ring-2 ring-primary ";
    } else if (hasError) {
      className += "bg-destructive/40 text-destructive-foreground ";
    } else {
      className += "bg-card text-accent-foreground hover:bg-accent ";
    }

    // Thicker borders for 3x3 boxes with better visibility
    if (col % 3 === 0)
      className += "border-l-2 sm:border-l-3 md:border-l-4 border-border ";
    else className += "border-l border-border ";

    if (row % 3 === 0)
      className += "border-t-2 sm:border-t-3 md:border-t-4 border-border ";
    else className += "border-t border-border ";

    if (col === 8)
      className += "border-r-2 sm:border-r-3 md:border-r-4 border-border ";
    if (row === 8)
      className += "border-b-2 sm:border-b-3 md:border-b-4 border-border ";

    return className;
  };

  return (
    <div className="flex flex-col items-center p-2 md:p-4 bg-background text-foreground w-full max-w-2xl mx-auto h-full max-h-screen overflow-y-auto">
      <h2 className="text-xl md:text-2xl font-bold text-primary mb-2">
        Sudoku
      </h2>

      {/* Difficulty Selector */}
      <div className="mb-2 flex gap-1.5 md:gap-2">
        <button
          onClick={() => {
            startNewGame("easy");
          }}
          className={`min-h-[44px] px-3 py-2 text-xs md:text-sm rounded font-semibold transition-colors ${difficulty === "easy" ? "bg-green-500 text-white" : "bg-secondary text-secondary-foreground hover:bg-accent"}`}
        >
          Easy
        </button>
        <button
          onClick={() => {
            startNewGame("medium");
          }}
          className={`min-h-[44px] px-3 py-2 text-xs md:text-sm rounded font-semibold transition-colors ${difficulty === "medium" ? "bg-yellow-500 text-white" : "bg-secondary text-secondary-foreground hover:bg-accent"}`}
        >
          Medium
        </button>
        <button
          onClick={() => {
            startNewGame("hard");
          }}
          className={`min-h-[44px] px-3 py-2 text-xs md:text-sm rounded font-semibold transition-colors ${difficulty === "hard" ? "bg-red-500 text-white" : "bg-secondary text-secondary-foreground hover:bg-accent"}`}
        >
          Hard
        </button>
      </div>

      {isComplete && (
        <div className="mb-2 px-3 py-1.5 bg-green-500 text-white rounded text-xs md:text-base font-semibold animate-pulse">
          🎉 Congratulations! You solved it!
        </div>
      )}

      {/* Sudoku Grid */}
      <div className="mb-3 inline-block border-2 md:border-4 border-border rounded-sm shadow-xl">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                type="button"
                className={getCellClass(rowIndex, colIndex)}
                onClick={() => {
                  handleCellClick(rowIndex, colIndex);
                }}
                disabled={puzzle[rowIndex][colIndex] !== null}
                aria-label={
                  puzzle[rowIndex][colIndex] !== null
                    ? `Cell ${rowIndex + 1}, ${colIndex + 1}: fixed value ${cell}`
                    : (cell != null)
                      ? `Cell ${rowIndex + 1}, ${colIndex + 1}: ${cell}${errors.has(`${rowIndex},${colIndex}`) ? " (error)" : ""}`
                      : `Cell ${rowIndex + 1}, ${colIndex + 1}: empty`
                }
              >
                {cell ?? ""}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Number Pad */}
      <div className="grid grid-cols-5 gap-1 sm:gap-1.5 md:gap-2 mb-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => {
              handleNumberInput(num);
            }}
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-primary text-primary-foreground hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed rounded text-base sm:text-lg md:text-xl font-bold transition-colors shadow-sm hover:shadow-md"
            disabled={!selectedCell}
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => {
            handleNumberInput(null);
          }}
          className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-destructive text-destructive-foreground hover:bg-destructive/80 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs sm:text-sm font-semibold transition-colors shadow-sm hover:shadow-md"
          disabled={!selectedCell}
        >
          Clear
        </button>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => {
            startNewGame();
          }}
          className="min-h-[44px] px-3 py-2 text-xs sm:text-sm md:text-base bg-primary text-primary-foreground hover:bg-primary/80 rounded font-semibold transition-colors shadow-sm"
        >
          New Game
        </button>
        {onGameEnd && (
          <button
            onClick={onGameEnd}
            className="min-h-[44px] px-3 py-2 text-xs sm:text-sm md:text-base bg-secondary text-secondary-foreground hover:bg-accent rounded font-semibold transition-colors shadow-sm"
          >
            Exit
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="text-xs md:text-sm text-muted-foreground space-y-0.5 text-center px-2 max-w-md">
        <p>
          <span className="text-primary font-bold">Blue:</span> Original
        </p>
        <p>
          <span className="text-accent-foreground">Green:</span> Your inputs
        </p>
        <p>
          <span className="text-destructive-foreground">Red:</span> Errors
        </p>
      </div>
    </div>
  );
}
