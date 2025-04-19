import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EntidadesTabs from './pages/EntitiesTabs.tsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import MyProfilePage from "./pages/MyProfilePage.tsx";
import ServiciosEntidad from "./pages/ServiciosEntidad.tsx";
import HomeServicioUsuario from "./pages/HomeServicioUsuario.tsx";
import Carrito from "./pages/Carrito.tsx";
import AppLayout from './components/AppLayout.tsx';

function App() {
    return (
        <Router>
            <Routes>
                {/* Redirige la raíz a la página de login */}
                <Route path="/" element={<Navigate to="/login" />} />

                {/* Página de login */}
                <Route path="/login" element={<LoginPage />} />

                {/* Página de registro */}
                <Route path="/register" element={<RegisterPage />} />

                {/* Página de entidades */}
                <Route path="/entidades" element={<EntidadesTabs />} />

                <Route path="/perfil" element={<AppLayout><MyProfilePage /></AppLayout>} />

                <Route path="/entidad/:id_entidad" element={<ServiciosEntidad />} />

                <Route path="/home/:id_servicio" element={<AppLayout><HomeServicioUsuario /></AppLayout>} />

                <Route path="/carrito" element={<Carrito />} />

            </Routes>
        </Router>
    );
}

export default App;
