import React, { useState } from 'react';
import { OrdenesProvider } from './context/OrdenesContext';
import './App.css';
import Router from './router/Router';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <OrdenesProvider>
      <Router onLogin={handleLogin}/>
    </OrdenesProvider>
  );
}

export default App;
