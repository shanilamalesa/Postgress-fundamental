// client/src/App.js
import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Setup from "./pages/Setup";
import { getToken } from "./services/api";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getToken());
  const [isConfigured, setIsConfigured] = useState(null); // null = still checking

  useEffect(() => {
    fetch("http://localhost:5000/api/setup/status")
      .then((res) => res.json())
      .then((data) => setIsConfigured(data.configured))
      .catch(() => setIsConfigured(true)); // if check fails, assume configured
  }, []);

  // Still checking setup status
  if (isConfigured === null) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-sm">Loading...</p>
      </div>
    );
  }

  // First time — no admin exists yet
  if (!isConfigured) {
    return (
      <Setup
        onComplete={() => {
          setIsConfigured(true);
          setIsLoggedIn(true);
        }}
      />
    );
  }

  // Not logged in
  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  // All good — show dashboard
  return <Dashboard />;
}

export default App;