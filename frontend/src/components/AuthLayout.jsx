import { ShieldIcon } from "./Icons";
import "./AuthLayout.css";

function AuthLayout({ title, subtitle, features, children }) {
  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-logo">
          <ShieldIcon />
          <span className="auth-logo-text">Cz-auth-practice</span>
        </div>
        <h1 className="auth-left-title">{title}</h1>
        <p className="auth-left-subtitle">{subtitle}</p>
        {features && (
          <div className="auth-features">
            {features.map((f, i) => (
              <div className="auth-feature" key={i}>
                <div className="auth-feature-icon">{f.icon}</div>
                <div>
                  <div className="auth-feature-title">{f.title}</div>
                  <div className="auth-feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="auth-right">
        <div className="auth-card">{children}</div>
      </div>
    </div>
  );
}

export default AuthLayout;