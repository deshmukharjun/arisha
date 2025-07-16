// App.jsx
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import WordleMemoryPage from "./games/WordleMemory"; // Correct way to import a default export
import ConnectionsPage from "./games/ConnectionsGame";
import welcomeImage from "/photos/welcomefinal.png";
import Confetti from 'react-confetti';
import { useEffect, useState } from "react"; // Ensure useState is imported if used in App
import MemoryLane from "./games/MemoryLane";
import LetterPage from "./games/LetterPage";

function WelcomePage() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  // Get window dimensions for confetti
  const { innerWidth: width, innerHeight: height } = window;

  const handleCelebrateClick = () => {
    setShowModal(true);
  };

  const handleChoice = (route) => {
    setShowModal(false);
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-bgDark text-white flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Confetti will appear in the background */}
      <Confetti
        width={width}
        height={height}
        numberOfPieces={120} // Slightly reduced for mobile performance
        gravity={0.07}
        confettiSource={{
            x: 0,
            y: 0,
            w: width,
            h: height,
        }}
        wind={0.01}
        initialVelocityX={4}
        initialVelocityY={8}
      />
      <div className="text-center max-w-md z-10 p-6 rounded-lg bg-bgDark bg-opacity-80 shadow-lg animate-fade-in">
        <img
          src={welcomeImage}
          alt="Welcome"
          className="w-full h-full object-cover rounded-lg mb-6 shadow-md animate-slide-in-down"
        />
        <div className="flex items-center justify-center mb-2 animate-fade-in-delay">
          <h1 className="text-3xl font-bold mb-0 mr-2 animate-slide-in-up">Hey Mau</h1>
          <img
            src="/vite.svg"
            alt="Welcome"
            className="w-[35px] h-[35px] object-cover rounded-lg shadow-md animate-slide-in-up"
          />
        </div>
        <p className="text-lg text-gray-300 mb-8 animate-fade-in-delay">
          Happy 10 Year Anniversary!
        </p>
        <button
          onClick={handleCelebrateClick}
          className="bg-highlight text-black px-6 py-3 rounded-md font-semibold hover:bg-white hover:text-black transition active:scale-95 w-full sm:w-auto text-lg sm:text-base"
        >
          Let's Celebrate!
        </button>
      </div>
      {/* Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white text-black rounded-lg shadow-xl p-8 max-w-xs w-full text-center animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">What do you want to play?</h2>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleChoice('/memory')}
                className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-2 px-4 rounded transition active:scale-95"
              >
                Wordle Memory
              </button>
              <button
                onClick={() => handleChoice('/connections')}
                className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded transition active:scale-95"
              >
                Connections
              </button>
              <button
                onClick={() => {
                  sessionStorage.setItem('playMemoryLaneMusic', 'true');
                  handleChoice('/memory-lane');
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition active:scale-95"
              >
                Memory Lane
              </button>
              <button
                onClick={() => handleChoice('/letter')}
                className="bg-pink-400 hover:bg-pink-500 text-white font-semibold py-2 px-4 rounded transition active:scale-95"
              >
                Letter
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="mt-2 text-gray-500 hover:text-black text-sm underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function App() {
  // Remove useNavigate from here
  // Handlers for navigation are now passed as props from within routed components
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route
        path="/memory"
        element={
          <WordleMemoryPage
            onGameComplete={() => {}}
            onPlayConnections={() => { window.location.href = '/connections'; }}
          />
        }
      />
      <Route path="/connections" element={<ConnectionsPage />} />
      <Route path="/memory-lane" element={<MemoryLane />} />
      <Route path="/letter" element={<LetterPage />} />
    </Routes>
  );
}

const IMAGES_TO_PRELOAD = [
  "/photos/welcomefinal.png", // or change to your latest welcome image
  "/photos/memory1.png",
  "/photos/memory2.png",
  "/photos/memory3.png",
  "/photos/2015.png",
  "/photos/2016.png",
  "/photos/2017.png",
  "/photos/2018.png",
  "/photos/2019.png",
  "/photos/2020.png",
  "/photos/2021.png",
  "/photos/2022.png",
  "/photos/2023.png",
  "/photos/2024.png",
  "/photos/2025.png",
  "/vite.svg"
];

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bgDark">
      <div className="flex flex-col items-center">
        <div className="loader mb-4" />
        <span className="text-white text-lg font-semibold">Loading...</span>
      </div>
    </div>
  );
}

export default function AppWithRouter() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let loaded = 0;
    IMAGES_TO_PRELOAD.forEach((src) => {
      const img = new window.Image();
      img.src = src;
      img.onload = img.onerror = () => {
        loaded++;
        if (loaded === IMAGES_TO_PRELOAD.length) {
          setLoading(false);
        }
      };
    });
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <Router>
      <App />
    </Router>
  );
}