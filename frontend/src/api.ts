import axios from 'axios';
import { Entidad } from './pages/EntitiesTabs.tsx';

const API_URL = 'http://127.0.0.1:5000';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Endpoints
export const fetchEntidades = async (): Promise<Entidad[]> => {
    const response = await api.get('/api/entidades');
    return response.data;
};

export const fetchMisEntidades = async (id_usuario: number): Promise<Entidad[]> => {
    const response = await api.get(`/api/entidades/usuario/${id_usuario}`);
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

export const desasociarAEntidad = async (id_usuario: number, id_entidad: number) => {
    const response = await fetch("http://localhost:5000/api/desasociar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario, id_entidad })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Error al desasociar");
    }

    return response.json();
};

export type LoginResponse = {
    id_usuario: string;
    email: string;
    nombre: string;
    apellido: string;
    esAdmin: boolean;
    id_servicio?: string;
    access_token: string;
};

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/login", {
        email,
        password
    });

    const data = response.data;

    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data));
    console.log("Login exitoso, token guardado:", data.access_token);

    return data;
}

export type RegisterData = {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    esAdmin: boolean;
    id_servicio?: string;
    dni?: string;
};

export async function registerUser(data: RegisterData): Promise<{ message: string }> {
    const response = await api.post("/register", data);
    return response.data;
}