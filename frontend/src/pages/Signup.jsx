import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { saveToken } from "../utils/auth";
import Toast from "../components/Toast";
import CenteredCard from "../components/CenteredCard";
import { ShieldIcon, PersonIcon, MailIcon, LockSmallIcon, EyeIcon, CheckIcon, LockIcon } from "../components/Icons";
import "./Signup.css";

function Signup() {
  const [step, setStep] = useState("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [toast, setToast] = useState({ message: "", type: "" });
const navigate = useNavigate();
  const otpRefs = useRef([]);

  useEffect(() => {
    api.get("/").catch(() => {});
  }, []);

  const closeToast = () => setToast({ message: "", type: "" });
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    noSpaces: password.length > 0 && !/\s/.test(password),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setToast({ message: "Passwords do not match", type: "error" });
      return;
    }
    if (!checks.length || !checks.uppercase || !checks.number || !checks.noSpaces) {
      setToast({ message: "Password does not meet requirements", type: "error" });
      return;
    }
   let signupSucceeded = false;
    try {
      const signupResponse = await api.post("/auth/signup", { name, email, password });
      saveToken(signupResponse.data.access_token);
      signupSucceeded = true;

      const setupResponse = await api.get("/mfa/setup");
      setQrCode(setupResponse.data.qr_code);
      setStep("mfa");
    } catch (err) {
      if (signupSucceeded) {
        setToast({ message: "Account created, but MFA setup timed out. Please refresh and log in to try again.", type: "error" });
      } else {
        setToast({ message: err.response?.data?.detail || "Signup failed", type: "error" });
      }
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleEnableMfa = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      setToast({ message: "Enter all 6 digits", type: "error" });
      return;
    }
    try {
      await api.post("/mfa/enable", { code });
      setToast({ message: "Account created and secured", type: "success" });
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setToast({ message: err.response?.data?.detail || "Invalid code", type: "error" });
      setOtp(["", "", "", "", "", ""]);
    }
  };

  return (
    <CenteredCard>
      <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      <div className="centered-logo">
        <ShieldIcon size={22} />
        <span className="centered-logo-text">Cz-auth-practice</span>
      </div>

      {step === "form" ? (
        <>
          <h1 className="centered-title">Sign <span>Up</span></h1>
          <p className="centered-subtitle">Create your account to get started</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-with-icon">
                <span className="icon-left"><PersonIcon /></span>
                <input type="text" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <span className="icon-left"><MailIcon /></span>
                <input type="email" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="input-with-icon">
                <span className="icon-left"><LockSmallIcon /></span>
                <input type={showPassword ? "text" : "password"} placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" className="icon-right" onClick={() => setShowPassword(!showPassword)}><EyeIcon visible={showPassword} /></button>
              </div>
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <div className="input-with-icon">
                <span className="icon-left"><LockSmallIcon /></span>
                <input type={showConfirm ? "text" : "password"} placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                <button type="button" className="icon-right" onClick={() => setShowConfirm(!showConfirm)}><EyeIcon visible={showConfirm} /></button>
              </div>
            </div>
            <div className="password-checklist">
              <div className="password-checklist-item"><CheckIcon active={checks.length} /> At least 8 characters</div>
              <div className="password-checklist-item"><CheckIcon active={checks.uppercase} /> Includes an uppercase letter</div>
              <div className="password-checklist-item"><CheckIcon active={checks.number} /> Includes a number</div>
              <div className="password-checklist-item"><CheckIcon active={checks.noSpaces} /> No spaces allowed</div>
            </div>
            <button type="submit" className="auth-button">Create Account &rarr;</button>
          </form>
          <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
        </>
      ) : (
        <>
          <div className="mfa-icon-circle"><LockIcon color="#4f46e5" /></div>
          <h2 className="auth-title" style={{ textAlign: "center" }}>Secure Your Account</h2>
          <p className="auth-subtitle" style={{ textAlign: "center" }}>Scan this QR code with your authenticator app to finish setting up your account.</p>
          <div className="mfa-qr-wrapper"><img src={qrCode} alt="MFA QR code" /></div>
          <form onSubmit={handleEnableMfa}>
            <div className="otp-container">
              {otp.map((digit, index) => (
                <input key={index} type="text" inputMode="numeric" maxLength={1} className="otp-input" value={digit} onChange={(e) => handleOtpChange(index, e.target.value)} ref={(el) => (otpRefs.current[index] = el)} autoFocus={index === 0} />
              ))}
            </div>
            <p className="otp-helper-text">Enter the 6-digit code from your authenticator app</p>
            <button type="submit" className="auth-button">Verify & Finish Setup &rarr;</button>
          </form>
        </>
      )}
    </CenteredCard>
  );
}

export default Signup;