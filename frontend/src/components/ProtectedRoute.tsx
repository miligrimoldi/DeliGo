import React from 'react';
import { Navigate } from 'react-router-dom';

type Props = {
    children: React.ReactNode;
    onlyAdmin?: boolean;
    onlyUser?: boolean;
};

const ProtectedRoute: React.FC<Props> = ({ children, onlyAdmin = false, onlyUser = false }) => {
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;

    if (!user) return <Navigate to="/login" />;

    if (onlyAdmin && !user.esAdmin) return <Navigate to="/home/1" />;
    if (onlyUser && user.esAdmin) return <Navigate to="/admin/1" />;

    return <>{children}</>;
};

export default ProtectedRoute;
