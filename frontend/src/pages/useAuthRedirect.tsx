import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const useAuthRedirect = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("token");
            const isProtectedRoute = !['/login', '/register'].includes(location.pathname);

            if (!token && isProtectedRoute) {
                navigate('/login');
            }

            if (token && (location.pathname === '/login' || location.pathname === '/register')) {
                navigate('/entidades');
            }
        };

        checkAuth(); // Ejecutar en mount y cambio de ruta

        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
                checkAuth(); // Ejecutar si vuelve a pestaña
            }
        });

        return () => {
            document.removeEventListener("visibilitychange", checkAuth);
        };
    }, [location.pathname, navigate]);
};

