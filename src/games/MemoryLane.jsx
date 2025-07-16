import React, { useEffect, useRef } from "react";

// Add Indie Flower font import
const indieFlowerFontUrl = "https://fonts.googleapis.com/css2?family=Indie+Flower&display=swap";

const memories = [
  { year: 2015, message: "i I43 you" },
  { year: 2016, message: "Our first picture together" },
  { year: 2017, message: "khs annual gathering" },
  { year: 2018, message: "sara's birthday" },
  { year: 2019, message: "can't stop looking at you" },
  { year: 2020, message: "the lockdown days" },
  { year: 2021, message: "the first meetup" },
  { year: 2022, message: "the smile that will be the end of me" },
  { year: 2023, message: "hey there bunny!" },
  { year: 2024, message: "ganapati bappa morya" },
  { year: 2025, message: "i still I43 you" },
];

function getRotation(index) {
  const rotations = ["-rotate-3", "rotate-2", "-rotate-2", "rotate-1", "-rotate-1", "rotate-3", "rotate-6", "-rotate-6", "rotate-12", "-rotate-12", "rotate-0"];
  return rotations[index % rotations.length];
}

export default function MemoryLane() {
  const audioRef = useRef(null);

  useEffect(() => {
    console.log("MemoryLane mounted");
    const shouldPlay = sessionStorage.getItem('playMemoryLaneMusic') === 'true';
    if (shouldPlay) {
      sessionStorage.removeItem('playMemoryLaneMusic');
      const audio = audioRef.current;
      if (audio) {
        console.log("Audio element found, attempting to play after user interaction...");
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Audio playback started successfully");
            })
            .catch((error) => {
              console.log("Audio playback failed:", error);
            });
        }
        audio.addEventListener('play', () => console.log('Audio play event triggered'));
        audio.addEventListener('error', (e) => console.log('Audio error event:', e));
      } else {
        console.log("Audio element not found");
      }
    } else {
      console.log("Not starting music: no user interaction flag");
    }
  }, []);

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center py-8 px-4 relative">
      {/* Home Button */}
      <button
        onClick={() => { window.location.href = "/"; }}
        className="absolute top-4 left-4 bg-yellow-400 text-black px-4 py-2 rounded-md font-semibold shadow-md hover:bg-yellow-300 transition active:scale-95 z-20 text-base sm:text-base"
      >
        Home
      </button>
      {/* Indie Flower font import */}
      <style>{`@import url('${indieFlowerFontUrl}'); .indie-flower { font-family: 'Indie Flower', cursive; }`}</style>
      <h1 className="text-3xl font-bold mb-8 text-yellow-400">Memory Lane</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 w-full max-w-5xl justify-items-center">
        {memories.map(({ year, message }, idx) => (
          <div
            key={year}
            className={`bg-white font-bold shadow-xl rounded-lg flex flex-col items-center pb-4 pt-2 px-2 relative ${getRotation(idx)} transition-transform duration-300 mx-auto`}
            style={{ minWidth: 250, maxWidth: 320 }}
          >
            {/* Year at the top, Indie Flower font */}
            <span className="absolute top-3 left-1/2 -translate-x-1/2 text-xl font-bold text-gray-700 indie-flower select-none pointer-events-none">
              {year}
            </span>
            {/* Photo */}
            <img
              src={`/photos/${year}.png`}
              alt={`Memory from ${year}`}
              className="w-full h-64 object-cover rounded-md mt-8 mb-2 border-2 border-gray-200 shadow-md"
              onError={e => { e.target.style.display = 'none'; }}
            />
            {/* Message at the bottom, Indie Flower font */}
            <div className="w-full bg-white rounded-b-lg px-2 pt-2 pb-1 mt-2 border-t border-gray-200">
              <p className="text-center text-base text-gray-800 indie-flower">{message}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Audio Player for 'Perfect' by Ed Sheeran (hidden, autoplay, loop) */}
      <audio ref={audioRef} src="/perfect.mp3" autoPlay loop style={{ display: 'none' }} />
    </div>
  );
} 