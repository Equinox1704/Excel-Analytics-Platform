import React, { useState } from "react";
import LandingPage from "./LandingPage";
import AuthPage from "./AuthPage";
import Header from "./Header";

export default function MainPage({ onAuthenticated }) {
  const [page, setPage] = useState("landing");

  const openLanding = () => setPage("landing");
  const openLogin = () => setPage("login");
  const openSignup = () => setPage("signup");

  const handleGetStarted = () => setPage("signup");
  const handleLearnMore = () => {
    // Scroll to features section or show more info
    const featuresSection = document.querySelector('.lp-features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Show Header ONLY on landing page
  const showHeader = page === "landing";

  return (
    <>
      {showHeader && (
        <Header onLanding={openLanding} onLogin={openLogin} onSignup={openSignup} />
      )}

      {page === "landing" && (
        <LandingPage 
          onGetStarted={handleGetStarted}
          onLearnMore={handleLearnMore}
        />
      )}
      {(page === "login" || page === "signup") && (
        <AuthPage 
          initialMode={page} 
          onSwitchMode={setPage} 
          onAuthenticated={onAuthenticated}
        />
      )}
    </>
  );
}
