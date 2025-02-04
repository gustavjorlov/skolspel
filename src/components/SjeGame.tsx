import { useState, useEffect, useCallback } from 'react';
import wordData from '../data/sje-words.json';

type Word = {
  word: string;
  parts: [string, string];
};

type HighScore = {
  name: string;
  score: number;
  date: string;
};

const ROUND_DURATION = 30; // seconds
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
  const [highScores, setHighScores] = useState<HighScore[]>([]);

  useEffect(() => {
    // Load high scores from localStorage when component mounts
    const savedScores = localStorage.getItem('sjeHighScores');
    if (savedScores) {
      setHighScores(JSON.parse(savedScores));
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
    const existingScoreIndex = highScores.findIndex(s => s.name === trimmedName);
    let newHighScores: HighScore[];

    if (existingScoreIndex !== -1) {
      // Update existing score if new score is higher
      if (score > highScores[existingScoreIndex].score) {
        newHighScores = highScores.map((s, index) => 
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
      newHighScores = [...highScores, {
        name: trimmedName,
        score,
        date: new Date().toLocaleDateString('sv-SE')
      }];
    }

    newHighScores = newHighScores
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_HIGH_SCORES);

    setHighScores(newHighScores);
    localStorage.setItem('sjeHighScores', JSON.stringify(newHighScores));
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
    setTimeLeft(ROUND_DURATION);
    setRoundScore(0);
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
    if (isPlaying && timeLeft > 0) {
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
  }, [isPlaying, timeLeft, roundScore]);

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
      setRoundScore(roundScore + 1);
      setTimeout(() => {
        setMessageType('');
        newRound();
      }, 1000);
    } else {
      setMessage(`Fel! Ordet stavas med "${currentWord.parts[0]}"`);
      setMessageType('incorrect');
    }
  };

  if (!isPlaying) {
    return (
      <div className="sje-game">
        <h1>Gissa sje-ljudet!</h1>
        <div className="score">Bästa poäng: {score}</div>
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
        {highScores.length > 0 && (
          <div className="high-scores">
            <h2>Topplista</h2>
            <ul>
              {highScores.map((score, index) => (
                <li key={index}>
                  {score.name}: {score.score} ord ({score.date})
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
        <div className="time-left">Tid kvar: {timeLeft}s</div>
        <div className="score">Ord denna runda: {roundScore}</div>
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
