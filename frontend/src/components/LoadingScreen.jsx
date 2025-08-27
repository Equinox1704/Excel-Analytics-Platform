import React from "react";
import "./LandingPage.css";
import logo from "../assets/logo.png";

export default function LoadingScreen() {
  return (
    <div className="lp-root">
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Poppins, sans-serif',
        background: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <img 
            src={logo} 
            alt="InsightSheet Logo" 
            style={{ 
              height: '80px', 
              marginBottom: '2rem',
              animation: 'pulse 2s infinite'
            }} 
          />
          <h2 style={{ 
            color: '#14213D', 
            marginBottom: '1rem',
            fontSize: '1.5rem'
          }}>
            InsightSheet
          </h2>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <div style={{
              width: '40px',
              height: '8px',
              background: '#E5E5E5',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                background: '#FCA311',
                borderRadius: '4px',
                animation: 'loading 1.5s infinite'
              }}></div>
            </div>
          </div>
          <p style={{ 
            color: '#666',
            fontSize: '0.9rem'
          }}>
            Loading your workspace...
          </p>
        </div>
        
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(400%); }
          }
        `}</style>
      </div>
    </div>
  );
}
