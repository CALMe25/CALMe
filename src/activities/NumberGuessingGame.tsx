import React, { useState, useEffect } from "react";

interface NumberGuessingGameProps {
  onGameEnd?: () => void;
}

const NumberGuessingGame: React.FC<NumberGuessingGameProps> = ({
  onGameEnd,
}) => {
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [guess, setGuess] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [attempts, setAttempts] = useState<number>(0);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [guessHistory, setGuessHistory] = useState<
    Array<{ guess: number; hint: string }>
  >([]);

  // Initialize game
  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const randomNum = Math.floor(Math.random() * 10) + 1;
    setTargetNumber(randomNum);
    setGuess("");
    setMessage("I'm thinking of a number between 1 and 10. Can you guess it?");
    setAttempts(0);
    setGameWon(false);
    setGuessHistory([]);
  };

  const handleGuess = () => {
    const guessNum = Number.parseInt(guess, 10);

    if (Number.isNaN(guessNum) || guessNum < 1 || guessNum > 10) {
      setMessage("Please enter a valid number between 1 and 10!");
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (guessNum === targetNumber) {
      setGameWon(true);
      setMessage(
        `🎉 Congratulations! You guessed it in ${newAttempts} ${newAttempts === 1 ? "attempt" : "attempts"}!`,
      );
      setGuessHistory([
        ...guessHistory,
        { guess: guessNum, hint: "✓ Correct!" },
      ]);
    } else {
      const hint = guessNum < targetNumber ? "📈 Too low!" : "📉 Too high!";
      setMessage(hint);
      setGuessHistory([...guessHistory, { guess: guessNum, hint }]);
      setGuess("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !gameWon) {
      handleGuess();
    }
  };

  return (
    <div className="flex flex-col items-center justify-start h-full w-full p-4 bg-background text-foreground overflow-y-auto">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary">
            Number Guessing Game
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Guess the number between 1 and 10
          </p>
        </div>

        {/* Game Stats */}
        <div className="flex justify-around items-center bg-card p-4 rounded-lg shadow-md">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{attempts}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Attempts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">1-10</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Range</p>
          </div>
        </div>

        {/* Message Display */}
        <div
          className={`text-center p-4 rounded-lg ${
            gameWon
              ? "bg-green-500/20 border-2 border-green-500"
              : "bg-card border-2 border-muted"
          }`}
        >
          <p
            className={`text-base sm:text-lg font-semibold ${
              gameWon ? "text-green-400" : "text-foreground"
            }`}
          >
            {message}
          </p>
        </div>

        {/* Input Section */}
        {!gameWon && (
          <div className="space-y-3">
            <input
              type="number"
              min="1"
              max="10"
              value={guess}
              onChange={(e) => {
                setGuess(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Enter your guess"
              className="w-full px-4 py-3 text-lg text-center bg-card border-2 border-muted rounded-lg focus:outline-none focus:border-primary transition-colors"
              disabled={gameWon}
              aria-label="Number guess input"
            />
            <button
              type="button"
              onClick={handleGuess}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              disabled={gameWon || !guess}
              aria-label="Submit guess"
            >
              Guess
            </button>
          </div>
        )}

        {/* Guess History */}
        {guessHistory.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground text-center">
              Previous Guesses
            </h3>
            <div className="bg-card rounded-lg p-3 max-h-48 overflow-y-auto">
              <div className="space-y-2">
                {guessHistory.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center px-3 py-2 bg-background rounded-md"
                  >
                    <span className="font-semibold">#{index + 1}</span>
                    <span className="text-lg">{item.guess}</span>
                    <span className="text-sm">{item.hint}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={startNewGame}
            className="flex-1 px-6 py-3 bg-card border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
            aria-label="Start new game"
          >
            {gameWon ? "Play Again" : "Reset"}
          </button>
          {gameWon && onGameEnd && (
            <button
              type="button"
              onClick={onGameEnd}
              className="flex-1 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
              aria-label="Exit game"
            >
              Exit Game
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NumberGuessingGame;
