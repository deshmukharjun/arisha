import React, { useState, useEffect, useCallback } from "react";

const GAME_DATA = [
  // Group 1: Yellow (Easiest)
  { word: "Oreo", group: "Cookies & Biscuits", difficulty: 1 },
  { word: "KurKure", group: "Cookies & Biscuits", difficulty: 1 },
  { word: "Lays", group: "Cookies & Biscuits", difficulty: 1 },
  { word: "Hide&Seek", group: "Cookies & Biscuits", difficulty: 1 },

  // Group 2: Green
  { word: "Zara", group: "Fashion Brands", difficulty: 2 },
  { word: "H&M", group: "Fashion Brands", difficulty: 2 },
  { word: "Nike", group: "Fashion Brands", difficulty: 2 },
  { word: "Adidas", group: "Fashion Brands", difficulty: 2 },

  // Group 3: Blue
  { word: "Goa", group: "Indian Tourist Spots", difficulty: 3 },
  { word: "Pune", group: "Indian Tourist Spots", difficulty: 3 },
  { word: "Manali", group: "Indian Tourist Spots", difficulty: 3 },
  { word: "Lonavala", group: "Indian Tourist Spots", difficulty: 3 },

  // Group 4: Purple (Hardest)
  { word: "Netflix", group: "Streaming Platforms", difficulty: 4 },
  { word: "Hotstar", group: "Streaming Platforms", difficulty: 4 },
  { word: "Prime", group: "Streaming Platforms", difficulty: 4 },
  { word: "JioCinema", group: "Streaming Platforms", difficulty: 4 },
];

// Map difficulty levels to specific Tailwind CSS background colors,
// mimicking the NYT Connections game's color progression.
const DIFFICULTY_COLORS = {
  1: "bg-yellow-500", // NYT Yellow
  2: "bg-green-500",  // NYT Green
  3: "bg-blue-500",   // NYT Blue
  4: "bg-purple-500", // NYT Purple
};

