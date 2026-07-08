import { ShieldIcon } from "./Icons";
import "./CenteredCard.css";

function CenteredCard({ children }) {
  return (
    <>
      <div className="centered-page">
        <div className="centered-card">{children}</div>
      </div>
    </>
  );
}

export default CenteredCard;