import { useState } from "react";
import WordleMemory from "./games/WordleMemory";

function App() {
  const [stage, setStage] = useState("memory");

  return (
    <div className="min-h-screen bg-bgDark text-white">
      {stage === "memory" && (
        <WordleMemory onGameComplete={() => setStage("connections")} />
      )}
      {stage === "connections" && (
        <div className="flex items-center justify-center min-h-screen">
          <p>Next Game: Connections Coming Soon!</p>
        </div>
      )}
    </div>
  );
}

export default App;
