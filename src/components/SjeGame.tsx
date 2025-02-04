import { useState, useEffect, useCallback } from 'react';
import wordData from '../data/sje-words.json';

type Word = {
  word: string;
  parts: [string, string];
};

type GameMode = 'time' | 'streak';

type HighScore = {
  name: string;
  score: number;
  date: string;
};

const ROUND_DURATION = 30; // seconds
const HIGH_SCORES_KEY = {
  time: 'sjeHighScores',
  streak: 'sjeStreakHighScores'
};
const prefixes = ['sj', 'stj', 'tj', 'k', 'kj', 'skj', 'sh'];
const MAX_HIGH_SCORES = 5;

export function SjeGame() {
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'correct' | 'incorrect' | ''>('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [roundScore, setRoundScore] = useState(0);
  const [showNameInput, setShowNameInput] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [gameMode, setGameMode] = useState<GameMode>('time');
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

  const getRandomWord = useCallback(function(): Word {
    const words = wordData.words;
    const randomIndex = Math.floor(Math.random() * words.length);
    const selectedWord = words[randomIndex];
    return {
      word: selectedWord.word,
      parts: [selectedWord.parts[0], selectedWord.parts[1]]
    };
  }, []);

  const saveHighScore = (name: string, score: number) => {
    const trimmedName = name.trim();
    const currentScores = gameMode === 'time' ? highScores : streakHighScores;
    const setScores = gameMode === 'time' ? setHighScores : setStreakHighScores;
    const storageKey = HIGH_SCORES_KEY[gameMode];
    
    const existingScoreIndex = currentScores.findIndex(s => s.name === trimmedName);
    let newHighScores: HighScore[];

    if (existingScoreIndex !== -1) {
      // Update existing score if new score is higher
      if (score > currentScores[existingScoreIndex].score) {
        newHighScores = currentScores.map((s, index) => 
          index === existingScoreIndex 
            ? { ...s, score, date: new Date().toLocaleDateString('sv-SE') }
            : s
        );
      } else {
        setShowNameInput(false);
        return; // Don't update if new score is not higher
      }
    } else {
      // Add new score
      newHighScores = [...currentScores, {
        name: trimmedName,
        score,
        date: new Date().toLocaleDateString('sv-SE')
      }];
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
      saveHighScore(playerName.trim(), roundScore);
      setPlayerName('');
    }
  };

  const handleExistingNameSelect = (name: string) => {
    setPlayerName(name);
  };

  const startNewGame = () => {
    if (gameMode === 'time') {
      setTimeLeft(ROUND_DURATION);
      setRoundScore(0);
    } else {
      setCurrentStreak(0);
    }
    setScore(0);
    setMessage('');
    setMessageType('');
    setCurrentWord(getRandomWord());
    setIsPlaying(true);
    setShowNameInput(false);
  };

  const newRound = useCallback(() => {
    setCurrentWord(getRandomWord());
    setMessage('');
    setMessageType('');
  }, [getRandomWord]);

  useEffect(() => {
    if (gameMode === 'time' && isPlaying && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            setMessage(`Spelet är slut! Du klarade ${roundScore} ord på ${ROUND_DURATION} sekunder!`);
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

  const handleGuess = (prefix: string) => {
    if (!currentWord || !isPlaying) return;

    if (prefix === currentWord.parts[0]) {
      setMessage(`Rätt! "${prefix + currentWord.parts[1]}" stavas med "${prefix}"`);
      setMessageType('correct');
      setScore(score + 1);
      
      if (gameMode === 'time') {
        setRoundScore(roundScore + 1);
      } else {
        const newStreak = currentStreak + 1;
        setCurrentStreak(newStreak);
        if (newStreak > bestStreak) {
          setBestStreak(newStreak);
        }
      }
      
      setTimeout(() => {
        setMessageType('');
        newRound();
      }, 1000);
    } else {
      setMessage(`Fel! Ordet stavas med "${currentWord.parts[0]}"`);
      setMessageType('incorrect');
      
      if (gameMode === 'streak') {
        setIsPlaying(false);
        setMessage(`Spelet är slut! Du klarade ${currentStreak} ord i rad!`);
        setShowNameInput(true);
      }
    }
  };

  if (!isPlaying) {
    return (
      <div className="sje-game">
        <h1>Gissa sje-ljudet!</h1>
        <div className="game-mode-selector">
          <button 
            onClick={() => setGameMode('time')} 
            className={gameMode === 'time' ? 'selected' : ''}
          >
            30 sekunder
          </button>
          <button 
            onClick={() => setGameMode('streak')} 
            className={gameMode === 'streak' ? 'selected' : ''}
          >
            Så många som möjligt i rad
          </button>
        </div>
        <div className="score">
          {gameMode === 'time' 
            ? `Bästa poäng: ${score}` 
            : `Bästa svit: ${bestStreak}`}
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
              {highScores.length > 0 && (
                <div className="existing-names">
                  <p>Eller välj ditt namn:</p>
                  <div className="name-buttons">
                    {highScores.map((score, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleExistingNameSelect(score.name)}
                        className={playerName === score.name ? 'selected' : ''}
                      >
                        {score.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button type="submit">Spara poäng</button>
          </form>
        ) : (
          <button onClick={startNewGame} className="start-button">
            {score === 0 ? 'Starta spelet' : 'Spela igen'}
          </button>
        )}
        {(gameMode === 'time' ? highScores : streakHighScores).length > 0 && (
          <div className="high-scores">
            <h2>Topplista - {gameMode === 'time' ? '30 sekunder' : 'Svit'}</h2>
            <ul>
              {(gameMode === 'time' ? highScores : streakHighScores).map((score, index) => (
                <li key={index}>
                  {score.name}: {score.score} {gameMode === 'time' ? 'ord' : 'i rad'} ({score.date})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (!currentWord) return <div>Laddar...</div>;

  return (
    <div className="sje-game">
      <h1>Gissa sje-ljudet!</h1>
      <div className="game-stats">
        {gameMode === 'time' ? (
          <>
            <div className="time-left">Tid kvar: {timeLeft}s</div>
            <div className="score">Ord denna runda: {roundScore}</div>
          </>
        ) : (
          <div className="score">Nuvarande svit: {currentStreak}</div>
        )}
      </div>
      <div className="word-container">
        <div className="word-display">
          <span className="prefix">?</span>
          <span className="word-ending">{currentWord.parts[1]}</span>
        </div>
        <div className={`message ${messageType}`}>{message}</div>
      </div>
      <div className="buttons">
        {prefixes.map((prefix) => (
          <button key={prefix} onClick={() => handleGuess(prefix)}>
            {prefix}
          </button>
        ))}
      </div>
    </div>
  );
}
