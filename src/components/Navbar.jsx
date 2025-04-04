import React from 'react'
import { Link } from 'react-router-dom'
import Cookies from 'js-cookie'
import './Navbar.css'

const Navbar = () => {
  const rol = Cookies.get('rol');
  const token = Cookies.get('token'); // para verificar si está logueado

  return (
    <div className='navbar'>
      {/* Mostrar rutas solo si hay usuario autenticado */}
      {token && (
        <>
          {/* Admin solo si el rol es 'admin' */}
          {rol === 'admin' && (
            <Link to='/admin' className='navbar-link'>Admin</Link>
          )}

          {/* Mostrar siempre mesero y cocinero si está logueado */}
          <Link to='/mesero' className='navbar-link'>Mesero</Link>
          <Link to='/cocinero' className='navbar-link'>Cocinero</Link>

          {/* Botón de cerrar sesión */}
          <Link
            to='/'
            className='navbar-link'
            onClick={() => {
              Cookies.remove('token');
              Cookies.remove('rol');
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
