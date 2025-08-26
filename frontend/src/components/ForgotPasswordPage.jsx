import React, { useState } from "react";
import { forgotPassword, verifyOTP, resetPassword } from "../api";
import SuccessDialog from "./SuccessDialog";
import "./LoginPage.css";
import logo from "../assets/logo1.png";

export default function ForgotPasswordPage({ onBackToLogin }) {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyOTP(email, otp);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      setShowSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onBackToLogin();
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleEmailSubmit} className="is-form">
            {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="is-input"
              required
            />
            <button className="is-btn-main" type="submit" disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        );
      case 2:
        return (
          <form onSubmit={handleOTPSubmit} className="is-form">
            {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
            <div style={{ marginBottom: 16, color: '#666' }}>
              We've sent a 6-digit OTP to <strong>{email}</strong>
            </div>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              className="is-input"
              maxLength="6"
              pattern="[0-9]{6}"
              required
            />
            <button className="is-btn-main" type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              type="button"
              className="is-link"
              onClick={() => setStep(1)}
              style={{ background: "none", border: "none", padding: "8px 0", color: "var(--orange)", textDecoration: "underline", cursor: "pointer" }}
            >
              Change Email
            </button>
          </form>
        );
      case 3:
        return (
          <form onSubmit={handlePasswordReset} className="is-form">
            {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="is-input"
              required
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="is-input"
              required
            />
            <button className="is-btn-main" type="submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        );
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (step) {
      case 1:
        return "Forgot your password?";
      case 2:
        return "Enter verification code";
      case 3:
        return "Create new password";
      default:
        return "";
    }
  };

  const getSubtitle = () => {
    switch (step) {
      case 1:
        return "Enter your email and we'll send you an OTP to reset your password";
      case 2:
        return "Check your email for the 6-digit verification code";
      case 3:
        return "Your new password must be different from previous passwords";
      default:
        return "";
    }
  };

  return (
    <div className="is-root">
      <div className="is-container">
        {/* Left panel */}
        <div className="is-panel is-panel-left">
          <img src={logo} alt="InsightSheet Logo" className="is-logo-img" />
          <h2 className="is-title">{getTitle()}</h2>
          <p className="is-muted">{getSubtitle()}</p>
          {renderStep()}
          <div className="is-signup-info">
            Remember your password?{" "}
            <button
              type="button"
              className="is-link"
              onClick={onBackToLogin}
              style={{ background: "none", border: "none", padding: 0 }}
            >
              Back to Sign In
            </button>
          </div>
        </div>
        {/* Right panel */}
        <div className="is-panel is-panel-right">
          <div className="is-illustration">
            <svg width="130" height="130" viewBox="0 0 90 90" fill="none">
              <rect x="13" y="15" width="64" height="60" rx="7" fill="#fff" opacity="0.15" />
              <rect x="20" y="29" width="50" height="36" rx="4" fill="#fff" opacity="0.30" />
              <circle cx="45" cy="47" r="12" fill="#FCA311"/>
              <path d="M40 47l4 4 8-8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3 className="is-graphic-title">Secure password reset</h3>
            <div className="is-graphic-desc">
              We'll help you regain access to your account securely.
            </div>
          </div>
        </div>
      </div>
      <SuccessDialog 
        isOpen={showSuccess} 
        message="Your password has been reset successfully! Please sign in with your new password."
        onClose={handleSuccessClose}
      />
    </div>
  );
}
