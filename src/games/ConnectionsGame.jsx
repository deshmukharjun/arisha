import React, { useState, useEffect, useCallback, useRef } from "react";

const GAME_DATA = [
  // Group 1: Yellow (Easiest)
  { word: "Ping", group: "Our Words", difficulty: 1 },
  { word: "Boobilisous", group: "Our Words", difficulty: 1 },
  { word: "Auto magically", group: "Our Words", difficulty: 1 },
  { word: "Tomatya", group: "Our Words", difficulty: 1 },

  // Group 2: Green
  { word: "Computer Lab", group: "Our Spots", difficulty: 2 },
  { word: "Wagon R", group: "Our Spots", difficulty: 2 },
  { word: "1/2 Floor", group: "Our Spots", difficulty: 2 },
  { word: "Puneville", group: "Our Spots", difficulty: 2 },

  // Group 3: Blue
  { word: "Good Morning", group: "Our Greetings", difficulty: 3 },
  { word: "Good Night", group: "Our Greetings", difficulty: 3 },
  { word: "Au Revoir", group: "Our Greetings", difficulty: 3 },
  { word: "I love you", group: "Our Greetings", difficulty: 3 },

  // Group 4: Purple (Hardest)
  { word: "13 going on 30", group: "Mau's Favourites", difficulty: 4 },
  { word: "Halsey", group: "Mau's Favourites", difficulty: 4 },
  { word: "Harry Potter", group: "Mau's Favourites", difficulty: 4 },
  { word: "Arjun", group: "Mau's Favourites", difficulty: 4 },
];

