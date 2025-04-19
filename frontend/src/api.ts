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

export type ServicioInfor = {
    nombre_servicio: string;
    nombre_entidad: string;
};

export const fetchServicioAdmin = async (id_servicio: number ): Promise<ServicioInfor> => {
    const response = await api.get(`/admin/servicio/${id_servicio}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });

    return response.data;
};

export type Categoria = {
    id_categoria: number;
    nombre: string;
};

export const fetchCategoriasPorServicio = async (id_servicio: number): Promise<Categoria[]> => {
    const response = await api.get(`/admin/servicio/${id_servicio}/categorias`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    return response.data;
};

export type Producto = {
    id_producto: number;
    nombre: string;
    descripcion: string;
    informacion_nutricional: string;
    precio_actual: number;
    foto: string;
}

export const fetchProductosPorCategoria = async (id_servicio: number, id_categoria: number): Promise<Producto[]> => {
    const response = await api.get(`/admin/servicio/${id_servicio}/categoria/${id_categoria}/productos`, {
        headers:{
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },

    });
    return response.data;
};

export const crearProducto = async (
    id_servicio: number,
    id_categoria: number,
    producto: Omit<Producto, 'id_producto'>
): Promise<Producto> => {
    const response = await api.post(
        `/admin/servicio/${id_servicio}/categoria/${id_categoria}/producto`,
        producto
    );
    return response.data;
};




