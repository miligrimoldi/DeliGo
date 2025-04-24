import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const useAuthRedirect = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem("token");

        // Si no hay token y se intenta acceder a una ruta protegida:
        const isProtectedRoute = !['/login', '/register'].includes(location.pathname);
        if (!token && isProtectedRoute) {
            navigate('/login');
        }

        // Si hay token, evitá que acceda a login o register
        if (token && (location.pathname === '/login' || location.pathname === '/register')) {
            navigate('/entidades'); // o a donde quieras mandarlo por defecto
        }
    }, [location.pathname, navigate]);
};
