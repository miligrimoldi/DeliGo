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

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Guarda la URL actual, para que el usuario vuelva a la pag donde estaba
            localStorage.setItem("redirectAfterLogin", window.location.pathname);

            // Limpiar token y redirigir
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            alert("Tu sesión ha expirado. Por favor, iniciá sesión nuevamente.");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
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

export type ItemCarrito = {
    id_producto: number;
    nombre: string;
    precio_actual: number;
    cantidad: number;
    foto: string;
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

export const fetchServiciosEntidad = async (
    id_entidad: number
): Promise<{ entidad: Entidad; servicios: Servicio[] }> => {
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
    ingredientes: string[];
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

export const getDetalleServicio = async (id_servicio: number) => {
    const response = await api.get(`/api/servicio/${id_servicio}`);
    return response.data; // { servicio, entidad, categorias }
};

export async function fetchProductoPorId(id: number) {
    const response = await api.get(`/api/productos/${id}`);
    return response.data;
}

export const realizarPedido = async (items: ItemCarrito[]) => {
    const response = await api.post('/api/pedidos', { items });
    return response.data;
};

export type DetallePedido = {
    id_detalle: number;
    cantidad: number;
    producto: {
        nombre: string;
    };
};

export type PedidoConDetalles = {
    id_pedido: number;
    estado: string;
    detalles: DetallePedido[];
};

export const fetchPedidosPorServicio = async (id_servicio: number): Promise<PedidoConDetalles[]> => {
    const response = await api.get(`/servicios/${id_servicio}/pedidos`);
    return response.data;
};

export const cambiarEstadoPedido = async (id_pedido: number, nuevoEstado: string): Promise<void> => {
    await api.put(`/pedidos/${id_pedido}/estado`, {
        estado: nuevoEstado,
    });
};




