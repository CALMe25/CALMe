import { useState, useEffect } from 'react';

type CellValue = number | null;
type Grid = CellValue[][];

// Simple Sudoku puzzle generator (easy difficulty)
const generatePuzzle = (): { puzzle: Grid; solution: Grid } => {
  // Pre-made easy puzzle for demo
  const solution: Grid = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ];

  // Create puzzle by removing some numbers
  const puzzle: Grid = solution.map(row => [...row]);
  const cellsToRemove = 40; // Remove 40 cells for easy difficulty

  for (let i = 0; i < cellsToRemove; i++) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    puzzle[row][col] = null;
  }

  return { puzzle, solution };
};

interface SudokuGameProps {
  onGameEnd?: () => void;
}

export default function SudokuGame({ onGameEnd }: SudokuGameProps) {
  const [{ puzzle, solution }] = useState(() => generatePuzzle());
  const [grid, setGrid] = useState<Grid>(puzzle.map(row => [...row]));
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    checkCompletion();
  }, [grid]);

  const checkCompletion = () => {
    const isFilled = grid.every(row => row.every(cell => cell !== null));
    if (!isFilled) return;

    const isCorrect = grid.every((row, i) =>
      row.every((cell, j) => cell === solution[i][j])
    );

    if (isCorrect) {
      setIsComplete(true);
    }
  };

  const handleCellClick = (row: number, col: number) => {
    if (puzzle[row][col] !== null) return; // Can't edit original numbers
    setSelectedCell([row, col]);
  };

  const handleNumberInput = (num: number | null) => {
    if (!selectedCell) return;

    const [row, col] = selectedCell;
    if (puzzle[row][col] !== null) return;

    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = num;
    setGrid(newGrid);

    // Check for errors
    if (num !== null && num !== solution[row][col]) {
      setErrors(prev => new Set(prev).add(`${row},${col}`));
    } else {
      setErrors(prev => {
        const newErrors = new Set(prev);
        newErrors.delete(`${row},${col}`);
        return newErrors;
      });
    }
  };

  const resetGame = () => {
    const { puzzle: newPuzzle, solution: newSolution } = generatePuzzle();
    setGrid(newPuzzle.map(row => [...row]));
    setSelectedCell(null);
    setErrors(new Set());
    setIsComplete(false);
  };

  const getCellClass = (row: number, col: number) => {
    const isOriginal = puzzle[row][col] !== null;
    const isSelected = selectedCell?.[0] === row && selectedCell?.[1] === col;
    const hasError = errors.has(`${row},${col}`);

    let className = 'w-12 h-12 flex items-center justify-center border text-lg font-semibold cursor-pointer transition-colors ';

    if (isOriginal) {
      className += 'bg-gray-700 text-white font-bold cursor-not-allowed ';
    } else if (isSelected) {
      className += 'bg-sky-500 text-white ';
    } else if (hasError) {
      className += 'bg-red-500/30 text-red-300 ';
    } else {
      className += 'bg-gray-800 text-sky-300 hover:bg-gray-700 ';
    }

    // Thicker borders for 3x3 boxes
    if (col % 3 === 0) className += 'border-l-2 ';
    if (row % 3 === 0) className += 'border-t-2 ';
    if (col === 8) className += 'border-r-2 ';
    if (row === 8) className += 'border-b-2 ';

    return className;
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 text-white h-full">
      <h2 className="text-3xl font-bold text-sky-400 mb-6">Sudoku</h2>

      {isComplete && (
        <div className="mb-4 px-6 py-3 bg-green-500 text-white rounded-lg text-lg font-semibold">
          🎉 Congratulations! You solved it!
        </div>
      )}

      {/* Sudoku Grid */}
      <div className="mb-6 inline-block border-2 border-gray-600">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={getCellClass(rowIndex, colIndex)}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {cell || ''}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Number Pad */}
      <div className="grid grid-cols-5 gap-2 mb-6 max-w-md">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            onClick={() => handleNumberInput(num)}
            className="w-12 h-12 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-xl font-bold transition-colors"
            disabled={!selectedCell}
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleNumberInput(null)}
          className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-semibold transition-colors"
          disabled={!selectedCell}
        >
          Clear
        </button>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4">
        <button
          onClick={resetGame}
          className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-semibold transition-colors"
        >
          New Game
        </button>
        {onGameEnd && (
          <button
            onClick={onGameEnd}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
          >
            Exit
          </button>
        )}
      </div>

      <p className="mt-6 text-gray-400 text-sm text-center max-w-md">
        Click a cell and use the number pad to fill it in. Original numbers cannot be changed.
      </p>
    </div>
  );
}