// --- Utility Functions ---
/**
 * Shuffles an array randomly using the Fisher-Yates (Knuth) algorithm.
 * Creates a shallow copy to avoid mutating the original array.
 * @param {Array} array The array to shuffle.
 * @returns {Array} A new, shuffled array.
 */
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// --- Main ConnectionsGame Component ---
export default function ConnectionsGame() {
  // State for words currently displayed in the grid (unsolved words)
  const [unsolvedWords, setUnsolvedWords] = useState([]);
  // State for the words currently selected by the user (max 4)
  const [selectedWords, setSelectedWords] = useState([]);
  // State for groups that have been correctly solved: { name, difficulty, words }
  const [solvedGroups, setSolvedGroups] = useState([]);
  // State for the number of mistakes remaining (starts at 4, as per NYT game)
  const [mistakesLeft, setMistakesLeft] = useState(4);
  // State for displaying temporary feedback messages to the user
  const [feedbackMessage, setFeedbackMessage] = useState("");
  // State to track if the game has concluded (win or lose)
  const [isGameOver, setIsGameOver] = useState(false);
  // State to track if the game was won
  const [hasWon, setHasWon] = useState(false);

  // --- Game Initialization ---
  // Initializes or resets the game state.
  const initializeGame = useCallback(() => {
    const shuffledInitialWords = shuffleArray(GAME_DATA);
    setUnsolvedWords(shuffledInitialWords);
    setSelectedWords([]);
    setSolvedGroups([]);
    setMistakesLeft(4);
    setFeedbackMessage("");
    setIsGameOver(false);
    setHasWon(false);
  }, []); // No dependencies, so this function is stable and doesn't recreate unnecessarily

  // Effect to initialize the game when the component mounts.
  useEffect(() => {
    initializeGame();
  }, [initializeGame]); // Dependency on initializeGame to ensure it's called on mount

  // --- Game End Condition Check ---
  // Effect to check for game win/loss conditions whenever solvedGroups or mistakesLeft change.
  useEffect(() => {
    if (solvedGroups.length === 4) {
      setHasWon(true);
      setIsGameOver(true);
      setFeedbackMessage("Yayy! You win!");
    } else if (mistakesLeft === 0) {
      setIsGameOver(true);
      setFeedbackMessage("Game Over Mau! You ran out of mistakes.");
    }
  }, [solvedGroups, mistakesLeft]); // Dependencies: re-run when these states change

  // --- Word Selection Logic ---
  /**
   * Handles a click on a word tile. Selects or deselects the word.
   * @param {Object} wordObj The word object clicked.
   */
  const handleWordClick = useCallback((wordObj) => {
    if (isGameOver) return; // Prevent interaction if game is over

    if (selectedWords.includes(wordObj)) {
      // If already selected, deselect it
      setSelectedWords(prevSelected => prevSelected.filter((item) => item !== wordObj));
    } else if (selectedWords.length < 4) {
      // If less than 4 words are selected, add to selection
      setSelectedWords(prevSelected => [...prevSelected, wordObj]);
    }
  }, [selectedWords, isGameOver]); // Dependencies: re-run when selectedWords or isGameOver change

  // --- Group Submission Logic ---
  /**
   * Handles the "Submit Group" action. Checks if the selected words form a valid group.
   */
  const handleSubmitGroup = useCallback(() => {
    if (selectedWords.length !== 4 || isGameOver) return; // Must have 4 words selected and game not over

    const firstWordGroup = selectedWords[0].group;
    // Check if all selected words belong to the same group
    const isCorrectGroup = selectedWords.every((word) => word.group === firstWordGroup);

    if (isCorrectGroup) {
      const solvedDifficulty = selectedWords[0].difficulty;
      const solvedWordStrings = selectedWords.map(w => w.word); // Get just the word strings for display

      // Prevent re-solving an already solved group (edge case)
      const isGroupAlreadySolved = solvedGroups.some(g => g.name === firstWordGroup);
      if (isGroupAlreadySolved) {
        setFeedbackMessage("You already solved this group!");
        setSelectedWords([]); // Clear selection
        return;
      }

      // Add the newly solved group and sort by difficulty for NYT display order
      setSolvedGroups(prevSolvedGroups =>
        [...prevSolvedGroups, {
          name: firstWordGroup,
          difficulty: solvedDifficulty,
          words: solvedWordStrings
        }].sort((a, b) => a.difficulty - b.difficulty)
      );

      // Remove solved words from the unsolved grid
      setUnsolvedWords(prevUnsolvedWords =>
        prevUnsolvedWords.filter((word) => !selectedWords.includes(word))
      );
      setFeedbackMessage("Correct! " + firstWordGroup); // Provide positive feedback
    } else {
      setMistakesLeft(prevMistakes => prevMistakes - 1); // Decrement mistakes on incorrect guess
      setFeedbackMessage("Incorrect group. Try again!"); // Provide negative feedback
    }
    setSelectedWords([]); // Clear selection after submission, regardless of correctness
  }, [selectedWords, solvedGroups, unsolvedWords, isGameOver]); // Dependencies

  // --- Control Button Actions ---
  /**
   * Shuffles the order of the currently unsolved words in the grid.
   */
  const handleShuffleWords = useCallback(() => {
    if (isGameOver) return; // Prevent shuffling if game is over
    setUnsolvedWords(prevUnsolvedWords => shuffleArray(prevUnsolvedWords));
    setFeedbackMessage("Words shuffled!");
  }, [unsolvedWords, isGameOver]); // Dependencies

  /**
   * Clears all currently selected words.
   */
  const handleDeselectAllWords = useCallback(() => {
    if (isGameOver) return; // Prevent deselecting if game is over
    setSelectedWords([]);
    setFeedbackMessage("Selection cleared.");
  }, [isGameOver]); // Dependency

  // Add back to home navigation
  const handleBackToHome = () => {
    window.location.href = "/";
  };

  // --- UI Helpers ---
  /**
   * Determines the background color for the mistake indicator dots.
   * @param {number} index The index of the dot (0-3).
   * @returns {string} Tailwind CSS class for the dot's background color.
   */
  const getMistakeDotColor = (index) => {
    return index < mistakesLeft ? "bg-gray-300" : "bg-gray-700";
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-4 sm:p-6 flex flex-col items-center justify-center font-sans">
      {/* Back to Home Button */}
      <button
        onClick={handleBackToHome}
        className="absolute top-4 left-4 bg-yellow-400 text-black px-4 py-2 rounded-md font-semibold shadow-md hover:bg-yellow-300 transition active:scale-95 z-20 text-base sm:text-base"
      >
        Home
      </button>
      <div className="w-full max-w-lg bg-neutral-800 rounded-lg shadow-xl p-4 sm:p-6 flex flex-col gap-4">
        {/* Header Section: Title and Mistakes Counter */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">Connections</h1>
          <div className="flex items-center space-x-2">
            <span className="text-xs sm:text-sm text-gray-400">Mistakes:</span>
            <div className="flex space-x-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${getMistakeDotColor(i)}`}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Solved Groups Display Area */}
        {solvedGroups.map((group) => (
          <div
            key={group.name} // Unique key for each solved group
            className={`w-full p-2 sm:p-3 rounded-md text-center text-black font-semibold text-base sm:text-xs transition-all duration-300 ease-in-out ${DIFFICULTY_COLORS[group.difficulty]}`}
          >
            <p className="text-xs sm:text-sm font-normal opacity-90">{group.name.toUpperCase()}</p>
            <p className="font-bold text-sm sm:text-base">{group.words.join(", ")}</p>
          </div>
        ))}

        {/* Word Grid: Displays the unsolved words */}
        <div className="grid grid-cols-4 gap-2 w-full">
          {unsolvedWords.map((wordObj) => {
            const isWordSelected = selectedWords.includes(wordObj);
            return (
              <button
                key={wordObj.word} // Assuming words are unique for keys
                onClick={() => handleWordClick(wordObj)}
                disabled={isGameOver} // Disable buttons if game is over
                className={`
                  p-3 sm:p-3 rounded-md text-center font-semibold text-base sm:text-sm cursor-pointer
                  transition-all duration-150 ease-in-out
                  shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400
                  ${isWordSelected
                    ? "bg-blue-400 text-white" // Styling for selected words
                    : "bg-neutral-700 text-gray-100 hover:bg-neutral-600" // Styling for unselected words
                  }
                  ${isGameOver ? "opacity-70 cursor-not-allowed" : ""} {/* Dim and disable if game over */}
                  active:scale-95
                `}
              >
                {wordObj.word}
              </button>
            );
          })}
        </div>

        {/* Feedback Message Area */}
        {feedbackMessage && (
          <p className={`text-center text-xs sm:text-sm mt-2 ${hasWon ? 'text-green-400' : 'text-red-400'}`}>
            {feedbackMessage}
          </p>
        )}

        {/* Control Buttons: Shuffle, Deselect All, Submit */}
        <div className="flex justify-between items-center mt-4 gap-2">
          <button
            onClick={handleShuffleWords}
            disabled={isGameOver}
            className="px-4 py-3 sm:px-4 sm:py-2 bg-neutral-600 text-white rounded-md font-semibold text-base sm:text-sm hover:bg-neutral-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            Shuffle
          </button>
          <button
            onClick={handleDeselectAllWords}
            disabled={selectedWords.length === 0 || isGameOver}
            className="px-4 py-3 sm:px-4 sm:py-2 bg-neutral-600 text-white rounded-md font-semibold text-base sm:text-sm hover:bg-neutral-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            Deselect All
          </button>
          <button
            onClick={handleSubmitGroup}
            disabled={selectedWords.length !== 4 || isGameOver}
            className="px-6 py-3 sm:px-6 sm:py-2 bg-blue-600 text-white rounded-md font-semibold text-base sm:text-base hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            Submit
          </button>
        </div>

        {/* Game Over / Win Screen */}
        {isGameOver && (
          <div className="mt-6 text-center">
            {hasWon ? (
              <p className="text-lg sm:text-xl font-bold animate-pulse text-green-400">
                Congratulations Mau! You solved it!
              </p>
            ) : (
              <p className="text-lg sm:text-xl font-bold text-red-400">
                Better luck next time!
              </p>
            )}
            <button
              onClick={initializeGame} // Button to restart the game
              className="mt-4 px-4 py-2 sm:px-6 sm:py-3 bg-highlight text-black font-semibold rounded-md hover:bg-white transition-colors duration-200"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
