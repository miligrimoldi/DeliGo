import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type ItemCarrito = {
    id_producto: number;
    nombre: string;
    precio_actual: number;
    cantidad: number;
    foto: string;
};

type CarritoContextType = {
    items: ItemCarrito[];
    agregarItem: (item: ItemCarrito) => void;
    modificarCantidad: (id: number, cantidad: number) => void;
    eliminarItem: (id: number) => void;
    vaciarCarrito: () => void;
    total: number;
};

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

export const CarritoProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<ItemCarrito[]>([]);

    // Cargar desde localStorage
    useEffect(() => {
        const data = localStorage.getItem('carrito');
        if (data) {
            setItems(JSON.parse(data));
        }
    }, []);

    // Guardar en localStorage al cambiar
    useEffect(() => {
        localStorage.setItem('carrito', JSON.stringify(items));
    }, [items]);

    const agregarItem = (nuevoItem: ItemCarrito) => {
        setItems(prev => {
            const existente = prev.find(item => item.id_producto === nuevoItem.id_producto);
            if (existente) {
                return prev.map(item =>
                    item.id_producto === nuevoItem.id_producto
                        ? { ...item, cantidad: item.cantidad + nuevoItem.cantidad }
                        : item
                );
            }
            return [...prev, nuevoItem];
        });
    };

    const modificarCantidad = (id: number, cantidad: number) => {
        setItems(prev =>
            prev.map(item =>
                item.id_producto === id ? { ...item, cantidad } : item
            ).filter(item => item.cantidad > 0)
        );
    };

    const eliminarItem = (id: number) => {
        setItems(prev => prev.filter(item => item.id_producto !== id));
    };

    const vaciarCarrito = () => setItems([]);

    const total = items.reduce((acc, item) => acc + item.precio_actual * item.cantidad, 0);

    return (
        <CarritoContext.Provider value={{ items, agregarItem, modificarCantidad, eliminarItem, vaciarCarrito, total }}>
            {children}
        </CarritoContext.Provider>
    );
};

export const useCarrito = () => {
    const context = useContext(CarritoContext);
    if (!context) throw new Error('useCarrito debe usarse dentro de un CarritoProvider');
    return context;
};
