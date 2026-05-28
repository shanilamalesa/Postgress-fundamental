// // client/src/App.js
// import Dashboard from "./pages/Dashboard";

// function App() {
//   return <Dashboard />;
// }

// export default App;

// client/src/App.js
import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import { getToken } from "./services/api";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getToken());

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return <Dashboard />;
}

export default App;