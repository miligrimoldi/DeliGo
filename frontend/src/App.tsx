import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EntidadesTabs from './pages/EntitiesTabs.tsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import MyProfilePage from "./pages/MyProfilePage.tsx";
import ServiciosEntidad from "./pages/ServiciosEntidad.tsx";
import HomeAdministrador from "./pages/admin/HomeAdministrador.tsx";
import HomeServicioUsuario from './pages/HomeServicioUsuario';
import Carrito from "./pages/Carrito.tsx";
import ProductoDetalle from "./pages/ProductoDetalle.tsx";
import MisPedidosUsuario from "./pages/MisPedidosUsuario.tsx";
import AppLayout from "./components/AppLayout.tsx";
import { useAuthRedirect } from "./pages/useAuthRedirect";
import Favoritos from './pages/Favoritos';


function App() {
    useAuthRedirect();
    return (
            <div style={{height: '100%', overflowY: 'auto', backgroundColor: '#F4F5F9'}}>
                <Routes>
                    {/* Redirige la raíz a la página de login */}
                    <Route path="/" element={<Navigate to="/login"/>}/>

                    {/* Página de login */}
                    <Route path="/login" element={<LoginPage/>}/>

                    {/* Página de registro */}
                    <Route path="/register" element={<RegisterPage/>}/>


                    <Route path="/admin/:id_servicio" element={<HomeAdministrador/>}/>


                    <Route element={<AppLayout />}>
                        <Route path="/entidades" element={<EntidadesTabs />} />
                        <Route path="/home/:id_servicio" element={<HomeServicioUsuario />} />
                        <Route path="/carrito" element={<Carrito />} />
                        <Route path="/mis-pedidos" element={<MisPedidosUsuario />} />
                        <Route path="/perfil" element={<MyProfilePage />} />
                        <Route path="/producto/:id_producto" element={<ProductoDetalle />} />
                        <Route path="/entidad/:id_entidad" element={<ServiciosEntidad/>}/>
                        <Route path="/favoritos" element={<Favoritos/>}/>
                    </Route>

                </Routes>
            </div>
);
}

export default App;