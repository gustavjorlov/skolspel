import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SjeGame } from './components/SjeGame'
import { Home } from './components/Home'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/svenska/sje" element={<SjeGame />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
