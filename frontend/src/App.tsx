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
import Favoritos from './pages/Favoritos.tsx';
import MyProfileAdmin from './pages/admin/MyProfileAdmin.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import PedidosAdmin from "./pages/admin/PedidosAdmin.tsx";
import EditarPerfil from "./pages/EditarPerfil.tsx";
import Opinar from "./pages/Opinar.tsx";

function App() {
    useAuthRedirect();

    return (
        <div style={{minHeight: '100vh', backgroundColor: '#F4F5F9'}}>
            <Routes>
                {/* Redirección inicial */}
                <Route path="/" element={<Navigate to="/login"/>}/>

                {/* Rutas públicas */}
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/register" element={<RegisterPage/>}/>

                {/* Rutas para Admin y Clientes */}
                <Route
                    path="/editar-perfil"
                    element={
                        <ProtectedRoute>
                            <EditarPerfil />
                        </ProtectedRoute>
                    }
                />

                {/* Admin protegidas */}
                <Route
                    path="/admin/:id_servicio"
                    element={
                        <ProtectedRoute onlyAdmin={true}>
                            <HomeAdministrador/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/:id_servicio/pedidos"
                    element={
                        <ProtectedRoute onlyAdmin={true}>
                            <PedidosAdmin/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin-perfil"
                    element={
                        <ProtectedRoute onlyAdmin={true}>
                            <MyProfileAdmin/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin-empleados"
                    element={
                        <ProtectedRoute onlyAdmin={true}>
                            <EmpleadosServicio/>
                        </ProtectedRoute>
                    }
                />

                {/* Clientes protegidas */}
                <Route
                    element={
                        <ProtectedRoute onlyUser={true}>
                            <AppLayout/>
                        </ProtectedRoute>
                    }
                >
                    <Route path="/entidades" element={<EntidadesTabs/>}/>
                    <Route path="/home/:id_servicio" element={<HomeServicioUsuario/>}/>
                    <Route path="/carrito/:id_servicio" element={<Carrito />} />
                    <Route path="/mis-pedidos" element={<MisPedidosUsuario/>}/>
                    <Route path="/perfil" element={<MyProfilePage/>}/>
                    <Route path="/producto/:id_producto" element={<ProductoDetalle/>}/>
                    <Route path="/entidad/:id_entidad" element={<ServiciosEntidad/>}/>
                    <Route path="/favoritos" element={<Favoritos/>}/>
                    <Route path="/opinar/:id" element={<Opinar />} />
                </Route>
            </Routes>
        </div>
    );
}

export default App;