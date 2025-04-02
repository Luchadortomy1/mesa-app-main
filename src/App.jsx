// src/App.jsx
import React, { useState } from 'react';
import Login from './components/Login/Login';
import PanelMesero from './components/Mesero/PanelMesero';
import PanelCocina from './components/Cocina/PanelCocina';
import { OrdenesProvider } from './context/OrdenesContext';
import './App.css';

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
      <div className="app">
        <div className="app-container">
          {!user ? (
            <Login onLogin={handleLogin} />
          ) : (
            <div className="panel-container">
              <header className="app-header">
                <div className="user-info">
                  <span>Bienvenido, {user.username}</span>
                  <span className="role-badge">{user.role}</span>
                </div>
                <button className="btn-logout" onClick={handleLogout}>
                  Cerrar Sesión
                </button>
              </header>
              
              {user.role === 'mesero' ? (
                <PanelMesero 
                  usuario={user.username}
                />
              ) : (
                <PanelCocina 
                  usuario={user.username}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </OrdenesProvider>
  );
}

export default App;