import React from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import './Navbar.css';

const Navbar = () => {
  // Función mejorada para extraer el rol
  const getRoleFromCookie = () => {
    const cookieValue = Cookies.get('token');
    if (!cookieValue) return null;
    
    try {
      const decoded = decodeURIComponent(cookieValue);
      const roleMatch = decoded.match(/"role":"?([^",}]+)"?/);
      if (!roleMatch) return null;
      
      // Normalizamos los nombres de roles
      const role = roleMatch[1].toLowerCase();
      if (role === 'cocina') return 'cocinero'; // Corregimos la discrepancia
      return role;
    } catch (error) {
      console.error('Error parsing cookie:', error);
      return null;
    }
  };

  const rol = getRoleFromCookie();
  const token = Cookies.get('token');

  // Función de validación de acceso
  const handleAccess = (targetRole, e) => {
    if (rol !== 'admin' && rol !== targetRole) {
      e.preventDefault();
      alert(`No tienes permisos de ${targetRole}`);
    }
  };

  return (
    <div className='navbar'>
      {token && (
        <>
          {rol === 'admin' && (
            <Link to='/admin' className='navbar-link'>Admin</Link>
          )}

          <Link 
            to='/mesero' 
            className='navbar-link'
            onClick={(e) => handleAccess('mesero', e)}
          >
            Mesero
          </Link>

          <Link 
            to='/cocinero' 
            className='navbar-link'
            onClick={(e) => handleAccess('cocinero', e)}
          >
            Cocinero
          </Link>

          <Link
            to='/'
            className='navbar-link'
            onClick={() => {
              Cookies.remove('token');
              window.location.reload();
            }}
          >
            Logout
          </Link>
        </>
      )}
    </div>
  );
};

export default Navbar;