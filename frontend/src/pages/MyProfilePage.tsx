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

const MyProfilePage = () => {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const fullName = `${user.nombre || 'Nombre'} ${user.apellido || 'Apellido'}`;
    const email = user.email || 'email@ejemplo.com';

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <div className="perfil-container">
            <h3 className="user-name">{fullName}</h3>
            <p className="user-email">{email}</p>

            <div className="perfil-opciones">
                <div className="perfil-item" onClick={() => navigate('/editar-perfil')}>
                    <FaUserEdit className="perfil-icon"/> Editar perfil
                </div>
                <div className="perfil-item" onClick={() => navigate('/mis-pedidos')}>
                    <FaBox className="perfil-icon"/> Mis pedidos
                </div>
                <div className="perfil-item" onClick={() => navigate('/favoritos')}>
                    <FaHeart className="perfil-icon"/> Mis favoritos
                </div>
                <div className="perfil-item" onClick={() => navigate('/entidades', {state: {tab: 'mis'}})}>
                    <FaBuilding className="perfil-icon"/> Mis entidades
                </div>
                <div className="cerrar-sesion-item" onClick={handleLogout}>
                    <FaSignOutAlt  className="cerrar-sesion-icon"/> Cerrar sesión
                </div>
            </div>

            <button
                className="eliminar-cuenta-btn"
                onClick={async () => {
                    const confirmar = window.confirm("¿Estás seguro de que querés eliminar tu cuenta?");
                    if (!confirmar) return;

                    try {
                        await eliminarCuenta();
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        window.location.href = "/login";
                    } catch (err: any) {
                        alert("Error al eliminar cuenta");
                    }
                }}
            >
                Eliminar cuenta
            </button>

        </div>
    );
};

export default MyProfilePage;
