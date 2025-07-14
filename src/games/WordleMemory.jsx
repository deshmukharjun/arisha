import { useState, useEffect, useRef, useCallback } from 'react';

// This data defines the memory challenges.
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

// WordleMemoryGame component: Contains the core game logic for a single round.
// It takes an `onGameComplete` prop which is called when all rounds are finished.
function WordleMemoryGame({ onGameComplete }) {
  const MAX_ATTEMPTS = 3; // Maximum attempts per round
  const MONTH_LENGTH = 3; // Length of month (e.g., JUL)
  const YEAR_LENGTH = 4;  // Length of year (e.g., 2018)

  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [monthGuesses, setMonthGuesses] = useState([]); // History of month guesses and their feedback
  const [yearGuesses, setYearGuesses] = useState([]);   // History of year guesses and their feedback
  const [currentMonthInput, setCurrentMonthInput] = useState(Array(MONTH_LENGTH).fill('')); // Current month input state
  const [currentYearInput, setCurrentYearInput] = useState(Array(YEAR_LENGTH).fill(''));   // Current year input state
  const [message, setMessage] = useState('');     // Feedback message to the user
  const [roundOver, setRoundOver] = useState(false); // True when the current round is won or lost
  const [roundWon, setRoundWon] = useState(false);   // True if the current round was won

  // Refs for managing focus on input cells
  const monthInputRefs = useRef([]);
  const yearInputRefs = useRef([]);

  const currentData = memoryGameData[currentRoundIndex]; // Data for the current memory challenge

  // Effect to focus the first input cell when a new round starts or on initial load
  useEffect(() => {
    if (!roundOver) {
      // Ensure the input element exists before attempting to focus
      if (monthInputRefs.current[0]) {
        monthInputRefs.current[0].focus();
      }
    }
  }, [currentRoundIndex, roundOver]); // Dependencies: re-run when round changes or roundOver state changes

  // Function to calculate Wordle-like feedback (green, yellow, gray)
  const getFeedback = useCallback((guess, answer) => {
    const result = Array(guess.length).fill("gray"); // Default to gray
    const answerChars = answer.split('');
    const guessChars = guess.split('');

    // Create a frequency map for the answer characters
    const answerCharCounts = {};
    for (const char of answerChars) {
      answerCharCounts[char] = (answerCharCounts[char] || 0) + 1;
    }

    // First pass: Mark 'green' (correct letter and position)
    for (let i = 0; i < guess.length; i++) {
      if (guessChars[i] === answerChars[i]) {
        result[i] = "green";
        answerCharCounts[guessChars[i]]--; // Decrement count for matched characters
      }
    }

    // Second pass: Mark 'yellow' (correct letter, wrong position)
    for (let i = 0; i < guess.length; i++) {
      if (result[i] !== "green") { // Only check if not already marked green
        if (answerCharCounts[guessChars[i]] > 0) {
          result[i] = "yellow";
          answerCharCounts[guessChars[i]]--; // Decrement count for matched characters
        }
      }
    }
    return result;
  }, []); // No dependencies, as it only uses its arguments

  // Handles input changes for individual cells, including auto-focusing and validation
  const handleInputChange = (e, type, index) => {
    let value = e.target.value;
    let currentInputArray = type === 'month' ? [...currentMonthInput] : [...currentYearInput];
    const inputRefs = type === 'month' ? monthInputRefs : yearInputRefs;
    const inputLength = type === 'month' ? MONTH_LENGTH : YEAR_LENGTH;

    // Validate input based on type
    if (type === 'month') {
      value = value.toUpperCase(); // Convert to uppercase for months
      // Only allow alphabetic characters for month
      if (!value.match(/^[A-Z]$/) && value !== '') {
        return; // Ignore invalid input
      }
    } else { // type === 'year'
      // Only allow numeric characters for year
      if (!value.match(/^[0-9]$/) && value !== '') {
        return; // Ignore invalid input
      }
    }

    // Handle cases where more than one character is pasted/autofilled
    if (value.length > 1) {
      currentInputArray[index] = value.slice(-1); // Take only the last character
    } else {
      currentInputArray[index] = value;
    }

    // Update the correct state based on input type
    if (type === 'month') {
      setCurrentMonthInput(currentInputArray);
    } else {
      setCurrentYearInput(currentInputArray);
    }

    // Auto-focus the next input cell if the current one is filled
    if (value && index < inputLength - 1) {
      inputRefs.current[index + 1].focus();
    } else if (value && index === inputLength - 1) {
      // If at the end of month input, move focus to the first year input cell
      if (type === 'month' && yearInputRefs.current[0]) {
        yearInputRefs.current[0].focus();
      }
      // No explicit submission here; submission is handled by button click or Enter key
    }
  };

  // Handles backspace key presses for individual cells, including moving focus backwards
  const handleBackspace = (e, type, index) => {
    if (e.key === "Backspace") {
      e.preventDefault(); // Prevent default browser back navigation
      let currentInputArray = type === 'month' ? [...currentMonthInput] : [...currentYearInput];
      const inputRefs = type === 'month' ? monthInputRefs : yearInputRefs;

      if (currentInputArray[index]) {
        // If current cell has a value, clear it
        currentInputArray[index] = "";
      } else if (index > 0) {
        // If current cell is empty, clear the previous cell and move focus
        currentInputArray[index - 1] = "";
        inputRefs.current[index - 1].focus();
      } else if (index === 0 && type === 'year') {
        // If at the start of year input, move focus to the last month input cell
        if (monthInputRefs.current[MONTH_LENGTH - 1]) {
          monthInputRefs.current[MONTH_LENGTH - 1].focus();
        }
      }

      // Update the correct state based on input type
      if (type === 'month') setCurrentMonthInput(currentInputArray);
      else setCurrentYearInput(currentInputArray);
    } else if (e.key === "Enter") {
      e.preventDefault(); // Prevent default form submission
      // If both month and year inputs are complete, submit the guess
      if (currentMonthInput.every(char => char !== '') && currentYearInput.every(char => char !== '')) {
        handleSubmitGuess();
      }
    }
  };

  // Handles the submission of a combined month and year guess
  const handleSubmitGuess = () => {
    const monthGuess = currentMonthInput.join('');
    const yearGuess = currentYearInput.join('');

    // Validate if both inputs are fully complete
    if (monthGuess.length !== MONTH_LENGTH || yearGuess.length !== YEAR_LENGTH) {
      setMessage('Please complete both month and year guesses.');
      return;
    }

    // Get feedback for both month and year guesses
    const newMonthFeedback = getFeedback(monthGuess, currentData.correctMonth.toUpperCase());
    const newYearFeedback = getFeedback(yearGuess, currentData.correctYear.toUpperCase());

    // Check if both guesses are entirely correct
    const isMonthCorrect = newMonthFeedback.every(f => f === 'green');
    const isYearCorrect = newYearFeedback.every(f => f === 'green');

    // Add current guess and feedback to the history of attempts
    setMonthGuesses(prev => [...prev, { guess: monthGuess, feedback: newMonthFeedback }]);
    setYearGuesses(prev => [...prev, { guess: yearGuess, feedback: newYearFeedback }]);

    if (isMonthCorrect && isYearCorrect) {
      // If both are correct, the round is won
      setMessage('✅ Correct! Moving to next memory...');
      setRoundWon(true);
      setRoundOver(true);
    } else if (monthGuesses.length + 1 >= MAX_ATTEMPTS) {
      // If this was the last attempt and not correct, the round is lost
      setMessage(`❌ Round Lost! The correct answer was ${currentData.correctMonth} ${currentData.correctYear}.`);
      setRoundWon(false);
      setRoundOver(true);
    } else {
      // If not correct and not last attempt, clear message for next try
      setMessage('');
    }

    // Reset current input for the next attempt (if any)
    setCurrentMonthInput(Array(MONTH_LENGTH).fill(''));
    setCurrentYearInput(Array(YEAR_LENGTH).fill(''));

    // After a short delay, proceed to the next round or end the game
    if (isMonthCorrect && isYearCorrect || monthGuesses.length + 1 >= MAX_ATTEMPTS) {
      setTimeout(() => {
        if (currentRoundIndex + 1 < memoryGameData.length) {
          // If there are more rounds, move to the next one
          setCurrentRoundIndex(prev => prev + 1);
          setMonthGuesses([]);
          setYearGuesses([]);
          setCurrentMonthInput(Array(MONTH_LENGTH).fill(''));
          setCurrentYearInput(Array(YEAR_LENGTH).fill(''));
          setMessage('');
          setRoundOver(false);
          setRoundWon(false);
        } else {
          // If all rounds are completed, notify the parent component
          onGameComplete();
        }
      }, 2000); // Wait 2 seconds before moving on
    }
  };

  // Helper function to get the Tailwind CSS color class for a cell based on feedback
  const getCellColor = (feedback, index) => {
    switch (feedback[index]) {
      case "green": return "bg-[#528D4D]"; // Wordle-like green
      case "yellow": return "bg-[#B59F3A]"; // Wordle-like yellow
      case "gray": default: return "bg-[#3A3A3C]"; // Wordle-like gray
    }
  };

  // Renders a single row of input/display cells for either month or year
  const renderGuessRow = (type, rowIndex) => {
    const length = type === 'month' ? MONTH_LENGTH : YEAR_LENGTH;
    const inputRefs = type === 'month' ? monthInputRefs : yearInputRefs;
    const guesses = type === 'month' ? monthGuesses : yearGuesses;
    const currentInput = type === 'month' ? currentMonthInput : currentYearInput;

    let displayArray;
    let feedbackArray;
    let isCurrentRow = false;

    if (rowIndex < guesses.length) {
      // This row represents a past guess
      displayArray = guesses[rowIndex].guess.split('');
      feedbackArray = guesses[rowIndex].feedback;
    } else if (rowIndex === guesses.length && !roundOver) {
      // This is the current active input row
      displayArray = currentInput;
      feedbackArray = Array(length).fill('gray'); // Current input cells are initially gray
      isCurrentRow = true;
    } else {
      // This is a future empty row
      displayArray = Array(length).fill('');
      feedbackArray = Array(length).fill('gray');
    }

    return (
      <div className="flex gap-1 sm:gap-2"> {/* Responsive gap */}
        {Array.from({ length: length }).map((_, i) => (
          <input
            key={`${type}-${rowIndex}-${i}`} // Unique key for each input cell
            type={type === 'month' ? 'text' : 'tel'} // 'tel' type brings up numeric keyboard on mobile
            inputMode={type === 'month' ? 'text' : 'numeric'} // Hint for mobile keyboard
            pattern={type === 'month' ? '[A-Za-z]{1}' : '[0-9]{1}'} // Pattern for client-side validation
            maxLength={1} // Only one character per cell
            value={displayArray[i] || ''} // Display current value or empty string
            onKeyDown={(e) => isCurrentRow && handleBackspace(e, type, i)} // Handle backspace and Enter
            onChange={(e) => isCurrentRow && handleInputChange(e, type, i)} // Handle character input
            ref={el => {
              if (isCurrentRow) {
                inputRefs.current[i] = el; // Assign ref to current active input cells
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
    <div className="min-h-screen bg-bgDark flex items-center justify-center px-4 py-8">
      <div className="bg-[#333] rounded-xl p-6 w-full max-w-md text-center shadow-lg">
        <h1 className="text-white text-2xl font-bold mb-1">Wordle Memory Arisha</h1>
        <p className="text-sm text-gray-300 mb-4">
          guess the correct month and year
        </p>

        {/* Image Display Area */}
        <div className="relative w-full mb-4 rounded-lg overflow-hidden">
          <img
            src={currentData.imageUrl}
            alt="Memory Photo"
            width={826} // Explicit width for aspect ratio
            height={738} // Explicit height for aspect ratio
            className={`
              w-full h-auto max-w-full object-cover transition duration-500
              ${roundOver && roundWon ? "blur-0" : "blur-sm"} {/* Image blurs until correct guess */}
            `}
            // Fallback for image loading errors
            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/826x738/333333/FFFFFF?text=Image+Not+Found`; }}
          />
          {/* Overlay for lost round, revealing the correct answer */}
          {roundOver && !roundWon && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center text-white text-xl font-bold rounded-lg">
              <p>The image was {currentData.correctMonth} {currentData.correctYear}</p>
            </div>
          )}
        </div>

        {/* Guess Grids Labels */}
        <div className="flex w-full max-w-xs mx-auto mb-4 px-1 sm:px-0">
          <h2 className="text-white font-semibold text-base sm:text-lg flex-1 text-center">Month</h2>
          <h2 className="text-white font-semibold text-base sm:text-lg flex-1 text-center">Year</h2>
        </div>

        {/* Guess Grids (Month and Year) */}
        <div className="flex flex-col gap-2 items-center mb-4">
          {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIndex) => (
            <div key={`guess-row-pair-${rowIndex}`} className="flex gap-2 sm:gap-4">
              {renderGuessRow('month', rowIndex)}
              {renderGuessRow('year', rowIndex)}
            </div>
          ))}
        </div>

        {/* Submit Button and Chances Left */}
        {!roundOver && (
          <>
            <button
              onClick={handleSubmitGuess}
              className="bg-black text-white px-6 py-2 rounded-md font-semibold hover:bg-white hover:text-black transition text-sm sm:text-base"
              // Button is disabled until both month and year inputs are fully filled
              disabled={currentMonthInput.some(char => char === '') || currentYearInput.some(char => char === '')}
            >
              Submit Answer
            </button>
            <p className="text-xs sm:text-sm text-gray-300 mt-2">
              {MAX_ATTEMPTS - monthGuesses.length} chance{MAX_ATTEMPTS - monthGuesses.length !== 1 && "s"} left
            </p>
          </>
        )}

        {/* Round Over Message */}
        {roundOver && (
          <p className={`mt-4 text-base sm:text-lg font-semibold animate-pulse ${roundWon ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

// WordleMemoryPage component: This acts as the container for the WordleMemoryGame,
// managing the overall game completion (all rounds) and triggering navigation.
export default function WordleMemoryPage({ onGameComplete }) {
  const [allRoundsCompleted, setAllRoundsCompleted] = useState(false);

  const handleAllMemoryRoundsComplete = () => {
    setAllRoundsCompleted(true);
    // Call the parent's onGameComplete prop, which will handle the navigation
    onGameComplete();
  };

  return (
    <div className="min-h-screen bg-bgDark text-white font-inter flex flex-col items-center justify-center p-4">
      {allRoundsCompleted ? (
        // This content will briefly show before navigation
        <div className="text-center bg-[#333] rounded-xl p-6 w-full max-w-md shadow-lg">
          <h1 className="text-4xl font-bold mb-4 text-green-400">🎉 Memory Game Completed! 🎉</h1>
          <p className="text-xl text-gray-300">Proceeding to the next challenge...</p>
        </div>
      ) : (
        <WordleMemoryGame onGameComplete={handleAllMemoryRoundsComplete} />
      )}
    </div>
  );
}
