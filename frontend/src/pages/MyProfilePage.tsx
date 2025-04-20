import { useNavigate } from 'react-router-dom';
import {
    FaUserEdit,
    FaBox,
    FaHeart,
    FaBuilding,
    FaSignOutAlt,
    FaCamera
} from 'react-icons/fa';
import '../css/perfil.css';

const MyProfilePage = () => {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const fullName = `${user.nombre || 'Nombre'} ${user.apellido || 'Apellido'}`;
    const email = user.email || 'email@ejemplo.com';
    const profilePhoto = "/img/PERFIL-VACIO.png"

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <div className="perfil-container">

            <div className="profile-picture-wrapper">
                <img src={profilePhoto} alt="Foto de perfil" className="profile-picture" />
                <div className="camera-icon">
                    <FaCamera />
                </div>
            </div>

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
                <div className="perfil-item" onClick={() => navigate('/entidades', {state: {tab: 'mis'}})}>
                    <FaBuilding className="perfil-icon"/> Mis entidades
                </div>
            </div>

            <button className="cerrar-sesion-btn" onClick={handleLogout}>
            <FaSignOutAlt className="perfil-icon" /> Cerrar sesión
            </button>
        </div>
    );
};

export default MyProfilePage;
