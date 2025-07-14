import { useState, useEffect, useRef, useCallback } from 'react';

// This data would typically be in a separate file, but for a self-contained example, it's here.
// Using local image paths as requested.
const memoryGameData = [
  {
    id: 1,
    imageUrl: "/photos/memory1.png",
    correctMonth: "JUL",
    correctYear: "2018",
  },
  {
    id: 2,
    imageUrl: "/photos/memory2.png",
    correctMonth: "SEP",
    correctYear: "2024",
  },
  {
    id: 3,
    imageUrl: "/photos/memory3.png",
    correctMonth: "JUL",
    correctYear: "2022",
  },
];

// Main App component to manage game rounds
export default function App() {
  const [gameComplete, setGameComplete] = useState(false);

  const handleGameComplete = () => {
    setGameComplete(true);
  };

  return (
    <div className="min-h-screen bg-[#444] text-white font-inter flex flex-col items-center justify-center p-4">
      {gameComplete ? (
        <div className="text-center bg-[#333] rounded-xl p-6 w-full max-w-md shadow-lg">
          <h1 className="text-4xl font-bold mb-4 text-green-400">🎉 Game Over! 🎉</h1>
          <p className="text-xl text-gray-300">You've completed all memory challenges!</p>
          <button
            onClick={() => {
              window.location.reload(); // Simple way to restart the game
            }}
            className="mt-6 bg-black text-white px-6 py-2 rounded-md font-semibold hover:bg-white hover:text-black transition"
          >
            Play Again
          </button>
        </div>
      ) : (
        <WordleMemoryGame onGameComplete={handleGameComplete} />
      )}
    </div>
  );
}

