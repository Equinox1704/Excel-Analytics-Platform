import React, { useState } from "react";
import InsightSheetLogin from "./LoginPage";
import InsightSheetSignup from "./SignupPage";
import ForgotPasswordPage from "./ForgotPasswordPage";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // 'login', 'signup', 'forgot-password'
  
  if (mode === "login") {
    return (
      <InsightSheetLogin 
        onSignupClick={() => setMode("signup")}
        onForgotPasswordClick={() => setMode("forgot-password")}
      />
    );
  } else if (mode === "signup") {
    return (
      <InsightSheetSignup 
        onLoginClick={() => setMode("login")} 
      />
    );
  } else if (mode === "forgot-password") {
    return (
      <ForgotPasswordPage 
        onBackToLogin={() => setMode("login")}
      />
    );
  }
}
