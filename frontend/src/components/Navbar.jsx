import { Link } from "react-router-dom";
import { ShieldIcon } from "./Icons";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="top-navbar">
      <div className="navbar-brand">
        <ShieldIcon size={20} />
        <span>Cz-auth-practice</span>
      </div>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
      </div>
    </nav>
  );
}

export default Navbar;