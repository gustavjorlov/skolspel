import { SvgIconComponent } from "@mui/icons-material";
import * as MuiIcons from "@mui/icons-material";
import wordData from "../data/english-words.json";
import "./EnglishWords.css";

type Word = {
  word: string;
  icon: string;
};

export function EnglishWords() {
  return (
    <div className="english-words">
      <h1>Alla engelska ord ({wordData.words.length})</h1>
      <div className="words-grid">
        {wordData.words.map((word: Word, index) => {
          const IconComponent: SvgIconComponent = MuiIcons[
            (word.icon + "TwoTone") as keyof typeof MuiIcons
          ] as SvgIconComponent;

          return (
            <div key={index} className="word-item">
              <div className="icon">
                {IconComponent && <IconComponent style={{ fontSize: 48 }} />}
              </div>
              <div className="word-info">
                {/* <div className="icon-name">{word.icon}</div> */}
                <div className="word-text">{word.word}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