// Map difficulty levels to specific Tailwind CSS background colors,
// mimicking the NYT Connections game's color progression.
const DIFFICULTY_COLORS = {
  1: "bg-yellow-500", // NYT Yellow
  2: "bg-green-500", // NYT Green
  3: "bg-blue-500", // NYT Blue
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
  const [showInfo, setShowInfo] = useState(true);
  const audioRef = useRef(null);

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

  // Effect to show info dialog and play voice.mp3 once on mount
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
    const timer = setTimeout(() => {
      setShowInfo(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

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
  const handleWordClick = useCallback(
    (wordObj) => {
      if (isGameOver) return; // Prevent interaction if game is over

      if (selectedWords.includes(wordObj)) {
        // If already selected, deselect it
        setSelectedWords((prevSelected) =>
          prevSelected.filter((item) => item !== wordObj)
        );
      } else if (selectedWords.length < 4) {
        // If less than 4 words are selected, add to selection
        setSelectedWords((prevSelected) => [...prevSelected, wordObj]);
      }
    },
    [selectedWords, isGameOver]
  ); // Dependencies: re-run when selectedWords or isGameOver change

  // --- Group Submission Logic ---
  /**
   * Handles the "Submit Group" action. Checks if the selected words form a valid group.
   */
  const handleSubmitGroup = useCallback(() => {
    if (selectedWords.length !== 4 || isGameOver) return; // Must have 4 words selected and game not over

    const firstWordGroup = selectedWords[0].group;
    // Check if all selected words belong to the same group
    const isCorrectGroup = selectedWords.every(
      (word) => word.group === firstWordGroup
    );

    if (isCorrectGroup) {
      const solvedDifficulty = selectedWords[0].difficulty;
      const solvedWordStrings = selectedWords.map((w) => w.word); // Get just the word strings for display

      // Prevent re-solving an already solved group (edge case)
      const isGroupAlreadySolved = solvedGroups.some(
        (g) => g.name === firstWordGroup
      );
      if (isGroupAlreadySolved) {
        setFeedbackMessage("You already solved this group!");
        setSelectedWords([]); // Clear selection
        return;
      }

      // Add the newly solved group and sort by difficulty for NYT display order
      setSolvedGroups((prevSolvedGroups) =>
        [
          ...prevSolvedGroups,
          {
            name: firstWordGroup,
            difficulty: solvedDifficulty,
            words: solvedWordStrings,
          },
        ].sort((a, b) => a.difficulty - b.difficulty)
      );

      // Remove solved words from the unsolved grid
      setUnsolvedWords((prevUnsolvedWords) =>
        prevUnsolvedWords.filter((word) => !selectedWords.includes(word))
      );
      setFeedbackMessage("Correct! " + firstWordGroup); // Provide positive feedback
    } else {
      setMistakesLeft((prevMistakes) => prevMistakes - 1); // Decrement mistakes on incorrect guess
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
    setUnsolvedWords((prevUnsolvedWords) => shuffleArray(prevUnsolvedWords));
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
    <div className="min-h-screen bg-neutral-900 text-white p-2 sm:p-3 flex flex-col items-center justify-center font-sans">
      {/* Info Dialog Overlay */}
      {showInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto">
          <div className="absolute inset-0 bg-black bg-opacity-40 z-[101] pointer-events-auto" />
          <img
            src="/connections-info.png"
            alt="How to play Connections"
            className="z-[102] max-w-[90vw] max-h-[90vh] drop-shadow-2xl rounded-2xl animate-fade-in"
            style={{ pointerEvents: 'auto' }}
          />
        </div>
      )}
      {/* Play voice.mp3 once on mount */}
      <audio ref={audioRef} src="/voice.mp3" autoPlay style={{ display: 'none' }} />
      {/* Back to Home Button */}
      <button
        onClick={handleBackToHome}
        className="absolute top-4 left-4 bg-yellow-400 text-black px-4 py-2 rounded-md font-semibold shadow-md hover:bg-yellow-300 transition active:scale-95 z-20 text-base sm:text-base"
      >
        Home
      </button>
      <div className="w-full max-w-lg bg-neutral-900 rounded-lg shadow-xl flex flex-col gap-5">
        {/* Header Section: Title and Mistakes Counter */}
        <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center mb-4 gap-2 xs:gap-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 text-center xs:text-left">
            Connections
          </h1>
          <div className="flex items-center justify-center xs:justify-end space-x-2">
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
            className={`w-full p-2 sm:p-3 rounded-md text-center text-black font-semibold text-base sm:text-xs transition-all duration-300 ease-in-out ${
              DIFFICULTY_COLORS[group.difficulty]
            }`}
          >
            <p className="text-xs sm:text-sm font-normal opacity-90">
              {group.name.toUpperCase()}
            </p>
            <p className="font-bold text-sm sm:text-base">
              {group.words.join(", ")}
            </p>
          </div>
        ))}

        {/* Word Grid: Displays the unsolved words */}
        {/* MODIFIED: Removed fixed height (h-[344px]) and grid-rows-4 */}
        <div className="grid grid-cols-4 gap-2 mx-auto w-[calc(24px+90vw)] sm:w-[624px]">
          {unsolvedWords.map((wordObj) => {
            const isWordSelected = selectedWords.includes(wordObj);
            return (
              <button
                key={wordObj.word}
                onClick={() => handleWordClick(wordObj)}
                disabled={isGameOver}
                className={`
                  aspect-square w-full flex items-center justify-center
                  rounded-md font-bold text-[11px] sm:text-lg uppercase
                  whitespace-normal break-words text-center
                  bg-neutral-700 text-gray-100 hover:bg-neutral-600
                  transition-all duration-150
                  shadow-md hover:shadow-lg
                  ${
                    isWordSelected
                      ? "border-4 border-blue-400 bg-blue-400 text-white"
                      : "border-2 border-transparent"
                  }
                  ${isGameOver ? "opacity-70 cursor-not-allowed" : ""}
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
          <p
            className={`text-center text-xs sm:text-sm mt-2 ${
              hasWon ? "text-green-400" : "text-red-400"
            }`}
          >
            {feedbackMessage}
          </p>
        )}

        {/* Control Buttons: Shuffle, Deselect All, Submit */}
        <div className="flex flex-col sm:flex-row w-full gap-2 sm:gap-2 justify-between items-stretch sm:items-center mt-4">
          <button
            onClick={handleShuffleWords}
            disabled={isGameOver}
            className="w-full sm:w-auto px-2 py-2 sm:px-4 sm:py-3 bg-neutral-600 text-white rounded-md font-semibold text-sm sm:text-base hover:bg-neutral-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            Shuffle
          </button>
          <button
            onClick={handleDeselectAllWords}
            disabled={selectedWords.length === 0 || isGameOver}
            className="w-full sm:w-auto px-2 py-2 sm:px-4 sm:py-3 bg-neutral-600 text-white rounded-md font-semibold text-sm sm:text-base hover:bg-neutral-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            Deselect All
          </button>
          <button
            onClick={handleSubmitGroup}
            disabled={selectedWords.length !== 4 || isGameOver}
            className="w-full sm:w-auto px-2 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-md font-semibold text-sm sm:text-base hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
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
              className="mt-4 px-4 py-2 sm:px-6 sm:py-3 bg-yellow-400 text-black font-semibold rounded-md hover:bg-white transition-colors duration-200"
            >
              Play Again
            </button>
            {/* Go To Memory Lane Button */}
            <button
              onClick={() => {
                sessionStorage.setItem('playMemoryLaneMusic', 'true');
                window.location.href = "/memory-lane";
              }}
              className="mt-4 w-full px-4 py-3 bg-yellow-400 text-black font-bold rounded-md shadow-md hover:bg-yellow-300 transition-colors duration-200 text-lg"
            >
              Go To Memory Lane
            </button>
          </div>
        )}
      </div>
    </div>
  );
}