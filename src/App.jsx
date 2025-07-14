import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import WordleMemory from "./games/WordleMemory";
import ConnectionsPage from "./games/ConnectionsGame";
import welcomeImage from "../public/photos/welcome.jpg"; // Replace with your actual image path
import Confetti from 'react-confetti'; // Import Confetti

function WelcomePage() {
  const navigate = useNavigate();

  // Get window dimensions for confetti
  const { innerWidth: width, innerHeight: height } = window;

  return (
    <div className="min-h-screen bg-bgDark text-white flex items-center justify-center px-4 py-8 relative overflow-hidden"> {/* Added relative and overflow-hidden */}
      {/* Confetti will appear in the background */}
      <Confetti
        width={width}
        height={height}
        numberOfPieces={200} // Adjust the number of confetti pieces
        gravity={0.08} // Adjust the fall speed (lower value means slower)
        confettiSource={{ // Adjust where confetti starts
            x: 0,
            y: 0,
            w: width,
            h: height,
        }}
        wind={0.01} // Add a slight wind effect
        initialVelocityX={5} // Initial horizontal velocity
        initialVelocityY={10} // Initial vertical velocity
      />

      {/* Your existing welcome page content */}
      <div className="text-center max-w-md z-10 p-6 rounded-lg bg-bgDark bg-opacity-80 shadow-lg">
        <img
          src={welcomeImage}
          alt="Welcome"
          className="w-full h-full object-cover rounded-lg mb-6 shadow-md"
        />
        {/* Updated alignment for Hey Mauuu and Vite SVG */}
        <div className="flex items-center justify-center mb-2"> {/* Added items-center and justify-center */}
          <h1 className="text-3xl font-bold mb-0 mr-2">Hey Mau</h1> {/* Removed mb-2, added mr-2 for spacing */}
          <img
            src="/vite.svg"
            alt="Welcome"
            className="w-[35px] h-[35px] object-cover rounded-lg shadow-md" // Removed mb-6
          />
        </div>

        <p className="text-lg text-gray-300 mb-8">
          Happy 10 Year Anniversary!
        </p>
        <button
          onClick={() => navigate("/memory")}
          className="bg-highlight text-black px-6 py-3 rounded-md font-semibold hover:bg-white hover:text-black transition"
        >
          Let's Celebrate!
        </button>
      </div>
    </div>
  );
}


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/memory" element={<WordleMemory onGameComplete={() => window.location.href = '/connections'} />} />
        <Route path="/connections" element={<ConnectionsPage />} />
      </Routes>
    </Router>
  );
}

export default App;