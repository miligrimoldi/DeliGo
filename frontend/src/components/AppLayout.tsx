import React, { useEffect } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { FaHome, FaUser, FaHeart, FaBox } from 'react-icons/fa';

const AppLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const ocultarBarra = ['/carrito', '/opinar'].some(path => location.pathname.startsWith(path));


    const homePrefixes = ['/home', '/entidades', '/producto', '/entidad'];

    // Guarda la ultima ruta (para los home)
    useEffect(() => {
        if (homePrefixes.some(prefix => location.pathname.startsWith(prefix))) {
            localStorage.setItem('lastHomeRoute', location.pathname);
        }
    }, [location]);

    const isActive = (paths: string[]) => {
        return paths.some(path => location.pathname.startsWith(path));
    };

    const buttonStyle = (paths: string[]) => ({
        cursor: 'pointer',
        backgroundColor: isActive(paths) ? '#4B614C' : 'transparent',
        borderRadius: '45%',
        padding: '9px',
        boxShadow: isActive(paths) ? '0 4px 4px rgba(108, 197, 29, 0.26)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    });

    const iconColor = (paths: string[]) => (isActive(paths) ? 'white' : '#999');

    return (
        <div style={{ paddingBottom: '80px' }}>
            <Outlet />

            {!ocultarBarra && (
                <div style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '60px',
                    backgroundColor: 'white',
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    boxShadow: '0 -2px 6px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000
                }}>
                <div
                    onClick={() => {
                        const lastHome = localStorage.getItem('lastHomeRoute') || '/home/1';
                        navigate(lastHome);
                    }}
                    style={buttonStyle(homePrefixes)}
                >
                    <FaHome size={20} color={iconColor(homePrefixes)} />
                </div>

                <div onClick={() => navigate('/perfil')} style={buttonStyle(['/perfil'])}>
                    <FaUser size={20} color={iconColor(['/perfil'])} />
                </div>

                <div onClick={() => navigate('/favoritos')} style={buttonStyle(['/favoritos'])}>
                    <FaHeart size={20} color={iconColor(['/favoritos'])} />
                </div>

                <div onClick={() => navigate('/mis-pedidos')} style={buttonStyle(['/mis-pedidos'])}>
                    <FaBox size={20} color={iconColor(['/mis-pedidos'])} />
                </div>
                </div>
            )}
        </div>
    );
};

export default AppLayout;
