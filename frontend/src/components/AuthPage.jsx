import React, { useState } from "react";
import InsightSheetLogin from "./LoginPage";
import InsightSheetSignup from "./SignupPage";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // 'login' or 'signup'
  return mode === "login" ? (
    <InsightSheetLogin onSignupClick={() => setMode("signup")} />
  ) : (
    <InsightSheetSignup onLoginClick={() => setMode("login")} />
  );
}
