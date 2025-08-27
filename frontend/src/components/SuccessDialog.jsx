import React, { useState, useEffect } from "react";
import "./LoginPage.css";

export default function SuccessDialog({ isOpen, message, onClose, autoCloseDelay = 3000 }) {
  const [countdown, setCountdown] = useState(Math.ceil(autoCloseDelay / 1000));

  useEffect(() => {
    if (!isOpen) return;

    setCountdown(Math.ceil(autoCloseDelay / 1000));

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, autoCloseDelay, onClose]);

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
          <div className="success-actions">
            <button className="success-btn" onClick={onClose}>
              Continue Now
            </button>
            <div className="auto-redirect-info">
              Redirecting automatically in {countdown} second{countdown !== 1 ? 's' : ''}...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
