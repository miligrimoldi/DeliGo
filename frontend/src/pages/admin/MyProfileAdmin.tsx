import React from 'react';
import { FaSignOutAlt, FaCamera } from 'react-icons/fa';
import '../../css/perfil.css';

const MyProfileAdmin: React.FC = () => {

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const fullName = `${user.nombre || 'Nombre'} ${user.apellido || 'Apellido'}`;
    const email = user.email || 'email@ejemplo.com';
    const profilePhoto = "/img/PERFIL-VACIO.png";

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


            <button className="cerrar-sesion-btn" onClick={handleLogout}>
                <FaSignOutAlt className="perfil-icon" /> Cerrar sesión
            </button>
        </div>
    );
};

export default MyProfileAdmin;
