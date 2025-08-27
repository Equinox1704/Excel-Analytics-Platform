import React, { useState } from "react";
import InsightSheetLogin from "./LoginPage";
import InsightSheetSignup from "./SignupPage";
import ForgotPasswordPage from "./ForgotPasswordPage";

export default function AuthPage({ initialMode = "login", onSwitchMode, onAuthenticated }) {
  const [mode, setMode] = useState(initialMode); // 'login', 'signup', 'forgot-password'

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (onSwitchMode) {
      onSwitchMode(newMode);
    }
  };
  
  
  if (mode === "login") {
    return (
      <InsightSheetLogin 
        onSignupClick={() => handleModeChange("signup")}
        onForgotPasswordClick={() => handleModeChange("forgot-password")}
        onAuthenticated={onAuthenticated}
      />
    );
  } else if (mode === "signup") {
    return (
      <InsightSheetSignup 
        onLoginClick={() => handleModeChange("login")} 
      />
    );
  } else if (mode === "forgot-password") {
    return (
      <ForgotPasswordPage 
        onBackToLogin={() => handleModeChange("login")}
      />
    );
  }
}
