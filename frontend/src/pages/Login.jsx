import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { saveToken } from "../utils/auth";
import Toast from "../components/Toast";
import CenteredCard from "../components/CenteredCard";
import { ShieldIcon, MailIcon, LockSmallIcon, EyeIcon, LockIcon } from "../components/Icons";
import { getErrorMessage } from "../utils/errorHelper";
import "./Signup.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [mfaStep, setMfaStep] = useState(false);
  const [userId, setUserId] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [secondsLeft, setSecondsLeft] = useState(30);
  const navigate = useNavigate();
  const otpRefs = useRef([]);

  const closeToast = () => setToast({ message: "", type: "" });

  useEffect(() => {
    if (!mfaStep) return;
    const tick = () => setSecondsLeft(30 - (Math.floor(Date.now() / 1000) % 30));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [mfaStep]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.data.mfa_required) {
        setUserId(response.data.user_id);
        setMfaStep(true);
        return;
      }
      saveToken(response.data.access_token);
      setToast({ message: "Login successful", type: "success" });
      setTimeout(() => navigate("/profile"), 800);
    } catch (err) {
      setToast({ message: getErrorMessage(err, "Login failed"), type: "error" });
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      setToast({ message: "Enter all 6 digits", type: "error" });
      return;
    }
    try {
      const response = await api.post("/auth/mfa-verify", { user_id: userId, code });
      saveToken(response.data.access_token);
      setToast({ message: "Login successful", type: "success" });
      setTimeout(() => navigate("/profile"), 800);
    } catch (err) {
      setToast({ message: getErrorMessage(err, "Invalid code"), type: "error" });
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    }
  };

  const backToLogin = () => {
    setMfaStep(false);
    setOtp(["", "", "", "", "", ""]);
    setPassword("");
  };

  return (
    <CenteredCard>
      <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      <div className="centered-logo">
        <ShieldIcon size={22} />
        <span className="centered-logo-text">Cz-auth-practice</span>
      </div>

      {!mfaStep ? (
        <>
          <h1 className="centered-title">Log <span>In</span></h1>
          <p className="centered-subtitle">Welcome back, enter your details</p>
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <span className="icon-left"><MailIcon /></span>
                <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="input-with-icon">
                <span className="icon-left"><LockSmallIcon /></span>
                <input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" className="icon-right" onClick={() => setShowPassword(!showPassword)}><EyeIcon visible={showPassword} /></button>
              </div>
            </div>
            <button type="submit" className="auth-button">Log In &rarr;</button>
          </form>
          <p className="auth-switch"><Link to="/reset-password">Forgot password?</Link></p>
          <p className="auth-switch">Don't have an account? <Link to="/signup">Sign up</Link></p>
        </>
      ) : (
        <>
          <div className="mfa-icon-circle"><LockIcon color="#4f46e5" /></div>
          <h2 className="auth-title" style={{ textAlign: "center" }}>Two-Factor Authentication</h2>
          <p className="auth-subtitle" style={{ textAlign: "center" }}>Enter the 6-digit code from your authenticator app to verify your identity.</p>
          <form onSubmit={handleMfaSubmit}>
            <div className="otp-container">
              {otp.map((digit, index) => (
                <input key={index} type="text" inputMode="numeric" maxLength={1} className="otp-input" value={digit} onChange={(e) => handleOtpChange(index, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(index, e)} ref={(el) => (otpRefs.current[index] = el)} autoFocus={index === 0} />
              ))}
            </div>
            <div className="countdown-box">
              <div className="countdown-label"><span>Code refreshes in</span><strong>{secondsLeft}s</strong></div>
              <div className="countdown-bar-track"><div className="countdown-bar-fill" style={{ width: `${(secondsLeft / 30) * 100}%` }} /></div>
            </div>
            <button type="submit" className="auth-button">Verify &amp; Continue &rarr;</button>
          </form>
          <p className="auth-switch"><button onClick={backToLogin}>&larr; Back to login</button></p>
        </>
      )}
    </CenteredCard>
  );
}

export default Login;