// WordleMemoryGame component
function WordleMemoryGame({ onGameComplete }) {
  const MAX_ATTEMPTS = 3;
  const MONTH_LENGTH = 3;
  const YEAR_LENGTH = 4;

  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [monthGuesses, setMonthGuesses] = useState([]); // Array of { guess: string, feedback: string[] }
  const [yearGuesses, setYearGuesses] = useState([]);   // Array of { guess: string, feedback: string[] }
  const [currentMonthInput, setCurrentMonthInput] = useState(Array(MONTH_LENGTH).fill(''));
  const [currentYearInput, setCurrentYearInput] = useState(Array(YEAR_LENGTH).fill(''));
  const [message, setMessage] = useState('');
  const [roundOver, setRoundOver] = useState(false); // True when current round is won or lost
  const [roundWon, setRoundWon] = useState(false);   // True if current round was won

  // Refs for focusing input cells
  const monthInputRefs = useRef([]);
  const yearInputRefs = useRef([]);
  // We no longer need activeInputTypeRef and activeInputIndexRef with the new input handling approach

  const currentData = memoryGameData[currentRoundIndex];

  // Effect to focus the first input cell on round change or initial load
  useEffect(() => {
    if (!roundOver) {
      if (monthInputRefs.current[0]) {
        monthInputRefs.current[0].focus();
      }
    }
  }, [currentRoundIndex, roundOver]);

  // Function to calculate Wordle-like feedback
  const getFeedback = useCallback((guess, answer) => {
    const result = Array(guess.length).fill("gray");
    const answerChars = answer.split(''); // Convert answer to array for easier manipulation
    const guessChars = guess.split('');

    // Create a frequency map for the answer
    const answerCharCounts = {};
    for (const char of answerChars) {
      answerCharCounts[char] = (answerCharCounts[char] || 0) + 1;
    }

    // First pass: Mark 'green' (correct letter and position)
    for (let i = 0; i < guess.length; i++) {
      if (guessChars[i] === answerChars[i]) {
        result[i] = "green";
        answerCharCounts[guessChars[i]]--; // Decrement count for matched character
      }
    }

    // Second pass: Mark 'yellow' (correct letter, wrong position)
    for (let i = 0; i < guess.length; i++) {
      if (result[i] !== "green") { // Only check if not already green
        if (answerCharCounts[guessChars[i]] > 0) {
          result[i] = "yellow";
          answerCharCounts[guessChars[i]]--; // Decrement count for matched character
        }
      }
    }
    return result;
  }, []);

  // Handle changes for individual input cells
  const handleInputChange = (e, type, index) => {
    const value = e.target.value.toUpperCase(); // Convert to uppercase immediately
    let currentInputArray = type === 'month' ? [...currentMonthInput] : [...currentYearInput];
    const inputRefs = type === 'month' ? monthInputRefs : yearInputRefs;
    const inputLength = type === 'month' ? MONTH_LENGTH : YEAR_LENGTH;

    if (value.length > 1) {
      // This handles autofill or pasting, take only the last character
      currentInputArray[index] = value.slice(-1);
    } else {
      currentInputArray[index] = value;
    }

    if (type === 'month') {
      setCurrentMonthInput(currentInputArray);
    } else {
      setCurrentYearInput(currentInputArray);
    }

    // Auto-focus next input if current one is filled
    if (value && index < inputLength - 1) {
      inputRefs.current[index + 1].focus();
    } else if (value && index === inputLength - 1) {
      // If at the end of month input, move to year input
      if (type === 'month' && yearInputRefs.current[0]) {
        yearInputRefs.current[0].focus();
      } else if (type === 'year') {
        // If at the end of year input, and both are full, submit
        if (currentMonthInput.every(char => char !== '') && currentInputArray.every(char => char !== '')) {
            handleSubmitGuess();
        }
      }
    }
  };

  // Handle backspace for individual input cells
  const handleBackspace = (e, type, index) => {
    if (e.key === "Backspace") {
      e.preventDefault(); // Prevent default browser back navigation
      let currentInputArray = type === 'month' ? [...currentMonthInput] : [...currentYearInput];
      const inputRefs = type === 'month' ? monthInputRefs : yearInputRefs;

      if (currentInputArray[index]) {
        currentInputArray[index] = "";
      } else if (index > 0) {
        currentInputArray[index - 1] = "";
        inputRefs.current[index - 1].focus();
      } else if (index === 0 && type === 'year') {
        // If at start of year input, move to last month input
        if (monthInputRefs.current[MONTH_LENGTH - 1]) {
          monthInputRefs.current[MONTH_LENGTH - 1].focus();
        }
      }

      if (type === 'month') setCurrentMonthInput(currentInputArray);
      else setCurrentYearInput(currentInputArray);
    } else if (e.key === "Enter") {
        e.preventDefault();
        if (currentMonthInput.every(char => char !== '') && currentYearInput.every(char => char !== '')) {
            handleSubmitGuess();
        }
    }
  };


  // Handles the submission of a combined month and year guess
  const handleSubmitGuess = () => {
    const monthGuess = currentMonthInput.join('');
    const yearGuess = currentYearInput.join('');

    // Validate if inputs are complete
    if (monthGuess.length !== MONTH_LENGTH || yearGuess.length !== YEAR_LENGTH) {
      setMessage('Please complete both month and year guesses.');
      return;
    }

    const newMonthFeedback = getFeedback(monthGuess, currentData.correctMonth.toUpperCase());
    const newYearFeedback = getFeedback(yearGuess, currentData.correctYear.toUpperCase());

    const isMonthCorrect = newMonthFeedback.every(f => f === 'green');
    const isYearCorrect = newYearFeedback.every(f => f === 'green');

    // Add current guess and feedback to attempts history
    setMonthGuesses(prev => [...prev, { guess: monthGuess, feedback: newMonthFeedback }]);
    setYearGuesses(prev => [...prev, { guess: yearGuess, feedback: newYearFeedback }]);

    if (isMonthCorrect && isYearCorrect) {
      setMessage('✅ Correct! Moving to next memory...');
      setRoundWon(true);
      setRoundOver(true);
    } else if (monthGuesses.length + 1 >= MAX_ATTEMPTS) { // Check if this is the last attempt
      setMessage(`❌ Round Lost! The correct answer was ${currentData.correctMonth} ${currentData.correctYear}.`);
      setRoundWon(false);
      setRoundOver(true);
    } else {
      setMessage(''); // Clear message for next attempt
    }

    // Reset current input for the next attempt
    setCurrentMonthInput(Array(MONTH_LENGTH).fill(''));
    setCurrentYearInput(Array(YEAR_LENGTH).fill(''));

    // After a short delay, proceed to next round or end game
    if (isMonthCorrect && isYearCorrect || monthGuesses.length + 1 >= MAX_ATTEMPTS) {
      setTimeout(() => {
        if (currentRoundIndex + 1 < memoryGameData.length) {
          setCurrentRoundIndex(prev => prev + 1);
          setMonthGuesses([]);
          setYearGuesses([]);
          setCurrentMonthInput(Array(MONTH_LENGTH).fill(''));
          setCurrentYearInput(Array(YEAR_LENGTH).fill(''));
          setMessage('');
          setRoundOver(false);
          setRoundWon(false);
        } else {
          onGameComplete(); // All rounds completed
        }
      }, 2000); // Wait 2 seconds before moving on
    }
  };

  // Helper function to get the color class for a cell
  const getCellColor = (feedback, index) => {
    switch (feedback[index]) {
      case "green":
        return "bg-[#528D4D]"; // Updated green
      case "yellow":
        return "bg-[#B59F3A]"; // Updated yellow
      case "gray":
      default:
        return "bg-[#3A3A3C]"; // Updated gray
    }
  };

  // Render a single row of input/display cells
  const renderGuessRow = (type, rowIndex) => {
    const length = type === 'month' ? MONTH_LENGTH : YEAR_LENGTH;
    const inputRefs = type === 'month' ? monthInputRefs : yearInputRefs;
    const guesses = type === 'month' ? monthGuesses : yearGuesses;
    const currentInput = type === 'month' ? currentMonthInput : currentYearInput;

    let displayArray;
    let feedbackArray;
    let isCurrentRow = false;

    if (rowIndex < guesses.length) {
      // This is a past guess
      displayArray = guesses[rowIndex].guess.split('');
      feedbackArray = guesses[rowIndex].feedback;
    } else if (rowIndex === guesses.length && !roundOver) {
      // This is the current active input row
      displayArray = currentInput;
      feedbackArray = Array(length).fill('gray'); // Current input cells are always gray initially
      isCurrentRow = true;
    } else {
      // This is a future empty row
      displayArray = Array(length).fill('');
      feedbackArray = Array(length).fill('gray');
    }

    return (
      <div className="flex gap-1 sm:gap-2"> {/* Reduced gap for small screens */}
        {Array.from({ length: length }).map((_, i) => (
          <input
            key={`${type}-${rowIndex}-${i}`}
            type="text"
            maxLength={1}
            value={displayArray[i] || ''}
            onKeyDown={(e) => isCurrentRow && handleBackspace(e, type, i)} // Only handle backspace and enter with onKeyDown
            onChange={(e) => isCurrentRow && handleInputChange(e, type, i)} // Handle character input with onChange
            ref={el => {
              if (isCurrentRow) {
                inputRefs.current[i] = el;
              }
            }}
            className={`
              w-10 h-10 sm:w-12 sm:h-12 text-center text-xl sm:text-2xl font-bold text-white uppercase rounded-sm
              flex items-center justify-center transition-colors duration-300 ease-in-out
              ${isCurrentRow ? 'bg-[#3A3A3C] border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500' : getCellColor(feedbackArray, i)}
            `}
            readOnly={!isCurrentRow} // Make previous and future rows read-only
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#444] flex items-center justify-center px-4 py-8">
      <div className="bg-[#333] rounded-xl p-6 w-full max-w-md text-center shadow-lg">
        <h1 className="text-white text-2xl font-bold mb-1">Wordle Memory Arisha</h1>
        <p className="text-sm text-gray-300 mb-4">
          guess the correct month and year
        </p>

        {/* Image Display */}
        <div className="relative w-full mb-4 rounded-lg overflow-hidden">
          <img
            src={currentData.imageUrl}
            alt="Memory Photo"
            width={826} // Explicit width
            height={738} // Explicit height
            className={`
              w-full h-auto max-w-full object-cover transition duration-500
              ${roundOver && roundWon ? "blur-0" : "blur-sm"}
            `}
            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/826x738/333333/FFFFFF?text=Image+Not+Found`; }}
          />
          {roundOver && !roundWon && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center text-white text-xl font-bold rounded-lg">
              <p>The image was {currentData.correctMonth} {currentData.correctYear}</p>
            </div>
          )}
        </div>

        {/* Guess Grids */}
        <div className="flex w-full max-w-xs mx-auto mb-4 px-1 sm:px-0">
          <h2 className="text-white font-semibold text-base sm:text-lg flex-1 text-center">Month</h2>
          <h2 className="text-white font-semibold text-base sm:text-lg flex-1 text-center">Year</h2>
        </div>

        <div className="flex flex-col gap-2 items-center mb-4">
          {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIndex) => (
            <div key={`guess-row-pair-${rowIndex}`} className="flex gap-2 sm:gap-4">
              {renderGuessRow('month', rowIndex)}
              {renderGuessRow('year', rowIndex)}
            </div>
          ))}
        </div>

        {/* Submit Button and Messages */}
        {!roundOver && (
          <>
            <button
              onClick={handleSubmitGuess}
              className="bg-black text-white px-6 py-2 rounded-md font-semibold hover:bg-white hover:text-black transition text-sm sm:text-base"
              disabled={currentMonthInput.some(char => char === '') || currentYearInput.some(char => char === '')}
            >
              Submit Answer
            </button>
            <p className="text-xs sm:text-sm text-gray-300 mt-2">
              {MAX_ATTEMPTS - monthGuesses.length} chance{MAX_ATTEMPTS - monthGuesses.length !== 1 && "s"} left
            </p>
          </>
        )}

        {roundOver && (
          <p className={`mt-4 text-base sm:text-lg font-semibold animate-pulse ${roundWon ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}