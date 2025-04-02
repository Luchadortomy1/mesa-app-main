import React, { useState } from 'react';
import './Login.css';
import app from '../../Firebaseconfig'; // Asegúrate de que la ruta sea correcta
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
      const q = query(usersRef, where('username', '==', formData.username), where('password', '==', formData.password));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        onLogin(formData);
        console.log('Usuario autenticado:', formData.username);
        // Guardar el token en una cookie
        Cookies.set('token', JSON.stringify(formData), { expires: 1 });
        // Redirigir a la página de mesero
        navigate('/mesero');
      } else {
        setError('Usuario o contraseña incorrectos');
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

            <div className="form-group">
              <label htmlFor="role">Rol</label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="mesero">Mesero</option>
                <option value="cocina">Cocina</option>
              </select>
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
