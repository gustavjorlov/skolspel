import { useState, useEffect, useCallback } from 'react';
import './EnglishGame.css';
import { SvgIconComponent } from '@mui/icons-material';
import * as MuiIcons from '@mui/icons-material';
import wordData from '../data/english-words.json';

type Word = {
  word: string;
  icon: string;
};

export function EnglishGame() {
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [userInput, setUserInput] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'correct' | 'incorrect' | ''>('');
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const getRandomWord = useCallback(function(): Word {
    const words = wordData.words;
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
  }, []);

  const startNewGame = () => {
    setScore(0);
    setMessage('');
    setMessageType('');
    setUserInput('');
    setCurrentWord(getRandomWord());
    setIsPlaying(true);
  };

  const newRound = useCallback(() => {
    setCurrentWord(getRandomWord());
    setMessage('');
    setMessageType('');
    setUserInput('');
  }, [getRandomWord]);

  useEffect(() => {
    setCurrentWord(getRandomWord());
  }, [getRandomWord]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWord || !isPlaying) return;

    const guess = userInput.toLowerCase().trim();
    if (guess === currentWord.word) {
      setMessage('Correct!');
      setMessageType('correct');
      setScore(score + 1);
      setTimeout(() => {
        setMessageType('');
        newRound();
      }, 1000);
    } else {
      setMessage(`Incorrect! The word was "${currentWord.word}"`);
      setMessageType('incorrect');
      setTimeout(() => {
        setMessageType('');
        newRound();
      }, 2000);
    }
  };

  if (!isPlaying) {
    return (
      <div className="english-game">
        <h1>English Word Game</h1>
        <div className={`message ${messageType}`}>{message}</div>
        <button onClick={startNewGame} className="start-button">
          {score === 0 ? 'Start Game' : 'Play Again'}
        </button>
        {score > 0 && <div className="final-score">Final Score: {score}</div>}
      </div>
    );
  }

  if (!currentWord) return <div>Loading...</div>;

  // Dynamically get the icon component
  const IconComponent: SvgIconComponent = MuiIcons[currentWord.icon as keyof typeof MuiIcons] as SvgIconComponent;

  return (
    <div className="english-game">
      <h1>English Word Game</h1>
      <div className="game-stats">
        <div className="score">Score: {score}</div>
      </div>
      <div className="word-container">
        <div className="icon-display">
          {IconComponent && <IconComponent style={{ fontSize: 100 }} />}
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type the word..."
            autoFocus
          />
          <button type="submit">Submit</button>
        </form>
        <div className={`message ${messageType}`}>{message}</div>
      </div>
    </div>
  );
}
