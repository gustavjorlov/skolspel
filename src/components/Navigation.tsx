import { Outlet, Link } from "react-router-dom";
import "./Navigation.css";

const Navigation = () => {
  return (
    <div>
      <nav>
        <Link to="/">Tillbaka</Link>
      </nav>
      <Outlet />
    </div>
  );
};

export default Navigation;
