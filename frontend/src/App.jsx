import React, { useState, useEffect } from "react";
import MainPage from "./components/MainPage";
import Dashboard from "./components/Dashboard";
import LoadingScreen from "./components/LoadingScreen";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
          // In a real app, you might want to validate the token with the backend
          setIsAuthenticated(true);
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
      } finally {
        setLoading(false);
      }
    };

    // Simulate a brief loading time for better UX
    setTimeout(checkAuth, 1000);
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      {isAuthenticated ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <MainPage onAuthenticated={handleLogin} />
      )}
    </>
  );
}

export default App;
