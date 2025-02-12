import { useState, useEffect, useCallback } from "react";
import "./TimeGame.css";
import timeData from "../data/time-phrases.json";

type Time = {
  phrase: string;
  time: string;
};

type GameMode = "time" | "streak";

type HighScore = {
  name: string;
  score: number;
  date: string;
};

const ROUND_DURATION = 60; // seconds
const HIGH_SCORES_KEY = {
  time: "timeHighScores",
  streak: "timeStreakHighScores",
};
const MAX_HIGH_SCORES = 5;

export function TimeGame() {
  const [currentTime, setCurrentTime] = useState<Time | null>(null);
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
    const savedTimeScores = localStorage.getItem(HIGH_SCORES_KEY.time);
    const savedStreakScores = localStorage.getItem(HIGH_SCORES_KEY.streak);

    if (savedTimeScores) {
      setHighScores(JSON.parse(savedTimeScores));
    }
    if (savedStreakScores) {
      setStreakHighScores(JSON.parse(savedStreakScores));
    }
  }, []);

  const getRandomTime = useCallback(function (): Time {
    const times = timeData.times;
    const randomIndex = Math.floor(Math.random() * times.length);
    return times[randomIndex];
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
    setUserInput("");
    setCurrentTime(getRandomTime());
    setIsPlaying(true);
    setShowNameInput(false);
  };

  const newRound = useCallback(() => {
    setCurrentTime(getRandomTime());
    setMessage("");
    setMessageType("");
    setUserInput("");
  }, [getRandomTime]);

  useEffect(() => {
    if (gameMode === "time" && isPlaying && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            setMessage(
              `Spelet är slut! Du klarade ${roundScore} tider på ${ROUND_DURATION} sekunder!`
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
    setCurrentTime(getRandomTime());
  }, [getRandomTime]);

  useEffect(() => {
    if (!isPlaying) return;
    newRound();
  }, [isPlaying, newRound]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTime || !isPlaying) return;

    const guess = userInput.trim().replace(':', '');
    const targetTime = currentTime.time.replace(':', '');
    if (guess === targetTime) {
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
        // Refocus the hidden input after the new round
        const hiddenInput = document.querySelector('.hidden-input') as HTMLInputElement;
        if (hiddenInput) {
          hiddenInput.focus();
        }
      }, 1000);
    } else {
      setMessage(`Fel! Tiden var "${currentTime.time}"`);
      setMessageType("incorrect");

      if (gameMode === "streak") {
        setIsPlaying(false);
        setMessage(`Spelet är slut! Du klarade ${currentStreak} tider i rad!`);
        setShowNameInput(true);
      } else {
        // Refocus the hidden input after incorrect answer in time mode
        const hiddenInput = document.querySelector('.hidden-input') as HTMLInputElement;
        if (hiddenInput) {
          hiddenInput.focus();
        }
      }
    }
  };

  if (!isPlaying) {
    return (
      <div className="time-game">
        <h1>Klockan!</h1>
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
                    {gameMode === "time" ? "tider" : "i rad"} ({score.date})
                  </li>
                )
              )}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (!currentTime) return <div>Laddar...</div>;

  return (
    <div className="time-game">
      <h1>Klockan!</h1>
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
      <div className="time-container">
        <div className="time-phrase">{currentTime.phrase}</div>
        <form onSubmit={handleSubmit}>
          <div 
            className="time-input-boxes"
            onClick={(e) => {
              const hiddenInput = e.currentTarget.querySelector('.hidden-input') as HTMLInputElement;
              if (hiddenInput) {
                hiddenInput.focus();
              }
            }}
          >
            <div className="digit-boxes">
              {[...Array(2)].map((_, index) => (
                <div
                  key={`hour-${index}`}
                  className="digit-box"
                >
                  {userInput.split(':')[0]?.[index] || ''}
                </div>
              ))}
            </div>
            <span className="colon">:</span>
            <div className="digit-boxes">
              {[...Array(2)].map((_, index) => (
                <div
                  key={`minute-${index}`}
                  className="digit-box"
                >
                  {userInput.substring(2, 4)?.[index] || ''}
                </div>
              ))}
            </div>
            <input
              type="text"
              className="hidden-input"
              value={userInput}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                if (value.length <= 4) {
                  if (value.length >= 2) {
                    // Format as HH:MM
                    const hours = value.slice(0, 2);
                    const minutes = value.slice(2);
                    setUserInput(`${hours}${minutes}`);
                  } else {
                    setUserInput(value);
                  }
                }
              }}
              placeholder="HH:MM"
              pattern="[0-9]{2}[0-9]{2}"
              title="Ange tiden i formatet HH:MM"
              autoFocus
            />
          </div>
          <button type="submit">Svara</button>
        </form>
        <div className={`message ${messageType}`}>{message}</div>
      </div>
    </div>
  );
}
