import axios from 'axios';
import { Entidad } from './pages/EntitiesTabs.tsx';

const API_URL = 'http://127.0.0.1:5000';

export const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Retorna lista de entidades (Entidad[])
export const fetchEntidades = async (): Promise<Entidad[]> => {
    const response = await api.get('/api/entidades');
    return response.data;
};

// Retorna Entidad[], pero filtrado por el usuario
export const fetchMisEntidades = async (idUsuario: number): Promise<Entidad[]> => {
    const response = await api.get(`/api/entidades/usuario/${idUsuario}`);
    return response.data;
};

export const asociarAEntidad = async (id_usuario: number, id_entidad: number) => {
    const response = await fetch("http://localhost:5000/api/asociar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario, id_entidad })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Error en la solicitud");
    }

    return response.json();
};