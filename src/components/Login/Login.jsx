import React, { useState } from 'react';
import './Login.css';
import app from '../../Firebaseconfig';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const db = getFirestore(app);

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'mesero'
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef, 
        where('username', '==', formData.username), 
        where('password', '==', formData.password)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data(); // Obtener los datos exactos del usuario en BD
        onLogin(userData); // Pasar datos reales, no formData

        console.log('Usuario autenticado:', userData.username);
        Cookies.set('token', JSON.stringify(userData), { expires: 1 });

        // Redirección basada en el rol real
        if (userData.role === 'mesero') {
          navigate('/mesero');
        } else if (userData.role === 'cocina') {
          navigate('/cocinero');
        }
      } else {
        setError('Usuario, contraseña o rol incorrectos');
      }
    } catch (err) {
      console.error('Error verificando usuario:', err);
      setError('Error al iniciar sesión');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-image"></div>
        
        <div className="login-content">
          <div className="login-header">
            <h1>MesaApp</h1>
            <p>Sistema de Gestión de Restaurante</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Usuario</label>
              <input
                type="text"
                id="username"
                placeholder="Ingrese su usuario"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                placeholder="Ingrese su contraseña"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>

            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="login-button"> 
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
