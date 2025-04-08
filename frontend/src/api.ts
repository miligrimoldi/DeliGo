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
export const fetchMisEntidades = async (userId: number): Promise<Entidad[]> => {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:5000/api/entidades/usuario/${userId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return await response.json();
};

export const asociarAEntidad = async (id_entidad: number) => {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:5000/api/asociar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id_entidad }),
    });

    if (!response.ok) {
        const error = await response.json();
        console.error("Error al asociar:", error);
        throw new Error(error?.error || "Error en la solicitud");
    }

    return response.json();
};

export const desasociarAEntidad = async (id_usuario: number, id_entidad: number) => {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:5000/api/desasociar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id_usuario, id_entidad }),
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
    const response = await fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Error al iniciar sesión");
    }
    localStorage.setItem("token", data.access_token);
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
    const response = await fetch("/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw new Error(responseData.error || "Error al registrarse");
    }

    return responseData;
}


