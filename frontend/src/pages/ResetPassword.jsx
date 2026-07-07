import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import CenteredCard from "../components/CenteredCard";
import { ShieldIcon, PhoneIcon, LockSmallIcon, EyeIcon } from "../components/Icons";
import Toast from "../components/Toast";
import { getErrorMessage } from "../utils/errorHelper";
import "./Signup.css";

function ResetPassword() {
  const [step, setStep] = useState("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });
  const navigate = useNavigate();

  const closeToast = () => setToast({ message: "", type: "" });

  const handleVerifyPhone = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/verify-phone", { phone_number: phoneNumber });
      setStep("reset");
    } catch (err) {
      setToast({ message: getErrorMessage(err, "Verification failed"), type: "error" });
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setToast({ message: "Passwords do not match", type: "error" });
      return;
    }
    try {
      const response = await api.post("/auth/reset-password", { phone_number: phoneNumber, new_password: newPassword });
      setToast({ message: response.data.message, type: "success" });
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setToast({ message: getErrorMessage(err, "Reset failed"), type: "error" });
    }
  };

  return (
    <CenteredCard>
      <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      <div className="centered-logo">
        <ShieldIcon size={22} />
        <span className="centered-logo-text">Cz-auth-practice</span>
      </div>

      {step === "phone" ? (
        <>
          <h1 className="centered-title">Reset <span>Password</span></h1>
          <p className="centered-subtitle">Enter the mobile number associated with your account</p>
          <form onSubmit={handleVerifyPhone}>
            <div className="form-group">
              <label>Mobile Number</label>
              <div className="input-with-icon">
                <span className="icon-left"><PhoneIcon /></span>
                <input type="tel" placeholder="9876543210" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="auth-button">Verify Number</button>
          </form>
          <p className="auth-switch"><Link to="/login">&larr; Back to login</Link></p>
        </>
      ) : (
        <>
          <h1 className="centered-title">Set New <span>Password</span></h1>
          <p className="centered-subtitle">Mobile number verified: <strong>{phoneNumber}</strong></p>
          <form onSubmit={handleResetSubmit}>
            <div className="form-group">
              <label>New Password</label>
              <div className="input-with-icon">
                <span className="icon-left"><LockSmallIcon /></span>
                <input type={showPassword ? "text" : "password"} placeholder="Enter a new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
                <button type="button" className="icon-right" onClick={() => setShowPassword(!showPassword)}><EyeIcon visible={showPassword} /></button>
              </div>
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <div className="input-with-icon">
                <span className="icon-left"><LockSmallIcon /></span>
                <input type={showPassword ? "text" : "password"} placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
              </div>
            </div>
            <button type="submit" className="auth-button">Reset Password</button>
          </form>
          <p className="auth-switch"><button onClick={() => setStep("phone")}>&larr; Use a different number</button></p>
        </>
      )}
    </CenteredCard>
  );
}

export default ResetPassword;