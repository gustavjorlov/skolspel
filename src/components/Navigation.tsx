import { Outlet } from "react-router-dom";
import "./Navigation.css";

const Navigation = () => {
  return (
    <div>
      <nav>
        <a href="/">Tillbaka</a>
      </nav>
      <Outlet />
    </div>
  );
};

export default Navigation;
