import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type ItemCarrito = {
    id_producto: number;
    nombre: string;
    precio_actual: number;
    precio_oferta?: number;
    cantidad: number;
    cantidad_oferta?: number;
    cantidad_restante?: number;
    foto: string;
    id_servicio: number;
    nombre_servicio: string;
    precio_original?: number;
    tiempo_limite?: string | null;
    max_disponible?: number;
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
    setCarritos: React.Dispatch<React.SetStateAction<CarritoPorServicio>>;
    actualizarMaximoDisponible: (id_servicio: number, id_producto: number, max: number) => void;
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

            const nuevaCantidad = (existente?.cantidad || 0) + nuevoItem.cantidad;

            const tieneOferta = typeof nuevoItem.precio_oferta === 'number' && nuevoItem.cantidad_restante && nuevoItem.cantidad_restante > 0;
            const cantidadOferta = tieneOferta
                ? Math.min(nuevaCantidad, nuevoItem.cantidad_restante!)
                : 0;


            const nuevosItems = existente
                ? prevItems.map(item =>
                    item.id_producto === nuevoItem.id_producto
                        ? {
                            ...item,
                            cantidad: nuevaCantidad,
                            cantidad_oferta: cantidadOferta,
                            cantidad_restante: nuevoItem.cantidad_restante ?? item.cantidad_restante
                        }
                        : item
                )
                : [...prevItems, {
                    ...nuevoItem,
                    cantidad: nuevaCantidad,
                    cantidad_oferta: cantidadOferta
                }];

            return { ...prev, [id_servicio]: nuevosItems };
        });
    };

    const modificarCantidad = (id_servicio: number, id_producto: number, cantidad: number) => {
        setCarritos(prev => {
            const nuevos = (prev[id_servicio] || [])
                .map(item => {
                    if (item.id_producto === id_producto) {
                        const max = item.max_disponible ?? Infinity;
                        const nuevaCantidad = Math.min(cantidad, max);
                        const tieneOferta = typeof item.precio_oferta === 'number' && item.cantidad_restante && item.cantidad_restante > 0;
                        const cantidadOferta = tieneOferta
                            ? Math.min(nuevaCantidad, item.cantidad_restante!)
                            : 0;

                        return {
                            ...item,
                            cantidad: nuevaCantidad,
                            cantidad_oferta: cantidadOferta
                        };
                    }
                    return item;
                })
                .filter(item => item.cantidad > 0);

            return { ...prev, [id_servicio]: nuevos };
        });
    };

    const actualizarMaximoDisponible = (id_servicio: number, id_producto: number, max: number) => {
        setCarritos(prev => {
            const nuevos = (prev[id_servicio] || []).map(item =>
                item.id_producto === id_producto
                    ? { ...item, max_disponible: max }
                    : item
            );
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

    const total = items.reduce((acc, item) => {
        const cantidadOferta = item.cantidad_oferta ?? 0;
        const cantidadNormal = item.cantidad - cantidadOferta;

        const subtotalOferta = typeof item.precio_oferta === 'number'
            ? item.precio_oferta * cantidadOferta
            : 0;

        const subtotalNormal = item.precio_actual * cantidadNormal;

        return acc + subtotalOferta + subtotalNormal;
    }, 0);

    return (
        <CarritoContext.Provider value={{
            items,
            agregarItem,
            modificarCantidad,
            eliminarItem,
            vaciarCarrito,
            total,
            setServicioActivo,
            servicioActivo,
            setCarritos,
            actualizarMaximoDisponible
        }}>
            {children}
        </CarritoContext.Provider>
    );
};

export const useCarrito = () => {
    const context = useContext(CarritoContext);
    if (!context) throw new Error('useCarrito debe usarse dentro de un CarritoProvider');
    return context;
};
