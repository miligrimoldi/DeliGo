import axios from 'axios';
import { Entidad } from './components/EntitiesTabs';

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

export const asociarAEntidad = async (idUsuario: number, idEntidad: number): Promise<void> => {
    await api.post('/api/entidades/asociar', {
        id_usuario: idUsuario,
        id_entidad: idEntidad
    });
};