import { useEffect, useState } from 'react';
import { api } from '../api';

interface User {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
}

const UserList = ({ onEdit }: { onEdit: (user: User) => void }) => {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const res = await api.get('/usuarios');
        setUsers(res.data);
    };

    const deleteUser = async (id: number) => {
        if (confirm('¿Estás seguro?')) {
            await api.delete(`/usuarios/${id}`);
            fetchUsers();
        }
    };

    return (
        <ul className="list-group">
            {users.map((user) => (
                <li key={user.id} className="list-group-item d-flex justify-content-between">
                    <span>{user.nombre} {user.apellido} - {user.email}</span>
                    <div>
                        <button className="btn btn-warning btn-sm me-2" onClick={() => onEdit(user)}>Editar</button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteUser(user.id)}>Borrar</button>
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default UserList;
