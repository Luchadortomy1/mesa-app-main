import { Route, Routes } from 'react-router-dom';
import Login from '../components/Login/Login';
import PanelMesero from '../components/Mesero/PanelMesero';
import PanelCocina from '../components/Cocina/PanelCocina';
import PrivateRoute from './PrivateRoute';
import Navbar from '../components/Navbar';


const Router = ({onLogin}) => {
  return (
    <>
        <Navbar />
        <Routes>
        <Route path='/' element={<Login onLogin={onLogin}/>} />
        <Route element={<PrivateRoute />}>
            <Route path='/mesero' element={<PanelMesero />} />
            <Route path='/cocinero' element={<PanelCocina />}/>
        </Route>
        </Routes>
    </>
  );
};

export default Router;
