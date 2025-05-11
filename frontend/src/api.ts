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
        const isLoginRequest = error.config?.url?.includes('/login');

        // Solo redireccionamos si no es un intento de login
        if (error.response?.status === 401 && !isLoginRequest) {
            localStorage.setItem("redirectAfterLogin", window.location.pathname);
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
    tipo: "empleado" | "consumidor";
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

    puntaje_promedio?: number;
    cantidad_opiniones?: number;
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
    const response = await api.get(`/empleado/servicio/${id_servicio}`, {
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
    const response = await api.get(`/empleado/servicio/${id_servicio}/categorias`, {
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
    nombre_servicio?: string;
    puntaje_promedio?: number;
    cantidad_opiniones?: number;
}

export const fetchProductosPorCategoria = async (id_servicio: number, id_categoria: number): Promise<Producto[]> => {
    const response = await api.get(`/empleado/servicio/${id_servicio}/categoria/${id_categoria}/productos`, {
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
        `/empleado/servicio/${id_servicio}/categoria/${id_categoria}/producto`,
        producto
    );
    return { ...producto, id_producto: response.data.id_producto };
};

export const getDetalleServicio = async (id_servicio: number) => {
    const response = await api.get(`/api/servicio/${id_servicio}`);
    return response.data;
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
    tiempo_estimado_minutos?: number;
    email_usuario: string,
    detalles: DetallePedido[];
};

// Nuevo

export const fetchPedidosPorServicio = async (id_servicio: number): Promise<PedidoConDetalles[]> => {
    const response = await api.get(`/servicios/${id_servicio}/pedidos`);
    return response.data;
};

export const cambiarEstadoPedido = async (id_pedido: number, nuevoEstado: string, tiempo_estimado_minutos?: number): Promise<void> => {
    const data: any = { estado: nuevoEstado };
    if (nuevoEstado === "en_preparacion" && tiempo_estimado_minutos !== undefined) {
        data.tiempo_estimado_minutos = tiempo_estimado_minutos;
    }
    await api.put(`/pedidos/${id_pedido}/estado`, data);
};

export const eliminarProducto = async (id_producto: number): Promise<void> => {
    await api.delete(`/empleado/producto/${id_producto}`);
}

export const modificarProducto = async (id_producto: number, data: Partial<Producto>)=> {
    const res = await api.put(`/empleado/producto/${id_producto}`, data);
    return res.data
}

export const fetchFavoritosServicios = async (): Promise<number[]> => {
    const response = await api.get('/api/favoritos/servicios');
    return response.data;
};

export const agregarFavoritoServicio = async (id_servicio: number): Promise<void> => {
    await api.post('/api/favoritos/servicios', { id_servicio });
};

export const eliminarFavoritoServicio = async (id_servicio: number): Promise<void> => {
    await api.delete('/api/favoritos/servicios', {
        data: { id_servicio }
    });
};

export const fetchFavoritosProductos = async (): Promise<number[]> => {
    const response = await api.get('/api/favoritos/productos');
    return response.data;
};

export const agregarFavoritoProducto = async (id_producto: number): Promise<void> => {
    await api.post('/api/favoritos/productos', { id_producto });
};

export const eliminarFavoritoProducto = async (id_producto: number): Promise<void> => {
    await api.delete('/api/favoritos/productos', {
        data: { id_producto }
    });
};

export const fetchServicio = async (id_servicio: number): Promise<Servicio> => {
    const response = await api.get(`/api/servicio/${id_servicio}`);
    return response.data.servicio;
};

export const cambiarContrasena = async (data: { actual: string, nueva: string, confirmar: string }) => {
    const response = await api.put('/api/usuario/contrasena', data);
    return response.data;
};

export const eliminarCuenta = async () => {
    const response = await api.delete('/api/usuario');
    return response.data;
};

export type Empleado = {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    dni: string;
    esAdmin: boolean;
};

export const fetchEmpleados = async (id_servicio: number): Promise<Empleado[]> => {
    const response = await api.get(`/servicios/${id_servicio}/empleados`);
    return response.data;
};

export const crearEmpleado = async (id_servicio: number, data: Omit<Empleado, 'id'> & { contrasena: string }) => {
    const response = await api.post(`/servicios/${id_servicio}/empleados`, data);
    return response.data;
};


export const modificarEmpleado = async (id_servicio: number, id_empleado: number, data: Partial<Empleado>) => {
    const response = await api.put(`/servicios/${id_servicio}/empleados/${id_empleado}`, data);
    return response.data;
};

export const eliminarEmpleado = async (id_servicio: number, id_empleado: number) => {
    const response = await api.delete(`/servicios/${id_servicio}/empleados/${id_empleado}`);
    return response.data;
};

// Logica de ingredientes
export const asociarIngredientesAProducto = async (
    id_producto: number,
    ingredientes: string[]
) => {
    try {
        const response = await api.post(`/productos/${id_producto}/ingredientes`, {
            ingredientes,
        });
        return response.data;
    } catch (error) {
        console.error("Error al asociar ingredientes al producto:", error);
        throw error;
    }
};

// Logica de manejo de stock
export const getStock = async (id_servicio: number) => {
    try {
        const response = await api.get(`/stock/${id_servicio}`);
        return response.data.map((item: any) => ({
            idIngrediente: item.id_ingrediente,
            nombre: item.nombre,
            disponible: item.disponible,
        }));
    } catch (error) {
        console.error("Error al obtener el stock:", error);
        throw error;
    }
};


export const updateStockDisponibilidad = async (
    id_servicio: number,
    id_ingrediente: number,
    disponible: boolean
) => {
    const response = await api.put(`stock/${id_servicio}/${id_ingrediente}`, {
        disponible
    });
    return response.data;
};








