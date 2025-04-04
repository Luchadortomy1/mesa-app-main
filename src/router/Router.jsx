import { Route, Routes, useLocation } from 'react-router-dom';
import Login from '../components/Login/Login';
import PanelMesero from '../components/Mesero/PanelMesero';
import PanelCocina from '../components/Cocina/PanelCocina';
import PrivateRoute from './PrivateRoute';
import NavbarMesero from '../components/Mesero/NavbarMesero';
import NavbarCocina from '../components/Cocina/NavbarCocina';
import NavbarAdmin from '../components/Admin/NavbarAdmin';
import PanelAgregarPlatillos from '../components/Admin/AgregarPlatillos';


const Router = ({ onLogin }) => {
  const location = useLocation(); // Obtener la ruta actual

  // Elegir qué Navbar mostrar
  const renderNavbar = () => {
      if (location.pathname.startsWith('/mesero')) {
          return <NavbarMesero />;
      } else if (location.pathname.startsWith('/cocinero')) {
          return <NavbarCocina />;
      } else if (location.pathname.startsWith('/admin')) {
        return <NavbarAdmin />;
      }
  };

  return (
      <>
          {renderNavbar()} {/* Renderiza el Navbar dinámico */}
          <Routes>
              <Route path='/' element={<Login onLogin={onLogin} />} />
              <Route element={<PrivateRoute />}>
                  <Route path='/mesero' element={<PanelMesero />} />
                  <Route path='/cocinero' element={<PanelCocina />} />
                  <Route path='/admin' element={<PanelAgregarPlatillos />} />
              </Route>
          </Routes>
      </>
  );
};

export default Router;