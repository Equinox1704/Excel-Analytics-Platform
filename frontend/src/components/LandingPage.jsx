import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUpload, 
  faChartLine, 
  faChartBar, 
  faDownload,
  faRocket,
  faLightbulb
} from '@fortawesome/free-solid-svg-icons';
import "./LandingPage.css";
// import logo from "../assets/logo.jpg"; 

export default function LandingPage({ onGetStarted, onLearnMore }) {
  return (
    <div className="lp-root">
      <header className="lp-header">
        {/* <img src={logo} alt="InsightSheet Logo" className="lp-logo" /> */}
        {/* <nav className="lp-nav">
          <a href="/login">Login</a>
          <a href="/signup" className="lp-btn-primary">Sign Up</a>
        </nav> */}
      </header>

      <section className="lp-hero">
        <div className="lp-hero-badge">
          <FontAwesomeIcon icon={faRocket} className="badge-icon" />
          <span>Transform Your Data Today</span>
        </div>
        <h1>Transform Your Excel Data into <span className="highlight">Insights</span></h1>
        <p>Upload, analyze, and visualize your spreadsheets instantly with InsightSheet. Turn raw data into actionable insights with our powerful analytics platform.</p>
        <div className="lp-actions">
          <button 
            onClick={onGetStarted} 
            className="lp-btn-primary"
          >
            <FontAwesomeIcon icon={faRocket} className="btn-icon" />
            Get Started Free
          </button>
          <button 
            onClick={onLearnMore} 
            className="lp-btn-secondary"
          >
            <FontAwesomeIcon icon={faLightbulb} className="btn-icon" />
            Learn More
          </button>
        </div>
        <div className="lp-hero-stats">
          <div className="stat-item">
            <span className="stat-number">10K+</span>
            <span className="stat-label">Files Analyzed</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">50+</span>
            <span className="stat-label">Chart Types</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">99.9%</span>
            <span className="stat-label">Uptime</span>
          </div>
        </div>
      </section>

      <section className="lp-features">
        <div className="lp-features-header">
          <h2>Powerful Features</h2>
          <p>Everything you need to transform your Excel data into professional insights</p>
        </div>
        <div className="lp-feature-cards">
          <div className="lp-feature-card">
            <div className="feature-icon-wrapper">
              <FontAwesomeIcon icon={faUpload} className="feature-icon" />
            </div>
            <h3>Easy Upload</h3>
            <p>Upload any Excel (.xls/.xlsx) file hassle-free with our drag-and-drop interface.</p>
            <div className="feature-highlight">
              <span>Supports files up to 100MB</span>
            </div>
          </div>
          <div className="lp-feature-card">
            <div className="feature-icon-wrapper">
              <FontAwesomeIcon icon={faChartLine} className="feature-icon" />
            </div>
            <h3>Dynamic Data Mapping</h3>
            <p>Select X and Y axes dynamically to analyze your data from multiple perspectives.</p>
            <div className="feature-highlight">
              <span>Real-time preview</span>
            </div>
          </div>
          <div className="lp-feature-card">
            <div className="feature-icon-wrapper">
              <FontAwesomeIcon icon={faChartBar} className="feature-icon" />
            </div>
            <h3>Interactive Charts</h3>
            <p>Create stunning 2D/3D graphs with multiple chart types and customization options.</p>
            <div className="feature-highlight">
              <span>15+ chart types</span>
            </div>
          </div>
          <div className="lp-feature-card">
            <div className="feature-icon-wrapper">
              <FontAwesomeIcon icon={faDownload} className="feature-icon" />
            </div>
            <h3>Download & Share</h3>
            <p>Download charts as PNG, PDF, or SVG to share your insights with your team.</p>
            <div className="feature-highlight">
              <span>High-resolution exports</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="lp-footer">
        &copy; 2025 InsightSheet. All rights reserved.
      </footer>
    </div>
  );
}
