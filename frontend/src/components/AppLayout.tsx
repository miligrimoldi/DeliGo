import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaUser, FaHeart, FaShoppingBag } from 'react-icons/fa';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path: string) => {
        return location.pathname.startsWith(path);
    };

    return (
        <div style={{ paddingBottom: '80px' }}>
            {/* Contenido de la página envuelta */}
            {children}

            {/* Barra de navegación flotante */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: '80px',
                backgroundColor: 'white',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                boxShadow: '0 -2px 6px rgba(0, 0, 0, 0.1)',
                zIndex: 1000
            }}>
                {/* Botón Home */}
                <div onClick={() => navigate('/home/1')} style={{ cursor: 'pointer' }}>
                    <FaHome size={24} color={isActive('/home') ? '#4B614C' : '#999'} />
                </div>

                {/* Botón Perfil */}
                <div onClick={() => navigate('/perfil')} style={{ cursor: 'pointer' }}>
                    <FaUser size={24} color={isActive('/perfil') ? '#4B614C' : '#999'} />
                </div>

                {/* Botón Favoritos */}
                <div onClick={() => navigate('/favoritos')} style={{ cursor: 'pointer' }}>
                    <FaHeart size={24} color={isActive('/favoritos') ? '#4B614C' : '#999'} />
                </div>

                {/* Botón Compras*/}
                <div onClick={() => navigate('/compras')} style={{
                    cursor: 'pointer',
                    backgroundColor: isActive('/compras') ? '#B1C89A' : 'transparent',
                    borderRadius: '50%',
                    padding: '12px',
                    boxShadow: isActive('/compras') ? '0 4px 4px rgba(108, 197, 29, 0.26)' : 'none'
                }}>
                    <FaShoppingBag size={24} color={isActive('/compras') ? 'white' : '#999'} />
                </div>
            </div>
        </div>
    );
};

export default AppLayout;
