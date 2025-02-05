import { useState, useEffect, useCallback } from "react";
import "./EnglishGame.css";
import { SvgIconComponent } from "@mui/icons-material";
import * as MuiIcons from "@mui/icons-material";
import wordData from "../data/english-words.json";

type Word = {
  word: string;
  icon: string;
};

type GameMode = "time" | "streak";

type HighScore = {
  name: string;
  score: number;
  date: string;
};

const ROUND_DURATION = 60; // seconds
const HIGH_SCORES_KEY = {
  time: "englishHighScores",
  streak: "englishStreakHighScores",
};
const MAX_HIGH_SCORES = 5;

export function EnglishGame() {
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [userInput, setUserInput] = useState("");
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
    // Load high scores from localStorage when component mounts
    const savedTimeScores = localStorage.getItem(HIGH_SCORES_KEY.time);
    const savedStreakScores = localStorage.getItem(HIGH_SCORES_KEY.streak);

    if (savedTimeScores) {
      setHighScores(JSON.parse(savedTimeScores));
    }
    if (savedStreakScores) {
      setStreakHighScores(JSON.parse(savedStreakScores));
    }
  }, []);

  const getRandomWord = useCallback(function (): Word {
    const words = wordData.words;
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
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
      // Update existing score if new score is higher
      if (score > currentScores[existingScoreIndex].score) {
        newHighScores = currentScores.map((s, index) =>
          index === existingScoreIndex
            ? { ...s, score, date: new Date().toLocaleDateString("sv-SE") }
            : s
        );
      } else {
        setShowNameInput(false);
        return; // Don't update if new score is not higher
      }
    } else {
      // Add new score
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
    setUserInput("");
    setCurrentWord(getRandomWord());
    setIsPlaying(true);
    setShowNameInput(false);
  };

  const newRound = useCallback(() => {
    setCurrentWord(getRandomWord());
    setMessage("");
    setMessageType("");
    setUserInput("");
  }, [getRandomWord]);

  useEffect(() => {
    if (gameMode === "time" && isPlaying && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            setMessage(
              `Spelet är slut! Du klarade ${roundScore} ord på ${ROUND_DURATION} sekunder!`
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
    // Initialize with a word but don't start playing
    setCurrentWord(getRandomWord());
  }, [getRandomWord]);

  useEffect(() => {
    if (!isPlaying) return;
    newRound();
  }, [isPlaying, newRound]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWord || !isPlaying) return;

    const guess = userInput.toLowerCase().trim();
    if (guess === currentWord.word) {
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
      setMessage(`Fel! Ordet var "${currentWord.word}"`);
      setMessageType("incorrect");

      if (gameMode === "streak") {
        setIsPlaying(false);
        setMessage(`Spelet är slut! Du klarade ${currentStreak} ord i rad!`);
        setShowNameInput(true);
      }
    }
  };

  if (!isPlaying) {
    return (
      <div className="english-game">
        <h1>Engelska ordspelet!</h1>
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
                    {gameMode === "time" ? "ord" : "i rad"} ({score.date})
                  </li>
                )
              )}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (!currentWord) return <div>Laddar...</div>;

  // Dynamically get the icon component
  const IconComponent: SvgIconComponent = MuiIcons[
    (currentWord.icon + "TwoTone") as keyof typeof MuiIcons
  ] as SvgIconComponent;

  return (
    <div className="english-game">
      <h1>Engelska ordspelet!</h1>
      <div className="game-stats">
        {gameMode === "time" ? (
          <>
            <div className="time-left">Tid kvar: {timeLeft}s</div>
            <div className="score">Poäng: {roundScore}</div>
          </>
        ) : (
          <div className="score">Poäng: {currentStreak}</div>
        )}
      </div>
      <div
        className="word-container"
        onClick={(e) => {
          // Find and focus the hidden input
          const hiddenInput = e.currentTarget.querySelector(
            ".hidden-input"
          ) as HTMLInputElement;
          if (hiddenInput) {
            hiddenInput.focus();
          }
        }}
      >
        <div className="icon-display">
          {IconComponent && <IconComponent style={{ fontSize: 100 }} />}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="letter-boxes">
            {currentWord.word.split("").map((_, index) => (
              <input
                key={index}
                className="letter-box"
                type="text"
                maxLength={1}
                value={userInput[index] || ""}
                readOnly
              />
            ))}
          </div>
          <input
            type="text"
            className="hidden-input"
            value={userInput}
            onChange={(e) => {
              const value = e.target.value.toLowerCase();
              if (value.length <= currentWord.word.length) {
                setUserInput(value);
              }
            }}
            autoFocus
          />
          <button type="submit">Svara</button>
        </form>
        <div className={`message ${messageType}`}>{message}</div>
      </div>
    </div>
  );
}
