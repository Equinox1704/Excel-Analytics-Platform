import React from "react";
import "./LoginPage.css";

export default function SuccessDialog({ isOpen, message, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="success-dialog-overlay">
      <div className="success-dialog">
        <div className="success-dialog-content">
          <div className="success-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="#FCA311" opacity="0.1"/>
              <circle cx="24" cy="24" r="16" fill="#FCA311" opacity="0.2"/>
              <path d="M18 24l6 6 12-12" stroke="#FCA311" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="success-title">Success!</h3>
          <p className="success-message">{message}</p>
          <button className="success-btn" onClick={onClose}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
