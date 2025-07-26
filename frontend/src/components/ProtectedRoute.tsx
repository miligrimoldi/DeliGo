import React from 'react';
import { Navigate } from 'react-router-dom';

type Props = {
    children: React.ReactNode;
    onlyEmployee?: boolean;
    onlyUser?: boolean;
    onlyAdmin?: boolean;
};

const ProtectedRoute: React.FC<Props> = ({ children, onlyEmployee = false, onlyUser = false, onlyAdmin = false }) => {
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;

    if (!user) return <Navigate to="/login" replace />;

    const isAdmin = user.esAdmin === true;
    const isEmployee = user.tipo === "empleado";
    const isConsumer = !isEmployee; // por ahora solo hay empleados o consumidores

    // 🔒 Rutas solo admin
    if (onlyAdmin) {
        if (!isAdmin) {
            if (isEmployee) return <Navigate to={`/empleado/${user.id_servicio}`} replace />;
            return <Navigate to="/entidades" replace />; // consumidor
        }
    }

    // 🔒 Rutas solo empleado
    if (onlyEmployee) {
        if (!isEmployee) {
            if (isAdmin) return <Navigate to={`/empleado/${user.id_servicio}`} replace />;
            return <Navigate to="/entidades" replace />; // consumidor
        }
    }

    // 🔒 Rutas solo consumidor
    if (onlyUser) {
        if (!isConsumer) {
            if (isAdmin) return <Navigate to={`/empleado/${user.id_servicio}`} replace />;
            return <Navigate to={`/empleado/${user.id_servicio}`} replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
