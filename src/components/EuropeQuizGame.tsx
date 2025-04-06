import { useState, useEffect, useCallback, useMemo } from "react";
import { feature } from "topojson-client";
import worldAtlas from "world-atlas/countries-50m.json";
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import { BaseMap } from "./shared/BaseMap";
import { filterEuropeanCountries, getRandomOptions } from "../utils/geographyUtils";
import "./MapGame.css";

type GameMode = "time" | "streak";

type HighScore = {
  name: string;
  score: number;
  date: string;
};

type CountryOption = {
  en: string;
  sv: string;
};

const ROUND_DURATION = 60; // seconds
const HIGH_SCORES_KEY = {
  time: "europeHighScores",
  streak: "europeStreakHighScores",
};
const MAX_HIGH_SCORES = 5;

export function EuropeQuizGame() {
  const [targetCountry, setTargetCountry] = useState<string | null>(null);
  const [options, setOptions] = useState<CountryOption[]>([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"correct" | "incorrect" | "">("");
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

  // Load high scores from localStorage
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

  // Convert TopoJSON to GeoJSON and filter for European countries
  const worldData = useMemo(() => {
    const data = feature(
      worldAtlas as any,
      (worldAtlas as any).objects.countries
    ) as unknown as FeatureCollection<Geometry, GeoJsonProperties>;
    return filterEuropeanCountries(data);
  }, []);

  // Extract European country names
  const europeanCountries = useMemo(() => 
    worldData.features
      .map(feature => feature.properties?.name)
      .filter((name): name is string => !!name),
    [worldData]
  );

  const getRandomCountry = useCallback(() => {
    if (europeanCountries.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * europeanCountries.length);
    return europeanCountries[randomIndex];
  }, [europeanCountries]);

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
    const newTarget = getRandomCountry();
    setTargetCountry(newTarget);
    if (newTarget) {
      setOptions(getRandomOptions(newTarget, europeanCountries));
    }
    setIsPlaying(true);
    setShowNameInput(false);
  };

  const newRound = useCallback(() => {
    const newTarget = getRandomCountry();
    setTargetCountry(newTarget);
    if (newTarget) {
      setOptions(getRandomOptions(newTarget, europeanCountries));
    }
    setMessage("");
    setMessageType("");
  }, [getRandomCountry, europeanCountries]);

  useEffect(() => {
    if (!isPlaying) return;
    newRound();
  }, [isPlaying, newRound]);

  useEffect(() => {
    if (gameMode === "time" && isPlaying && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            setMessage(
              `Spelet är slut! Du klarade ${roundScore} länder på ${ROUND_DURATION} sekunder!`
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

  const handleCountrySelect = (selectedCountry: CountryOption) => {
    if (!targetCountry || !isPlaying) return;

    if (selectedCountry.en === targetCountry) {
      setMessage("Rätt");
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
      setMessage("Fel");
      setMessageType("incorrect");

      if (gameMode === "streak") {
        setIsPlaying(false);
        setMessage(`Spelet är slut! Du klarade ${currentStreak} länder i rad!`);
        setShowNameInput(true);
      }
    }
  };

  if (!isPlaying) {
    return (
      <div className="map-game">
        <h1>Europas länder!</h1>
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
              {(gameMode === "time" ? highScores : streakHighScores).length > 0 && (
                <div className="existing-names">
                  <p>Eller välj ditt namn:</p>
                  <div className="name-buttons">
                    {(gameMode === "time" ? highScores : streakHighScores).map(
                      (score, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleExistingNameSelect(score.name)}
                          className={playerName === score.name ? "selected" : ""}
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
                    {gameMode === "time" ? "länder" : "i rad"} ({score.date})
                  </li>
                )
              )}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="map-game">
      <h1>Europas länder!</h1>
      <div className="game-stats">
        {gameMode === "time" ? (
          <>
            <div className="time-left">Tid kvar: {timeLeft}s</div>
            <div className="score">Länder denna runda: {roundScore}</div>
          </>
        ) : (
          <div className="score">Nuvarande svit: {currentStreak}</div>
        )}
      </div>
      {targetCountry && (
        <div className="options-container">
          {options.map((country, index) => (
            <button
              key={index}
              onClick={() => handleCountrySelect(country)}
              className="country-option"
            >
              {country.sv}
            </button>
          ))}
        </div>
      )}
      <BaseMap
        worldData={worldData}
        center={[15, 55]}
        zoom={6.5}
        highlightedCountry={targetCountry || undefined}
        onCountryClick={() => {}} // Remove click handling
      />
      <div className={`message ${messageType}`}>{message}</div>
    </div>
  );
}