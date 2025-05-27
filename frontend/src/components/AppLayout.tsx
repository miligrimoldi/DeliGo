import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { FaHome, FaUser, FaHeart, FaBox, FaComments } from 'react-icons/fa';
import Chatbot from './Chatbot';

const AppLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showChat, setShowChat] = useState(false);
    const chatRef = useRef<HTMLDivElement>(null);

    const ocultarBarra = ['/carrito', '/opinar', '/desperdicio'].some(path =>
        location.pathname.startsWith(path)
    );

    const homePrefixes = ['/home', '/entidades', '/producto', '/entidad'];

    useEffect(() => {
        if (homePrefixes.some(prefix => location.pathname.startsWith(prefix))) {
            localStorage.setItem('lastHomeRoute', location.pathname);
        }
    }, [location]);

    // Cierra el chat si hacés clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
                setShowChat(false);
            }
        };

        if (showChat) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showChat]);

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
                <>
                    <div
                        onClick={() => setShowChat(!showChat)}
                        style={{
                            position: 'fixed',
                            bottom: '80px',
                            right: '20px',
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            backgroundColor: '#4B614C',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                            zIndex: 1100
                        }}
                    >
                        <FaComments size={22}/>
                    </div>

                    {showChat && (
                        <div
                            ref={chatRef}
                            style={{
                                position: 'fixed',
                                bottom: '140px',
                                right: '20px',
                                width: '360px',
                                height: '480px',
                                backgroundColor: 'white',
                                border: '1px solid #ccc',
                                borderRadius: '12px',
                                boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                                zIndex: 1100,
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                padding: '4px 8px',
                                borderBottom: '1px solid #ddd',
                                backgroundColor: '#f5f5f5'
                            }}>
                                <button
                                    onClick={() => setShowChat(false)}
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        fontSize: 16,
                                        cursor: 'pointer'
                                    }}
                                >
                                </button>
                            </div>

                            <div style={{flex: 1}}>
                                <Chatbot/>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Barra de navegación inferior */}
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
