import { Link } from 'react-router-dom'
import './Home.css'

export function Home() {
  return (
    <div className="home">
      <h1>Välkommen till Skolspel! 🎮</h1>
      <p className="intro">
        Här kan du träna på skolämnen på ett roligt sätt! Utforska spelen och lär dig medan du har kul.
      </p>
      
      <div className="games">
        <div className="game-card">
          <h3>Klockan! ⏰</h3>
          <p>
            Träna på att läsa klockan genom att översätta tiden från text till siffror!
          </p>
          <Link to="/matte/klockan" className="play-button">
            Spela nu!
          </Link>
        </div>

        <div className="game-card">
          <h3>Geometri! 📐</h3>
          <p>
            Lär dig känna igen olika geometriska former genom detta spännande spel!
          </p>
          <Link to="/matte/geometri" className="play-button">
            Spela nu!
          </Link>
        </div>

        <div className="game-card">
          <h3>Gissa sje-ljudet! 🎯</h3>
          <p>
            Kan du hitta alla ord med sje-ljud? Testa dina kunskaper i detta spännande spel!
          </p>
          <Link to="/svenska/sje" className="play-button">
            Spela nu!
          </Link>
        </div>
        
        <div className="game-card">
          <h3>Engelska ordspelet! 🌍</h3>
          <p>
            Träna på engelska ord genom att gissa vad bilderna föreställer!
          </p>
          <Link to="/engelska/glosor" className="play-button">
            Spela nu!
          </Link>
        </div>

        <div className="game-card">
          <h3>Europas länder! 🌍</h3>
          <p>
            Testa dina kunskaper om Europas länder i detta quiz-spel!
          </p>
          <Link to="/geografi/europa" className="play-button">
            Spela nu!
          </Link>
        </div>
      </div>
    </div>
  )
}
