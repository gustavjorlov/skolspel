import { useState, useEffect, useCallback } from 'react';
import wordData from '../data/sje-words.json';

type Word = {
  word: string;
  parts: [string, string];
};

const ROUND_DURATION = 30; // seconds
const prefixes = ['sj', 'stj', 'tj', 'k', 'kj', 'skj', 'sh'];

export function SjeGame() {
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [roundScore, setRoundScore] = useState(0);

  const getRandomWord = useCallback(function(): Word {
    const words = wordData.words;
    const randomIndex = Math.floor(Math.random() * words.length);
    const selectedWord = words[randomIndex];
    return {
      word: selectedWord.word,
      parts: [selectedWord.parts[0], selectedWord.parts[1]]
    };
  }, []);

  const startNewGame = () => {
    setTimeLeft(ROUND_DURATION);
    setRoundScore(0);
    setScore(0);
    setMessage('');
    setCurrentWord(getRandomWord());
    setIsPlaying(true);
  };

  const newRound = useCallback(() => {
    setCurrentWord(getRandomWord());
    setMessage('');
  }, [getRandomWord]);

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            setMessage(`Spelet är slut! Du klarade ${roundScore} ord på ${ROUND_DURATION} sekunder!`);
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
      setScore(score + 1);
      setRoundScore(roundScore + 1);
      setTimeout(newRound, 1000);
    } else {
      setMessage(`Fel! Ordet stavas med "${currentWord.parts[0]}"`);
    }
  };

  if (!isPlaying) {
    return (
      <div className="sje-game">
        <h1>Gissa sje-ljudet!</h1>
        <div className="score">Bästa poäng: {score}</div>
        <div className="message">{message}</div>
        <button onClick={startNewGame} className="start-button">
          {score === 0 ? 'Starta spelet' : 'Spela igen'}
        </button>
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
        <div className="message">{message}</div>
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
