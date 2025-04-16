import axios from 'axios';
import { Entidad } from './pages/EntitiesTabs.tsx';

const API_URL = 'http://127.0.0.1:5000';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token && config.headers) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        console.log("Request headers:", config.headers);
        return config;
    },
    (error) => Promise.reject(error)
);

// Endpoints
export const fetchEntidades = async (): Promise<Entidad[]> => {
    const response = await api.get('/api/entidades');
    return response.data;
};

export const fetchMisEntidades = async (): Promise<Entidad[]> => {
    const response = await api.get('/api/entidades/usuario');
    return response.data;
};

export const asociarAEntidad = async (id_entidad: number) => {
    const response = await api.post('/api/asociar', { id_entidad });
    return response.data;
};

export const desasociarAEntidad = async (id_entidad: number) => {
    const response = await api.post('/api/desasociar', { id_entidad });
    return response.data;
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

export type Servicio = {
    id_servicio: number;
    nombre: string;
    descripcion: string;
};

export const fetchServiciosEntidad = async (id_entidad: number): Promise<Servicio[]> => {
    const response = await api.get(`/api/entidades/${id_entidad}/servicios`);
    return response.data;
};


export const getDetalleServicio = async (id_servicio: number) => {
    const res = await fetch(`http://localhost:5000/api/servicio/${id_servicio}`);
    return res.json(); // { servicio, entidad, categorias }
};