import React, { useState } from "react";
import { registerUser } from "../api";
import SuccessDialog from "./SuccessDialog";
import "./LoginPage.css";
import logo from "../assets/logo1.png";

export default function InsightSheetSignup({ onLoginClick }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [welcomeEmailSent, setWelcomeEmailSent] = useState(false);

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onLoginClick(); // Redirect to login page after closing dialog
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await registerUser(name, email, password);
      setWelcomeEmailSent(result.emailSent || false);
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
        {/* Left panel: the form */}
        <div className="is-panel is-panel-left">
          {/* <div className="is-logo">InsightSheet</div> */}
          <img src={logo} alt="InsightSheet Logo" className="is-logo-img" />
          <h2 className="is-title">Create an account</h2>
          <p className="is-muted">Start discovering insights in your data</p>
          <form onSubmit={handleSignup} className="is-form">
            {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
            <input
              className="is-input"
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <input
              className="is-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              className="is-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <input
              className="is-input"
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
            <button className="is-btn-main" type="submit" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>
          <div className="is-signup-info">
            Already have an account?{" "}
            <button
              type="button"
              className="is-link"
              onClick={onLoginClick}
              style={{ background: "none", border: "none", padding: 0 }}
            >
              Sign in
            </button>
          </div>
        </div>
        {/* Right panel: matching illustration */}
        <div className="is-panel is-panel-right">
          <div className="is-illustration">
            <svg width="130" height="130" viewBox="0 0 90 90" fill="none">
              <rect x="13" y="15" width="64" height="60" rx="7" fill="#fff" opacity="0.15" />
              <rect x="20" y="29" width="50" height="36" rx="4" fill="#fff" opacity="0.30" />
              <rect x="26" y="35" width="14" height="12" rx="2" fill="#FCA311"/>
              <rect x="44" y="35" width="20" height="5" rx="2.5" fill="#E5E5E5"/>
              <rect x="44" y="44" width="20" height="3" rx="1.5" fill="#E5E5E5"/>
            </svg>
            <h3 className="is-graphic-title">Join InsightSheet today!</h3>
            <div className="is-graphic-desc">
              Connect, upload, and instantly visualize your spreadsheet data.
            </div>
          </div>
        </div>
      </div>
      <SuccessDialog 
        isOpen={showSuccess} 
        message={`Account created successfully! ${welcomeEmailSent ? 'A welcome email has been sent to your inbox with getting started tips.' : ''} Please sign in with your new credentials.`}
        onClose={handleSuccessClose}
      />
    </div>
  );
}
