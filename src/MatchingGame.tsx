// src/games/MatchingGame.tsx

import React, { useState, useEffect } from 'react';
import calmeLogo from './assets/calme-logo.svg';

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

  // Effect to check if the game is won
  useEffect(() => {
    // There are 6 pairs for a 3x4 grid, so 6 matches to win
    if (matchesFound === 6) {
      // NOTE: Using alert() is generally discouraged in React apps for better UX.
      // Consider replacing this with a custom modal component or a simple message display.
      alert('Congratulations! You matched all pairs!');
      onGameEnd(); // Notify parent component (App.tsx)
    }
  }, [matchesFound, onGameEnd]);

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
    setCards(initializeCards());
    setFlippedCards([]);
    setMatchesFound(0);
    setIsChecking(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 font-inter">
      <h2 className="text-4xl font-bold text-blue-700 mb-8 rounded-lg p-3 shadow-md bg-white">
        Matching Game
      </h2>

      {/* Changed grid-cols-3 to grid-cols-4 for a 3x4 layout */}
      <div className="grid grid-cols-4 p-4 bg-white rounded-xl shadow-lg border border-blue-200 max-w-full" style={{columnGap: '40px', rowGap: '10px', width: 'max-content', maxWidth: '100%'}}>
        {cards.map(card => (
          <div
            key={card.id}
            className={`
              w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36
              flex items-center justify-center
              rounded-xl shadow-md cursor-pointer
              text-5xl sm:text-6xl md:text-7xl font-bold
              transition-all duration-300 ease-in-out
              ${card.isMatched ? 'bg-green-300 opacity-70 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}

              ${isChecking && !card.isFlipped && !card.isMatched ? 'cursor-not-allowed' : '' + " relative"}
            `}
            onClick={() => handleCardClick(card)}
            style={{
              // This transforms the inner content to appear correctly when the card is flipped
              transformStyle: 'preserve-3d',
              perspective: '1000px'
            }}
          >
            {/* Front of the card (hidden when flipped) */}
            <div
              className={`
                absolute w-full h-full rounded-xl flex items-center justify-center
                transition-transform duration-300 ease-in-out
                ${card.isFlipped || card.isMatched ? 'transform rotate-y-0 bg-white text-gray-800' : 'transform rotate-y-180 bg-white'}
              `}
              style={{
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden' // For Safari
              }}
            >
              {card.isFlipped || card.isMatched ? card.value : ''}
            </div>
            {/* Back of the card (shows logo when not flipped) */}
            <div
              className={`
                absolute w-full h-full rounded-xl flex items-center justify-center
                backface-hidden
                ${card.isFlipped || card.isMatched ? 'transform rotate-y-180 bg-white' : 'transform rotate-y-0 bg-white'}
              `}
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden' // For Safari
              }}
            >
              {!card.isFlipped && !card.isMatched && !flippedCards.includes(card.id) && (
                <div className="flex flex-col items-center justify-center w-full h-full">
                  <img src={calmeLogo} alt="CALMe Logo" className="w-20 h-20 mx-auto mb-2" />
                  <span className="text-xl font-bold text-blue-700" style={{letterSpacing: '2px'}}>CALMe</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex space-x-4">
        <button
          onClick={resetGame}
          className="px-6 py-3 bg-indigo-600 text-black font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-300"
        >
          Reset Game
        </button>
        <button
          onClick={onGameEnd}
          className="px-6 py-3 bg-red-500 text-black font-semibold rounded-lg shadow-md hover:bg-red-600 transition-colors duration-300"
        >
          Exit Game
        </button>
      </div>
    </div>
  );
}
export default MatchingGame;
