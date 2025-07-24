import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const useAuthRedirect = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("token");
            const path = location.pathname;

            const isPublicRoute =
                path === "/login" ||
                path === "/register" ||
                path === "/recuperar" ||
                path.startsWith("/reset-password");

            const isProtectedRoute = !isPublicRoute;

            if (!token && isProtectedRoute) {
                navigate('/login');
            }

            if (token && (path === '/login' || path === '/register' || path === '/recuperar' || path.startsWith("/reset-password"))) {
                navigate('/entidades');
            }
        };

        checkAuth();

        const onVisible = () => {
            if (document.visibilityState === "visible") {
                checkAuth();
            }
        };

        document.addEventListener("visibilitychange", onVisible);
        return () => document.removeEventListener("visibilitychange", onVisible);
    }, [location.pathname, navigate]);
};
