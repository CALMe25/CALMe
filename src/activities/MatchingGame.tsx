import React, { useState, useEffect, useRef } from 'react';
import calmeLogo from '../assets/calme-logo.svg';

// Define the type for a single card
interface Card {
  id: number; // Unique ID for React keys
  value: string; // The symbol/emoji on the card (e.g., '🍎', '🍎', '🍌', '🍌')
  isFlipped: boolean;
  isMatched: boolean;
}

// Props for the MatchingGame component
interface MatchingGameProps {
  onGameEnd: () => void; // Callback to notify App.tsx when the game is over
}

const MatchingGame: React.FC<MatchingGameProps> = ({ onGameEnd }) => {
  // Emojis for the cards (6 pairs for a 3x4 grid = 12 cards)
  const cardEmojis = ['🍎', '🍌', '🍇', '🍋', '🍊', '🍓']; // Now 6 unique emojis
  const totalMatches = cardEmojis.length;

  // Function to initialize and shuffle the cards for a 3x4 grid
  const initializeCards = (): Card[] => {
    let idCounter = 0;
    const initialCards: Card[] = [];

    // Add 6 pairs (total 12 cards)
    for (let i = 0; i < cardEmojis.length; i++) { // Loop through all 6 emojis
      initialCards.push({ id: idCounter++, value: cardEmojis[i], isFlipped: false, isMatched: false });
      initialCards.push({ id: idCounter++, value: cardEmojis[i], isFlipped: false, isMatched: false });
    }

    // Shuffle the cards
    return initialCards.sort(() => Math.random() - 0.5);
  };

  const [cards, setCards] = useState<Card[]>(initializeCards());
  const [flippedCards, setFlippedCards] = useState<number[]>([]); // Stores IDs of currently flipped cards
  const [matchesFound, setMatchesFound] = useState(0);
  const [isChecking, setIsChecking] = useState(false); // To prevent flipping more than 2 cards at once
  const [showCelebration, setShowCelebration] = useState(false);
  const celebrationTimeout = useRef<number | null>(null);

  // Effect to check for matches when two cards are flipped
  useEffect(() => {
  if (flippedCards.length === 2) {
    setIsChecking(true);
    const [id1, id2] = flippedCards;
    const card1 = cards.find(card => card.id === id1);
    const card2 = cards.find(card => card.id === id2);

    if (card1 && card2 && card1.value === card2.value) {
      setCards(prevCards =>
        prevCards.map(card =>
          card.id === id1 || card.id === id2 ? { ...card, isMatched: true } : card
        )
      );
      setMatchesFound(prev => prev + 1);
      setFlippedCards([]);
      setIsChecking(false);
    } else {
      setTimeout(() => {
          setCards(prevCards =>
            // Wait for the flip animation to finish before hiding the emoji
            prevCards.map(card =>
              card.id === id1 || card.id === id2 ? { ...card, isFlipped: false } : card
            )
          );
          setFlippedCards([]);
          setIsChecking(false);
        }, 1500); // 1.5 s for flip animation
      }
    }
  }, [flippedCards, cards]);

  // Effect to surface a celebration banner when the board is cleared
  useEffect(() => {
    if (matchesFound === totalMatches) {
      if (celebrationTimeout.current) {
        window.clearTimeout(celebrationTimeout.current);
      }
      setShowCelebration(true);
      celebrationTimeout.current = window.setTimeout(() => {
        setShowCelebration(false);
        celebrationTimeout.current = null;
      }, 4000);
    }

    return () => {
      if (celebrationTimeout.current) {
        window.clearTimeout(celebrationTimeout.current);
        celebrationTimeout.current = null;
      }
    };
  }, [matchesFound, totalMatches]);

  // Handle card click
  const handleCardClick = (clickedCard: Card) => {
    if (isChecking || clickedCard.isFlipped || clickedCard.isMatched) {
      return; // Do nothing if checking, already flipped, or already matched
    }

    // Flip the clicked card
    setCards(prevCards =>
      prevCards.map(card =>
        card.id === clickedCard.id ? { ...card, isFlipped: true } : card
      )
    );

    // Add to flipped cards list
    setFlippedCards(prevFlipped => [...prevFlipped, clickedCard.id]);
  };

  // Reset game function
  const resetGame = () => {
    if (celebrationTimeout.current) {
      window.clearTimeout(celebrationTimeout.current);
      celebrationTimeout.current = null;
    }
    setCards(initializeCards());
    setFlippedCards([]);
    setMatchesFound(0);
    setIsChecking(false);
    setShowCelebration(false);
  };

  return (
    <div className="flex h-full flex-col items-center overflow-y-auto bg-background p-3 font-inter text-foreground sm:p-4">
      <div className="w-full max-w-5xl space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/80 p-4 shadow-md sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Calm focus</p>
            <h2 className="text-2xl font-bold text-primary sm:text-3xl">Matching Game</h2>
            <p className="text-sm text-muted-foreground">{matchesFound} / {totalMatches} matches complete</p>
          </div>
          {showCelebration && (
            <div className="rounded-2xl bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-600 dark:text-emerald-300">
              🎉 Great job! You cleared the board.
            </div>
          )}
        </div>

        <div className="grid gap-3 rounded-2xl border border-border bg-card/70 p-3 shadow-lg sm:gap-4 sm:p-4 md:p-6 [grid-template-columns:repeat(auto-fit,minmax(120px,1fr))]">
          {cards.map(card => (
            <div
              key={card.id}
              className={`
                relative flex aspect-square w-full min-h-[110px] items-center justify-center
                rounded-2xl shadow-md cursor-pointer text-4xl sm:text-5xl md:text-6xl font-bold
                transition-all duration-300 ease-in-out
                ${card.isMatched ? 'bg-green-300 dark:bg-green-700 opacity-70 cursor-not-allowed' : 'bg-blue-500 dark:bg-blue-800 hover:bg-blue-600 dark:hover:bg-blue-700'}
                ${isChecking && !card.isFlipped && !card.isMatched ? 'cursor-not-allowed' : ''}
              `}
              onClick={() => handleCardClick(card)}
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px'
              }}
            >
              <div
                className={`
                  absolute inset-0 flex items-center justify-center rounded-2xl
                  transition-transform duration-300 ease-in-out
                  ${card.isFlipped || card.isMatched ? 'transform rotate-y-0 bg-card text-foreground' : 'transform rotate-y-180 bg-card'}
                `}
                style={{
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden'
                }}
              >
                {card.isFlipped || card.isMatched ? card.value : ''}
              </div>
              <div
                className={`
                  absolute inset-0 flex items-center justify-center rounded-2xl
                  ${card.isFlipped || card.isMatched ? 'transform rotate-y-180 bg-card' : 'transform rotate-y-0 bg-card'}
                `}
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden'
                }}
              >
                {!card.isFlipped && !card.isMatched && !flippedCards.includes(card.id) && (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <img src={calmeLogo} alt="CALMe Logo" className="mx-auto mb-2 w-14 sm:w-16" />
                    <span className="text-base font-bold uppercase tracking-[0.4em] text-primary sm:text-lg">CALMe</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={resetGame}
            className="min-h-[48px] rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Reset Game
          </button>
          <button
            onClick={onGameEnd}
            className="min-h-[48px] rounded-lg bg-red-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-600"
          >
            Exit Game
          </button>
        </div>
      </div>
    </div>
  );
}
export default MatchingGame;
