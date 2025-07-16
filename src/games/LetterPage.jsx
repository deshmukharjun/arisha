import React, { useEffect, useState } from "react";

// Import Google Fonts for handwriting style
const indieFlowerFontUrl = "https://fonts.googleapis.com/css2?family=Indie+Flower&display=swap";

const letterContent = `Majhi preeya Mau,\n\nHappy 10th anniversary! Can you even believe it's been a whole decade since that super silly "i I43 you" note in math class? Mala mahitiye its a bit redundant, but hey, you said yes, and that made it the best day of my life.\n\nThose first few years in school were just too cute, right? Then COVID hit, and things got tough, we were so far apart. But apan teva pan bhetlo, we made it through, and that's something I absolutely cherish about us.\n\nMala tu khup awadtes! Seriously, your passion for languages, especially French, is just... wow. When you speak French, tu khupach hot dises, Mau! And seeing you teach those little kids now, I can totally picture you as the most amazing, radiant, sunshine-like mom to our future kids. It's a thought that fills my heart with so much warmth.\n\nYou know, the way you treat me, the way you make me feel... it's just the best. I love the version of me that I am when I'm with you. We've literally grown up together, from being little dorks in school to figuring out life, side-by-side. Our connection, apan ekmekansathi banlo aahot feels so natural. Connections varun athavla kasa vatla tula game? I really cooked didnt I?\n\nWe have soo many inside jokes, so many memories, so much time spent together – all those dates, all the photos, all the memories, all the laughs. It's been an incredible journey, and you're my best friend, majhi soulmate. You are my EVERYTHING!\n\ni I43 you always!\n\nLoads of love,\nJunu`;

export default function LetterPage() {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(letterContent.slice(0, i + 1));
      i++;
      if (i >= letterContent.length) clearInterval(interval);
    }, 40); // Adjust speed as desired
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-yellow-50 flex flex-col items-center justify-center py-8 px-4 relative">
      {/* Indie Flower font import */}
      <style>{`@import url('${indieFlowerFontUrl}'); .indie-flower { font-family: 'Indie Flower', cursive; }`}</style>
      
      {/* Home Button */}
      <button
        onClick={() => { window.location.href = "/"; }}
        className="absolute top-6 left-6 bg-pink-300 text-pink-800 px-5 py-2.5 rounded-full font-medium shadow-sm hover:bg-pink-200 transition active:scale-95 z-20 text-base"
      >
        Home
      </button>

      <div className="bg-white/95 shadow-xl rounded-[2.5rem] p-8 sm:p-12 max-w-2xl w-full border-2 border-pink-100 relative">
        {/* Cute decorative element */}
        <span className="absolute -top-4 right-6 text-pink-400 text-4xl transform rotate-12">
            <img
                src="/vite.svg"
                alt="Welcome"
                className="w-[35px] h-[35px] object-cover rounded-lg animate-slide-in-up"
            />
        </span>
        
        <div className="indie-flower text-lg sm:text-xl text-gray-700 whitespace-pre-line leading-relaxed tracking-wide" style={{ minHeight: 400, transition: 'color 0.3s' }}>
          {displayedText}
        </div>
        
        <div className="mt-8 text-right indie-flower text-2xl bg-transparent text-pink-500 flex items-center justify-end">
            <img
                src="/vite.svg"
                alt="Welcome"
                className="w-[35px] h-[35px] object-cover rounded-lg animate-slide-in-up"
            />
        </div>
      </div>
    </div>
  );
}