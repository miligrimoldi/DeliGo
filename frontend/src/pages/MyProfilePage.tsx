import { useNavigate } from 'react-router-dom';
import {
    FaUserEdit,
    FaBox,
    FaHeart,
    FaBuilding,
    FaSignOutAlt,
} from 'react-icons/fa';
import '../css/perfil.css';
import { eliminarCuenta } from '../api';
import { useState } from 'react';

const MyProfilePage = () => {
    const navigate = useNavigate();
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const fullName = `${user.nombre || 'Nombre'} ${user.apellido || 'Apellido'}`;
    const email = user.email || 'email@ejemplo.com';

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const handleEliminar = async () => {
        try {
            await eliminarCuenta();
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        } catch (err: any) {
            alert("Error al eliminar cuenta");
        }
    };

    return (
        <div className="perfil-container">
            <h3 className="user-name">{fullName}</h3>
            <p className="user-email">{email}</p>

            <div className="perfil-opciones">
                <div className="perfil-item" onClick={() => navigate('/editar-perfil')}>
                    <FaUserEdit className="perfil-icon" /> Editar perfil
                </div>
                <div className="perfil-item" onClick={() => navigate('/mis-pedidos')}>
                    <FaBox className="perfil-icon" /> Mis pedidos
                </div>
                <div className="perfil-item" onClick={() => navigate('/favoritos')}>
                    <FaHeart className="perfil-icon" /> Mis favoritos
                </div>
                <div className="perfil-item" onClick={() => navigate('/entidades', { state: { tab: 'mis' } })}>
                    <FaBuilding className="perfil-icon" /> Mis entidades
                </div>
                <div className="cerrar-sesion-item" onClick={handleLogout}>
                    <FaSignOutAlt className="cerrar-sesion-icon" /> Cerrar sesión
                </div>
            </div>

            <button className="eliminar-cuenta-btn" onClick={() => setMostrarConfirmacion(true)}>
                Eliminar cuenta
            </button>

            {/* Modal de confirmación */}
            {mostrarConfirmacion && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        background: 'white',
                        padding: 20,
                        borderRadius: 10,
                        width: '90%',
                        maxWidth: 350,
                        fontFamily: 'Poppins',
                        textAlign: 'center'
                    }}>
                        <p style={{ marginBottom: 20 }}>¿Estás seguro de que querés eliminar tu cuenta?</p>
                        <button
                            style={{
                                backgroundColor: '#D0021B',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: 6,
                                border: 'none',
                                marginRight: 10,
                                cursor: 'pointer'
                            }}
                            onClick={handleEliminar}
                        >
                            Sí, eliminar
                        </button>
                        <button
                            style={{
                                backgroundColor: '#aaa',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: 6,
                                border: 'none',
                                cursor: 'pointer'
                            }}
                            onClick={() => setMostrarConfirmacion(false)}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyProfilePage;
