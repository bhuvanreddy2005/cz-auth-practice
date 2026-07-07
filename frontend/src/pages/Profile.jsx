import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Toast from "../components/Toast";
import { getErrorMessage } from "../utils/errorHelper";
import CenteredCard from "../components/CenteredCard";
import { ShieldIcon, PersonIcon, MailIcon, PhoneIcon } from "../components/Icons";
import "./Signup.css";

function Profile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "" });
  const navigate = useNavigate();

  const closeToast = () => setToast({ message: "", type: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/profile");
        setName(response.data.name);
        setEmail(response.data.email);
        setPhoneNumber(response.data.phone_number || "");
      } catch (err) {
        setToast({ message: getErrorMessage(err, "Failed to load profile"), type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put("/profile", { name, email, phone_number: phoneNumber || null });
      setToast({ message: response.data.message, type: "success" });
    } catch (err) {
      setToast({ message: getErrorMessage(err, "Update failed"), type: "error" });
    }
  };

  if (loading) {
    return (
      <CenteredCard>
        <p style={{ textAlign: "center", color: "#555" }}>Loading profile...</p>
      </CenteredCard>
    );
  }

  return (
    <CenteredCard>
      <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      <div className="centered-logo">
        <ShieldIcon size={22} />
        <span className="centered-logo-text">Cz-auth-practice</span>
      </div>
      <h1 className="centered-title">My <span>Profile</span></h1>
      <p className="centered-subtitle">View and update your account details</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <div className="input-with-icon">
            <span className="icon-left"><PersonIcon /></span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <div className="input-with-icon">
            <span className="icon-left"><MailIcon /></span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
        </div>
        <div className="form-group">
          <label>Mobile Number</label>
          <div className="input-with-icon">
            <span className="icon-left"><PhoneIcon /></span>
            <input type="tel" placeholder="Add a mobile number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          </div>
        </div>
        <button type="submit" className="auth-button">Save Changes</button>
      </form>
      <p className="auth-switch"><button onClick={() => navigate("/dashboard")}>&larr; Back to Dashboard</button></p>
    </CenteredCard>
  );
}

export default Profile;