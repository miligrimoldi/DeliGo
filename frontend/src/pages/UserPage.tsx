import UserList from '../components/UserList';
import UserForm from '../components/UserForm';
import { useState } from 'react';

const UsersPage = () => {
    const [refresh, setRefresh] = useState(false);

    return (
        <div className="container mt-5">
            <h1>📋 Lista de Usuarios</h1>
            <UserList onEdit={() => {}} />
            <h2>➕ Crear o Modificar Usuario</h2>
            <UserForm onUserSaved={() => setRefresh(!refresh)} />
        </div>
    );
};

export default UsersPage;
