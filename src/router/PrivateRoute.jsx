import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Función para obtener la cookie por nombre
const getCookie = (name) => {
  const cookies = document.cookie.split('; ');
  const cookie = cookies.find(row => row.startsWith(`${name}=`));
  return cookie ? cookie.split('=')[1] : null;
};

const PrivateRoute = () => {
  const token = getCookie('token'); // Busca la cookie 'token'

  return token ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoute;