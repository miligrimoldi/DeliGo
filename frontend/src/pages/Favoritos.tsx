import { useEffect, useState} from 'react';
import {
    fetchFavoritosServicios,
    fetchFavoritosProductos,
    fetchServicio,
    fetchProductoPorId,
    agregarFavoritoServicio,
    eliminarFavoritoServicio,
    agregarFavoritoProducto,
    eliminarFavoritoProducto
} from '../api';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

export type Servicio = {
    id_servicio: number;
    nombre: string;
};

export type Producto = {
    id_producto: number;
    nombre: string;
    descripcion: string;
    foto: string;
    nombre_entidad: string;
};

const Favoritos = () => {
    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [serviciosIds, setServiciosIds] = useState<number[]>([]);
    const [productosIds, setProductosIds] = useState<number[]>([]);

    useEffect(() => {
        const cargarFavoritos = async () => {
            try {
                const serviciosFavoritos = await fetchFavoritosServicios();
                const productosFavoritos = await fetchFavoritosProductos();

                setServiciosIds(serviciosFavoritos);
                setProductosIds(productosFavoritos);

                const detallesServicios: Servicio[] = await Promise.all(serviciosFavoritos.map(fetchServicio));
                const detallesProductos: Producto[] = await Promise.all(productosFavoritos.map(fetchProductoPorId));

                setServicios(detallesServicios);
                setProductos(detallesProductos);
            } catch (error) {
                console.error("Error al cargar favoritos:", error);
            }
        };

        cargarFavoritos();
    }, []);

    const toggleServicio = async (id: number) => {
        if (serviciosIds.includes(id)) {
            await eliminarFavoritoServicio(id);
            setServicios(prev => prev.filter(s => s.id_servicio !== id));
            setServiciosIds(prev => prev.filter(sid => sid !== id));
        } else {
            await agregarFavoritoServicio(id);
            const nuevo = await fetchServicio(id);
            setServicios(prev => [...prev, nuevo]);
            setServiciosIds(prev => [...prev, id]);
        }
    };

    const toggleProducto = async (id: number) => {
        if (productosIds.includes(id)) {
            await eliminarFavoritoProducto(id);
            setProductos(prev => prev.filter(p => p.id_producto !== id));
            setProductosIds(prev => prev.filter(pid => pid !== id));
        } else {
            await agregarFavoritoProducto(id);
            const nuevo = await fetchProductoPorId(id);
            setProductos(prev => [...prev, nuevo]);
            setProductosIds(prev => [...prev, id]);
        }
    };

    return (
        <div style={{ backgroundColor: '#F4F5F9', minHeight: '100vh' }}>
            {/* Header fijo */}
            <div
                style={{
                    backgroundColor: 'white',
                    paddingTop: 50,
                    paddingBottom: 20,
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
            >
                <div
                    style={{
                        maxWidth: "768px",
                        margin: '0 auto',
                        padding: '0 20px'
                    }}
                >
                    <h2
                        style={{
                            fontSize: 19,
                            fontFamily: 'Poppins',
                            fontWeight: 500,
                            letterSpacing: '0.54px',
                            margin: 0,
                            textAlign: "center"
                        }}
                    >
                        Mis Favoritos
                    </h2>
                </div>
            </div>

            {/* Contenido scrolleable */}
            <div style={{ paddingBottom: 60 }}>
                <div style={{ maxWidth: "600px", margin: '0 auto', padding: '0 20px', minWidth:'500px' }}>
                    <section style={{ marginTop: 20 }}>
                        <h3 style={{ fontFamily: 'Poppins', color: '#4B614C', fontSize: 18 }}>Servicios</h3>
                        {servicios.map(serv => (
                            <div
                                key={serv.id_servicio}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: '#fff',
                                    padding: 10,
                                    borderRadius: 10,
                                    marginBottom: 10
                                }}
                            >
                                <span style={{ fontFamily: 'Poppins', fontSize: 15 }}>{serv.nombre}</span>
                                <span onClick={() => toggleServicio(serv.id_servicio)} style={{ cursor: 'pointer' }}>
                                {serviciosIds.includes(serv.id_servicio)
                                    ? <FaHeart color="#4B614C" />
                                    : <FaRegHeart color="grey" />}
                            </span>
                            </div>
                        ))}
                    </section>

                    <section style={{ marginTop: 30 }}>
                        <h3 style={{ fontFamily: 'Poppins', color: '#4B614C', fontSize: 18 }}>Productos</h3>
                        {productos.map(prod => (
                            <div
                                key={prod.id_producto}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: '#fff',
                                    padding: 10,
                                    borderRadius: 10,
                                    marginBottom: 10
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <img
                                        src={prod.foto}
                                        alt="foto"
                                        style={{ width: 40, height: 30, borderRadius: 5 }}
                                    />
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontFamily: 'Poppins', fontSize: 15 }}>{prod.nombre_entidad}</span>
                                        <span style={{ fontFamily: 'Poppins', fontSize: 14, color: '#444' }}>{prod.nombre}</span>
                                    </div>
                                </div>
                                <span onClick={() => toggleProducto(prod.id_producto)} style={{ cursor: 'pointer' }}>
                                {productosIds.includes(prod.id_producto)
                                    ? <FaHeart color="#4B614C" />
                                    : <FaRegHeart color="grey" />}
                            </span>
                            </div>
                        ))}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Favoritos;
