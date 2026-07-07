import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { removeToken } from "../utils/auth";
import CenteredCard from "../components/CenteredCard";
import { ShieldIcon } from "../components/Icons";
import "./Signup.css";

function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/protected/dashboard");
        setData(response.data);
      } catch (err) {
        setError("Session expired, please log in again");
        removeToken();
        setTimeout(() => navigate("/login"), 1500);
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  return (
    <CenteredCard>
      <div className="centered-logo">
        <ShieldIcon size={22} />
        <span className="centered-logo-text">Cz-auth-practice</span>
      </div>
      <h1 className="centered-title" style={{ textAlign: "center" }}>Dashboard</h1>
      {error && <p className="message-error">{error}</p>}
      {data && (
        <p className="centered-subtitle" style={{ textAlign: "center" }}>
          Logged in as <strong>{data.user_email}</strong>
        </p>
      )}
      <p className="auth-switch"><Link to="/profile">View / Edit Profile</Link></p>
      <button className="auth-button" onClick={handleLogout}>Log out</button>
    </CenteredCard>
  );
}

export default Dashboard;