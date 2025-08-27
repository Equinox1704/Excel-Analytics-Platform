import React, { useState } from "react";
import { loginUser } from "../api";
import SuccessDialog from "./SuccessDialog";
import "./LoginPage.css";
import logo from "../assets/logo.png";

// connection between the backend
// forgot button check handling

export default function InsightSheetLogin({ onSignupClick, onForgotPasswordClick, onAuthenticated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSuccessClose = () => {
    setShowSuccess(false);
    // Redirect to dashboard after closing success dialog
    if (onAuthenticated) {
      // Extract user info from stored data or response
      const userData = { name: email.split('@')[0] }; // Simple extraction, you might want to get this from API response
      onAuthenticated(userData, localStorage.getItem('token'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      // Store token
      localStorage.setItem("token", data.token);
      // Show success dialog with auto-redirect
      setShowSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="is-root">
      <div className="is-container">
        {/* Left panel */}
        <div className="is-panel is-panel-left">
          {/* <div className="is-logo">InsightSheet</div> */}
          <img src={logo} alt="InsightSheet Logo" className="is-logo-img" />
          <h2 className="is-title">Welcome back</h2>
          <p className="is-muted">Please enter your details</p>
          <form onSubmit={handleSubmit} className="is-form">
            {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="is-input"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="is-input"
              required
            />
            <div className="is-form-row">
              <label className="is-checkbox">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                />{" "}
                Remember me
              </label>
              {/* <a className="is-link" href="#">Forgot password?</a> */}
              <button
                type="button"
                className="is-link"
                onClick={onForgotPasswordClick}
                style={{ background: "none", border: "none", padding: 0, color: "var(--orange)", textDecoration: "underline", cursor: "pointer" }}
            >
                Forgot password?
            </button>

            </div>
            <button className="is-btn-main" type="submit" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
          <div className="is-signup-info">
            Don't have an account?{" "}
            <button
              type="button"
              className="is-link"
              onClick={onSignupClick}
              style={{ background: "none", border: "none", padding: 0 }}
            >
              Sign up
            </button>
          </div>
        </div>
        {/* Right panel */}
        <div className="is-panel is-panel-right">
          <div className="is-illustration">
            <svg width="130" height="130" viewBox="0 0 90 90" fill="none">
              <rect x="13" y="15" width="64" height="60" rx="7" fill="#fff" opacity="0.15" />
              <rect x="20" y="29" width="50" height="36" rx="4" fill="#fff" opacity="0.30" />
              <rect x="26" y="35" width="14" height="12" rx="2" fill="#FCA311"/>
              <rect x="44" y="35" width="20" height="5" rx="2.5" fill="#E5E5E5"/>
              <rect x="44" y="44" width="20" height="3" rx="1.5" fill="#E5E5E5"/>
            </svg>
            <h3 className="is-graphic-title">Analyze your data, get insights!</h3>
            <div className="is-graphic-desc">
              Secure, smart, and visual dashboarding for your sheets.
            </div>
          </div>
        </div>
      </div>
      <SuccessDialog 
        isOpen={showSuccess} 
        message="Welcome back! You have successfully logged in to your account."
        onClose={handleSuccessClose}
        autoCloseDelay={3000}
      />
    </div>
  );
}
