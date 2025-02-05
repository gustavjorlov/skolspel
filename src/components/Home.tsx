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
        <h2>Tillgängliga spel:</h2>
        <div className="game-card">
          <h3>Gissa sje-ljudet! 🎯</h3>
          <p>
            Kan du hitta alla ord med sje-ljud? Testa dina kunskaper i detta spännande spel!
          </p>
          <Link to="/svenska/sje" className="play-button">
            Spela nu!
          </Link>
        </div>
        
        <div className="coming-soon">
          <h3>Fler spel på väg! ✨</h3>
          <p>
            Håll utkik efter nya spännande spel som kommer snart!
          </p>
        </div>
      </div>
    </div>
  )
}
