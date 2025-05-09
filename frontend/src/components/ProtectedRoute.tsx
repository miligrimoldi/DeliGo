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

    if (!user) return <Navigate to="/login" />;

    if (onlyAdmin && !user.esAdmin) return <Navigate to={`/admin/${user.id_servicio}`} />;
    if (onlyEmployee && !(user.tipo === "empleado")) return <Navigate to="/home/1" />;
    if (onlyUser && (user.tipo === "empleado")) return <Navigate to="/admin/1" />;

    return <>{children}</>;
};

export default ProtectedRoute;
