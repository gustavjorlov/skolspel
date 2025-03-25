import { useState, useEffect, useCallback } from "react";
import "./GeometryGame.css";
import shapeData from "../data/geometric-shapes.json";

type Shape = {
  name: string;
  svg: string;
  viewBox: string;
  options: string[];
};

type GameMode = "time" | "streak";

type HighScore = {
  name: string;
  score: number;
  date: string;
};

const ROUND_DURATION = 60; // seconds
const HIGH_SCORES_KEY = {
  time: "geometryHighScores",
  streak: "geometryStreakHighScores",
};
const MAX_HIGH_SCORES = 5;

// Shuffle function to randomize array order
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function GeometryGame() {
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"correct" | "incorrect" | "">(
    ""
  );
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [roundScore, setRoundScore] = useState(0);
  const [showNameInput, setShowNameInput] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [gameMode, setGameMode] = useState<GameMode>("time");
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [streakHighScores, setStreakHighScores] = useState<HighScore[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  useEffect(() => {
    const savedTimeScores = localStorage.getItem(HIGH_SCORES_KEY.time);
    const savedStreakScores = localStorage.getItem(HIGH_SCORES_KEY.streak);

    if (savedTimeScores) {
      setHighScores(JSON.parse(savedTimeScores));
    }
    if (savedStreakScores) {
      setStreakHighScores(JSON.parse(savedStreakScores));
    }
  }, []);

  const getRandomShape = useCallback(function (): Shape {
    const shapes = shapeData.shapes;
    const randomIndex = Math.floor(Math.random() * shapes.length);
    return shapes[randomIndex];
  }, []);

  const saveHighScore = (name: string, score: number) => {
    const trimmedName = name.trim();
    const currentScores = gameMode === "time" ? highScores : streakHighScores;
    const setScores = gameMode === "time" ? setHighScores : setStreakHighScores;
    const storageKey = HIGH_SCORES_KEY[gameMode];

    const existingScoreIndex = currentScores.findIndex(
      (s) => s.name === trimmedName
    );
    let newHighScores: HighScore[];

    if (existingScoreIndex !== -1) {
      if (score > currentScores[existingScoreIndex].score) {
        newHighScores = currentScores.map((s, index) =>
          index === existingScoreIndex
            ? { ...s, score, date: new Date().toLocaleDateString("sv-SE") }
            : s
        );
      } else {
        setShowNameInput(false);
        return;
      }
    } else {
      newHighScores = [
        ...currentScores,
        {
          name: trimmedName,
          score,
          date: new Date().toLocaleDateString("sv-SE"),
        },
      ];
    }

    newHighScores = newHighScores
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_HIGH_SCORES);

    setScores(newHighScores);
    localStorage.setItem(storageKey, JSON.stringify(newHighScores));
    setShowNameInput(false);
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      const finalScore = gameMode === "time" ? roundScore : currentStreak;
      saveHighScore(playerName.trim(), finalScore);
      setPlayerName("");
    }
  };

  const handleExistingNameSelect = (name: string) => {
    setPlayerName(name);
  };

  const startNewGame = () => {
    if (gameMode === "time") {
      setTimeLeft(ROUND_DURATION);
      setRoundScore(0);
    } else {
      setCurrentStreak(0);
    }
    setScore(0);
    setMessage("");
    setMessageType("");
    setCurrentShape(getRandomShape());
    setIsPlaying(true);
    setShowNameInput(false);
  };

  const newRound = useCallback(() => {
    const shape = getRandomShape();
    setCurrentShape(shape);
    setShuffledOptions(shuffleArray(shape.options));
    setMessage("");
    setMessageType("");
  }, [getRandomShape]);

  useEffect(() => {
    if (gameMode === "time" && isPlaying && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            setMessage(
              `Spelet är slut! Du klarade ${roundScore} former på ${ROUND_DURATION} sekunder!`
            );
            setShowNameInput(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isPlaying, timeLeft, roundScore, gameMode]);

  useEffect(() => {
    setCurrentShape(getRandomShape());
  }, [getRandomShape]);

  useEffect(() => {
    if (!isPlaying) return;
    newRound();
  }, [isPlaying, newRound]);

  const handleGuess = (option: string) => {
    if (!currentShape || !isPlaying) return;

    const correctAnswer = currentShape.options[0];
    if (option === correctAnswer) {
      setMessage("Rätt!");
      setMessageType("correct");
      setScore(score + 1);

      if (gameMode === "time") {
        setRoundScore(roundScore + 1);
      } else {
        const newStreak = currentStreak + 1;
        setCurrentStreak(newStreak);
        if (newStreak > bestStreak) {
          setBestStreak(newStreak);
        }
      }

      setTimeout(() => {
        setMessageType("");
        newRound();
      }, 1000);
    } else {
      setMessage(`Fel! Det var en ${correctAnswer}`);
      setMessageType("incorrect");

      if (gameMode === "streak") {
        setIsPlaying(false);
        setMessage(`Spelet är slut! Du klarade ${currentStreak} former i rad!`);
        setShowNameInput(true);
      }
    }
  };

  if (!isPlaying) {
    return (
      <div className="geometry-game">
        <h1>Gissa formen!</h1>
        <div className="game-mode-selector">
          <button
            onClick={() => setGameMode("time")}
            className={gameMode === "time" ? "selected" : ""}
          >
            {ROUND_DURATION} sekunder
          </button>
          <button
            onClick={() => setGameMode("streak")}
            className={gameMode === "streak" ? "selected" : ""}
          >
            Så många som möjligt i rad
          </button>
        </div>
        <div className={`message ${messageType}`}>{message}</div>
        {showNameInput ? (
          <form onSubmit={handleNameSubmit} className="name-input-form">
            <div className="name-input-container">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Skriv ditt namn"
                maxLength={20}
                required
              />
              {(gameMode === "time" ? highScores : streakHighScores).length >
                0 && (
                <div className="existing-names">
                  <p>Eller välj ditt namn:</p>
                  <div className="name-buttons">
                    {(gameMode === "time" ? highScores : streakHighScores).map(
                      (score, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleExistingNameSelect(score.name)}
                          className={
                            playerName === score.name ? "selected" : ""
                          }
                        >
                          {score.name}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
            <button type="submit">Spara poäng</button>
          </form>
        ) : (
          <button onClick={startNewGame} className="start-button">
            {score === 0 ? "Starta spelet" : "Spela igen"}
          </button>
        )}
        {(gameMode === "time" ? highScores : streakHighScores).length > 0 && (
          <div className="high-scores">
            <h2>
              Topplista -{" "}
              {gameMode === "time" ? ROUND_DURATION + " sekunder" : "Svit"}
            </h2>
            <ul>
              {(gameMode === "time" ? highScores : streakHighScores).map(
                (score, index) => (
                  <li key={index}>
                    {score.name}: {score.score}{" "}
                    {gameMode === "time" ? "former" : "i rad"} ({score.date})
                  </li>
                )
              )}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (!currentShape) return <div>Laddar...</div>;

  return (
    <div className="geometry-game">
      <h1>Gissa formen!</h1>
      <div className="game-stats">
        {gameMode === "time" ? (
          <>
            <div className="time-left">Tid kvar: {timeLeft}s</div>
            <div className="score">Former denna runda: {roundScore}</div>
          </>
        ) : (
          <div className="score">Nuvarande svit: {currentStreak}</div>
        )}
      </div>
      <div className="shape-display">
        <svg
          viewBox={currentShape.viewBox}
          width="200"
          height="200"
          style={{ fill: "none", stroke: "currentColor", strokeWidth: "4" }}
        >
          <path d={currentShape.svg} />
        </svg>
      </div>
      <div className="options-container">
        {shuffledOptions.map((option, index) => (
          <button
            key={index}
            onClick={() => handleGuess(option)}
            className="option-button"
          >
            {option}
          </button>
        ))}
      </div>
      <div className={`message ${messageType}`}>{message}</div>
    </div>
  );
}