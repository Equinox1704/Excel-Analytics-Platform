import React from "react";
import "./LandingPage.css";

export default function ErrorBoundary({ error, resetError }) {
  return (
    <div className="lp-root">
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{
          background: '#fff',
          padding: '3rem',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          maxWidth: '500px'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😵</div>
          <h2 style={{ color: '#14213D', marginBottom: '1rem' }}>Oops! Something went wrong</h2>
          <p style={{ color: '#666', marginBottom: '2rem', lineHeight: 1.5 }}>
            We encountered an unexpected error. Don't worry, this happens sometimes. 
            Please try refreshing the page or contact support if the problem persists.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={resetError}
              style={{
                background: '#FCA311',
                color: '#14213D',
                border: 'none',
                padding: '0.8rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
            <button 
              onClick={() => window.location.reload()}
              style={{
                background: 'transparent',
                color: '#FCA311',
                border: '2px solid #FCA311',
                padding: '0.8rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Refresh Page
            </button>
          </div>
          {error && (
            <details style={{ marginTop: '2rem', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', color: '#666' }}>
                Technical Details
              </summary>
              <pre style={{ 
                background: '#f8f9fa', 
                padding: '1rem', 
                borderRadius: '4px', 
                overflow: 'auto',
                fontSize: '0.8rem',
                marginTop: '0.5rem'
              }}>
                {error.message}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
