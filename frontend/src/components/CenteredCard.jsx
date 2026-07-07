import Navbar from "./Navbar";
import { ShieldIcon } from "./Icons";
import "./CenteredCard.css";

function CenteredCard({ children }) {
  return (
    <>
      <Navbar />
      <div className="centered-page">
        <div className="centered-card">{children}</div>
      </div>
    </>
  );
}

export default CenteredCard;