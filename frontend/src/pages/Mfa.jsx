import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Toast from "../components/Toast";
import "./Signup.css";

function Mfa() {
  const [qrCode, setQrCode] = useState("");
  const [code, setCode] = useState("");
  const [toast, setToast] = useState({ message: "", type: "" });
  const navigate = useNavigate();

  const closeToast = () => setToast({ message: "", type: "" });

  const startSetup = async () => {
    try {
      const response = await api.get("/mfa/setup");
      setQrCode(response.data.qr_code);
    } catch (err) {
      setToast({ message: "Failed to start MFA setup", type: "error" });
    }
  };

  const confirmEnable = async (e) => {
    e.preventDefault();
    try {
      await api.post("/mfa/enable", { code });
      setToast({ message: "MFA enabled successfully", type: "success" });
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      setToast({
        message: err.response?.data?.detail || "Invalid code",
        type: "error",
      });
    }
  };

  return (
    <div className="signup-container">
      <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      <h2>Enable MFA</h2>

      {!qrCode && (
        <button className="signup-button" onClick={startSetup}>
          Start Setup
        </button>
      )}

      {qrCode && (
        <>
          <p style={{ textAlign: "center", fontSize: "14px", color: "#555" }}>
            Scan this QR code with Google Authenticator, Microsoft Authenticator, or Authy
          </p>
          <img
            src={qrCode}
            alt="MFA QR code"
            style={{ display: "block", margin: "16px auto", width: "180px" }}
          />
          <form onSubmit={confirmEnable}>
            <div className="form-group">
              <label>Enter the 6-digit code</label>
              <input
                type="text"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                maxLength={6}
              />
            </div>
            <button type="submit" className="signup-button">
              Confirm & Enable
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default Mfa;