import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type ItemCarrito = {
    id_producto: number;
    nombre: string;
    precio_actual: number;
    cantidad: number;
    foto: string;
    id_servicio: number;
    nombre_servicio: string;
    precio_original?: number;
    tiempo_limite?: string | null;
};

type CarritoPorServicio = {
    [id_servicio: number]: ItemCarrito[];
};

type CarritoContextType = {
    items: ItemCarrito[];
    agregarItem: (id_servicio: number, item: ItemCarrito) => void;
    modificarCantidad: (id_servicio: number, id_producto: number, cantidad: number) => void;
    eliminarItem: (id_servicio: number, id_producto: number) => void;
    vaciarCarrito: (id_servicio: number) => void;
    total: number;
    setServicioActivo: (id_servicio: number) => void;
    servicioActivo: number | null;
};

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

export const CarritoProvider = ({ children }: { children: ReactNode }) => {
    const [carritos, setCarritos] = useState<CarritoPorServicio>({});
    const [servicioActivo, setServicioActivo] = useState<number | null>(null);

    const id_usuario = Number(localStorage.getItem("id_usuario"));

    useEffect(() => {
        if (!id_usuario) return;
        const data = localStorage.getItem(`carritos_${id_usuario}`);
        if (data) setCarritos(JSON.parse(data));
    }, [id_usuario]);

    useEffect(() => {
        if (!id_usuario) return;
        localStorage.setItem(`carritos_${id_usuario}`, JSON.stringify(carritos));
    }, [carritos, id_usuario]);


    const items = servicioActivo !== null ? carritos[servicioActivo] || [] : [];

    const agregarItem = (id_servicio: number, nuevoItem: ItemCarrito) => {
        setServicioActivo(id_servicio);
        setCarritos(prev => {
            const prevItems = prev[id_servicio] || [];
            const existente = prevItems.find(item => item.id_producto === nuevoItem.id_producto);
            const nuevosItems = existente
                ? prevItems.map(item =>
                    item.id_producto === nuevoItem.id_producto
                        ? { ...item, cantidad: item.cantidad + nuevoItem.cantidad }
                        : item
                )
                : [...prevItems, nuevoItem];
            return { ...prev, [id_servicio]: nuevosItems };
        });
    };

    const modificarCantidad = (id_servicio: number, id_producto: number, cantidad: number) => {
        setCarritos(prev => {
            const nuevos = (prev[id_servicio] || [])
                .map(item =>
                    item.id_producto === id_producto ? { ...item, cantidad } : item
                )
                .filter(item => item.cantidad > 0);
            return { ...prev, [id_servicio]: nuevos };
        });
    };

    const eliminarItem = (id_servicio: number, id_producto: number) => {
        setCarritos(prev => {
            const nuevos = (prev[id_servicio] || []).filter(item => item.id_producto !== id_producto);
            return { ...prev, [id_servicio]: nuevos };
        });
    };

    const vaciarCarrito = (id_servicio: number) => {
        setCarritos(prev => {
            const nuevo = { ...prev };
            delete nuevo[id_servicio];
            return nuevo;
        });
    };

    const total = items.reduce((acc, item) => acc + item.precio_actual * item.cantidad, 0);

    return (
        <CarritoContext.Provider value={{ items, agregarItem, modificarCantidad, eliminarItem, vaciarCarrito, total, setServicioActivo, servicioActivo }}>
            {children}
        </CarritoContext.Provider>
    );
};

export const useCarrito = () => {
    const context = useContext(CarritoContext);
    if (!context) throw new Error('useCarrito debe usarse dentro de un CarritoProvider');
    return context;
};
