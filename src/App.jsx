import React, { useState } from 'react';
import { OrdenesProvider } from './context/OrdenesContext';
import './App.css';
import Router from './router/Router';
import TicketsPanel from './components/Tickets/ticketspanel';  // Asegúrate de que la ruta sea correcta

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

      {/* Agregar el componente de TicketsPanel */}
      {/* Solo renderizar el panel de tickets si el usuario está logueado */}
      {user && <TicketsPanel />}
    </OrdenesProvider>
  );
}

export default App;
