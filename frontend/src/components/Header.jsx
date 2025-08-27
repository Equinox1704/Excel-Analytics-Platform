import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSignInAlt, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import "./LandingPage.css";
import logo from "../assets/logo.png"; 

export default function Header({ onLanding, onLogin, onSignup }) {
  return (
    <header className="lp-header-professional">
      <div className="header-container">
        {/* Logo Only */}
        <div className="brand-section">
          <img src={logo} alt="InsightSheet" className="header-logo" />
        </div>

        {/* Navigation */}
        <nav className="header-nav">
          <button onClick={onLanding} className="nav-btn nav-btn-home">
            <FontAwesomeIcon icon={faHome} className="nav-icon" />
            <span>Home</span>
          </button>
          <button onClick={onLogin} className="nav-btn nav-btn-login">
            <FontAwesomeIcon icon={faSignInAlt} className="nav-icon" />
            <span>Sign In</span>
          </button>
          <button onClick={onSignup} className="nav-btn nav-btn-signup">
            <FontAwesomeIcon icon={faUserPlus} className="nav-icon" />
            <span>Get Started</span>
          </button>
        </nav>
      </div>
    </header>
  );
}

