import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SjeGame } from "./components/SjeGame";
import { EnglishGame } from "./components/EnglishGame";
import { EnglishWords } from "./components/EnglishWords";
import { Home } from "./components/Home";
import "./App.css";
import Navigation from "./components/Navigation";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route element={<Navigation />}>
            <Route path="/svenska/sje" element={<SjeGame />} />
            <Route path="/engelska/glosor" element={<EnglishGame />} />
            <Route path="/engelska/glosor/alla" element={<EnglishWords />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
