import { useState, useEffect } from 'react';
import wordData from '../data/sje-words.json';

type Word = {
  word: string;
  parts: [string, string];
};

const prefixes = ['sj', 'stj', 'tj', 'k', 'kj', 'skj', 'sh'];

export function SjeGame() {
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);

  const getRandomWord = (): Word => {
    const words = wordData.words;
    const randomIndex = Math.floor(Math.random() * words.length);
    const selectedWord = words[randomIndex];
    return {
      word: selectedWord.word,
      parts: [selectedWord.parts[0], selectedWord.parts[1]] as [string, string]
    };
  };

  const newRound = () => {
    setCurrentWord(getRandomWord());
    setMessage('');
  };

  useEffect(() => {
    newRound();
  }, []);

  const handleGuess = (prefix: string) => {
    if (!currentWord) return;

    if (prefix === currentWord.parts[0]) {
      setMessage(`Rätt! "${prefix + currentWord.parts[1]}" stavas med "${prefix}"`);
      setScore(score + 1);
      setTimeout(newRound, 2000);
    } else {
      setMessage(`Fel! Ordet stavas med "${currentWord.parts[0]}"`);
      setScore(Math.max(0, score - 1));
    }
  };

  if (!currentWord) return <div>Laddar...</div>;

  return (
    <div className="sje-game">
      <h1>Gissa sje-ljudet!</h1>
      <div className="score">Poäng: {score}</div>
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
