import { useNavigate } from 'react-router-dom';
import {
    FaUserEdit,
    FaBox,
    FaHeart,
    FaBuilding,
    FaSignOutAlt
} from 'react-icons/fa';
import '../css/perfil.css';

const MyProfilePage = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <div className="perfil-container">
            <img src="/img/logo_con_deligo.png" alt="Logo Deligo" className="logo" />
            <h2 className="titulo">Mi Perfil</h2>

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
                <div className="perfil-item" onClick={() => navigate('/mis-entidades')}>
                    <FaBuilding className="perfil-icon" /> Mis entidades
                </div>
            </div>

            <button className="cerrar-sesion-btn" onClick={handleLogout}>
                <FaSignOutAlt className="perfil-icon" /> Cerrar sesión
            </button>
        </div>
    );
};

export default MyProfilePage;
