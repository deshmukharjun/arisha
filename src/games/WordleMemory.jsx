import { useState } from 'react';
import WordleMemoryGame from './WordleMemoryGame'; // Assuming WordleMemoryGame is in the same directory

// WordleMemoryPage component: This acts as the container for the WordleMemoryGame,
// managing the overall game completion (all rounds) and triggering navigation.
// It now also accepts an onPlayConnections prop for navigation to the other game.
function WordleMemoryPage({ onGameComplete, onPlayConnections }) {
  const [allRoundsCompleted, setAllRoundsCompleted] = useState(false);
  const [gameKey, setGameKey] = useState(0); // Key to force re-render of WordleMemoryGame

  // Add back to home navigation
  const handleBackToHome = () => {
    window.location.href = "/";
  };

  const handleAllMemoryRoundsComplete = () => {
    setAllRoundsCompleted(true);
  };

  const handleRestartGame = () => {
    setAllRoundsCompleted(false); // Reset completion state
    setGameKey(prevKey => prevKey + 1); // Change key to force re-render and reset WordleMemoryGame
  };

  return (
    <div className="min-h-screen bg-bgDark text-white font-inter flex flex-col items-center justify-center p-4">
      {/* Back to Home Button */}
      <button
        onClick={handleBackToHome}
        className="absolute top-4 left-4 bg-yellow-400 text-black px-4 py-2 rounded-md font-semibold shadow-md hover:bg-yellow-300 transition active:scale-95 z-20 text-base sm:text-base"
      >
        Home
      </button>
      {allRoundsCompleted ? (
        <div className="text-center bg-[#333] rounded-xl p-6 w-full max-w-md shadow-lg">
          <h1 className="text-4xl font-bold mb-4 text-green-400">🎉 Memory Game Completed! 🎉</h1>
          <p className="text-xl text-gray-300 mb-6">What would you like to do next?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRestartGame}
              className="bg-black text-white px-6 py-3 rounded-md font-semibold hover:bg-white hover:text-black transition text-lg sm:text-xl flex-1 active:scale-95"
            >
              Restart Game
            </button>
            <button
              onClick={onPlayConnections}
              className="bg-yellow-400 text-black px-6 py-3 rounded-md font-semibold hover:bg-purple-700 transition text-lg sm:text-xl flex-1 active:scale-95"
            >
              Play Connections
            </button>
          </div>
        </div>
      ) : (
        <WordleMemoryGame
          key={gameKey}
          onGameComplete={handleAllMemoryRoundsComplete}
        />
      )}
    </div>
  );
}
export default WordleMemoryPage;