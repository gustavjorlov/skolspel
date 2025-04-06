import { HashRouter, Routes, Route } from "react-router-dom";
import { SjeGame } from "./components/SjeGame";
import { EnglishGame } from "./components/EnglishGame";
import { EnglishWords } from "./components/EnglishWords";
import { TimeGame } from "./components/TimeGame";
import { GeometryGame } from "./components/GeometryGame";
import { MapGame } from "./components/MapGame";
import { EuropeQuizGame } from "./components/EuropeQuizGame";
import { Home } from "./components/Home";
import "./App.css";
import Navigation from "./components/Navigation";

function App() {
  return (
    <HashRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route element={<Navigation />}>
            <Route path="/matte/klockan" element={<TimeGame />} />
            <Route path="/matte/geometri" element={<GeometryGame />} />
            <Route path="/svenska/sje" element={<SjeGame />} />
            <Route path="/engelska/glosor" element={<EnglishGame />} />
            <Route path="/engelska/glosor/alla" element={<EnglishWords />} />
            <Route path="/geografi/varldskartan" element={<MapGame />} />
            <Route path="/geografi/europa" element={<EuropeQuizGame />} />
          </Route>
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
