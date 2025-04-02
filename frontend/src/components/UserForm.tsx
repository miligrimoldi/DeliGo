import { useState } from 'react';
import { api } from '../api';

interface User {
    id?: number;
    nombre: string;
    apellido: string;
    email: string;
    contrasena: string;
}

const UserForm = ({ onUserSaved }: { onUserSaved: () => void }) => {
    const [user, setUser] = useState<User>({ nombre: '', apellido: '', email: '', contrasena: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (user.id) {
            await api.put(`/usuarios/${user.id}`, user);
        } else {
            await api.post('/usuarios', user);
        }
        setUser({ nombre: '', apellido: '', email: '', contrasena: '' });
        onUserSaved();
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" name="nombre" className="form-control mb-2" placeholder="Nombre" onChange={handleChange} value={user.nombre} required />
            <input type="text" name="apellido" className="form-control mb-2" placeholder="Apellido" onChange={handleChange} value={user.apellido} required />
            <input type="email" name="email" className="form-control mb-2" placeholder="Email" onChange={handleChange} value={user.email} required />
            <input type="password" name="contrasena" className="form-control mb-2" placeholder="Contraseña" onChange={handleChange} value={user.contrasena} required />
            <button type="submit" className="btn btn-primary">Guardar</button>
        </form>
    );
};

export default UserForm;
