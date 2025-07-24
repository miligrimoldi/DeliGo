import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FaArrowLeft, FaHeart, FaRegHeart } from 'react-icons/fa';
import {
    fetchProductoPorId,
    fetchFavoritosProductos,
    agregarFavoritoProducto,
    eliminarFavoritoProducto
} from '../api';
import { useCarrito } from '../pages/CarritoContext';
import EstrellasPuntaje from '../components/EstrellasPuntaje';

type Producto = {
    id_producto: number;
    nombre: string;
    descripcion: string;
    precio_actual: number;
    foto: string;
    id_servicio: number;
    puntaje_promedio?: number;
    cantidad_opiniones?: number;
    nombre_servicio?: string;
    ingredientes?: Ingrediente[];
    es_desperdicio_cero?: boolean;
    precio_oferta?: number;
    cantidad_restante?: number;
    tiempo_limite?: string | null;
    max_disponible?: number;
};

type Ingrediente = {
    id_ingrediente: number;
    nombre: string;
};


const ProductoDetalle = () => {
    const { id_producto } = useParams<{ id_producto: string }>();
    const navigate = useNavigate();
    const [producto, setProducto] = useState<Producto | null>(null);
    const [cantidad, setCantidad] = useState(1);
    const { agregarItem, items, setServicioActivo } = useCarrito();
    const [esFavorito, setEsFavorito] = useState(false);
    const [mostrarAvisoStock, setMostrarAvisoStock] = useState(false);

    const totalArticulos = items.reduce((sum, item) => sum + item.cantidad, 0);

    useEffect(() => {
        if (!id_producto) return;

        fetchProductoPorId(Number(id_producto))
            .then((data) => setProducto(data))
            .catch((error) => console.error('Error al obtener el producto:', error));

        fetchFavoritosProductos()
            .then((favoritos) => {
                setEsFavorito(favoritos.includes(Number(id_producto)));
            });
    }, [id_producto]);

    useEffect(() => {
        if (producto?.id_servicio) {
            setServicioActivo(producto.id_servicio);
        }
    }, [producto]);

    useEffect(() => {
        localStorage.setItem('lastFromCarrito', window.location.pathname);
    }, []);

    useEffect(() => {
        if (producto?.max_disponible !== undefined && cantidad === producto.max_disponible) {
            setMostrarAvisoStock(true);
            const timeoutId = setTimeout(() => {
                setMostrarAvisoStock(false);
            }, 3000);
            return () => clearTimeout(timeoutId);
        }
    }, [cantidad, producto?.max_disponible]);


    const aumentarCantidad = () => {
        if (producto?.max_disponible && cantidad < producto.max_disponible) {
            setCantidad(prev => prev + 1);
        }
    };

    const disminuirCantidad = () => setCantidad((prev) => (prev > 1 ? prev - 1 : 1));

    const handleIrAlCarrito = () => {
        localStorage.setItem('lastFromCarrito', window.location.pathname);
        if (producto?.id_servicio) {
            navigate(`/carrito/${producto.id_servicio}`);
        }
    };

    const toggleFavorito = async () => {
        if (!producto) return;
        if (esFavorito) {
            await eliminarFavoritoProducto(producto.id_producto);
            setEsFavorito(false);
        } else {
            await agregarFavoritoProducto(producto.id_producto);
            setEsFavorito(true);
        }
    };

    if (!producto) return <p>Cargando...</p>;

    return (
        <div style={{ backgroundColor: '#F4F5F9', minHeight: '100vh' }}>
            <div style={{ width: '440px', margin: '0 auto' }}>
                <div style={{
                    width: '100%',
                    height: 330,
                    backgroundColor: '#F2FFE6',
                    borderBottomLeftRadius: 110,
                    borderBottomRightRadius: 110,
                    position: 'relative'
                }}>
                    <FaArrowLeft
                        onClick={() => navigate(`/home/${producto.id_servicio}`)}
                        style={{ position: 'absolute', top: 30, left: 24, fontSize: 22, cursor: 'pointer', zIndex: 2 }}
                    />

                    <div
                        onClick={handleIrAlCarrito}
                        style={{ position: 'absolute', top: 30, right: 24, cursor: 'pointer', zIndex: 2 }}
                    >
                        <img src="/img/carrito_compras.png" alt="Carrito" style={{ width: 24, height: 24 }} />
                        {totalArticulos > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: -5,
                                right: -5,
                                backgroundColor: '#769B7B',
                                color: 'white',
                                borderRadius: '50%',
                                width: 15,
                                height: 15,
                                fontSize: 10,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: 'Poppins',
                                fontWeight: 600,
                                boxShadow: '0 0 0 2px white',
                            }}>{totalArticulos}</div>
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <img
                            src={producto.foto?.trim() ? producto.foto : 'https://placehold.co/321x483?text=Sin+imagen'}
                            alt="Producto"
                            width={300}
                            height={300}
                            style={{ borderRadius: 20 }}
                        />
                    </div>
                </div>

                <div style={{
                    backgroundColor: '#F4F5F9',
                    marginTop: -32,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                    padding: '1.5rem'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 8
                    }}>
                        <div>
                            {producto.es_desperdicio_cero ? (
                                <div style={{fontFamily: 'Poppins'}}>
                                    <div style={{
                                        color: '#EF574B',
                                        fontSize: 18,
                                        fontWeight: 700,
                                        marginTop: 18
                                    }}>
                                        Oferta: ${producto.precio_oferta?.toFixed(2)}
                                    </div>
                                    <div style={{
                                        textDecoration: 'line-through',
                                        color: '#888',
                                        fontSize: 15,
                                        fontWeight: 500
                                    }}>
                                        ${producto.precio_actual.toFixed(2)}
                                    </div>
                                </div>
                            ) : (
                                <div style={{color: '#769B7B', fontSize: 18, fontFamily: 'Poppins', fontWeight: 600}}>
                                    ${producto.precio_actual.toFixed(2)}
                                </div>
                            )}
                            <div style={{fontSize: 20, fontFamily: 'Poppins', fontWeight: 600}}>
                                {producto.nombre}
                            </div>
                            <div style={{display: 'flex', alignItems: 'center', gap: 6, marginTop: 6}}>
                                <span style={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: '#4B614C',
                                    fontFamily: 'Poppins',
                                    marginRight: 4
                                }}>
                                    {producto.puntaje_promedio?.toFixed(1) || "0.0"}
                                </span>
                                <EstrellasPuntaje rating={producto.puntaje_promedio || 0}/>
                                <span style={{
                                    fontSize: 12,
                                    color: '#868889',
                                    fontFamily: 'Poppins'
                                }}>
                                    ({producto.cantidad_opiniones} reseñas)
                                </span>
                            </div>
                        </div>

                        <div onClick={toggleFavorito} style={{cursor: 'pointer'}}>
                            {esFavorito
                                ? <FaHeart color="4B614C" size={20}/>
                                : <FaRegHeart color="grey" size={20}/>}
                        </div>
                    </div>

                    <div style={{
                        fontSize: 12,
                        color: '#868889',
                        fontFamily: 'Poppins',
                        fontWeight: 400,
                        lineHeight: '19.56px',
                        marginTop: 12
                    }}>
                        {producto.descripcion}
                    </div>

                    {producto.ingredientes && producto.ingredientes.length > 0 && (
                        <div style={{marginTop: 20}}>
                            <h4 style={{fontSize: 14, fontFamily: 'Poppins', color: '#4B614C', marginBottom: 6}}>
                                Ingredientes
                            </h4>
                            <ul style={{paddingLeft: 16, color: '#555', fontSize: 13, fontFamily: 'Poppins'}}>
                                {producto.ingredientes.map((ing) => (
                                    <li key={ing.id_ingrediente}>{ing.nombre}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div style={{
                        backgroundColor: 'white',
                        marginTop: 20,
                        padding: 10,
                        borderRadius: 5,
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
        <span style={{color: '#868889', fontSize: 12, fontFamily: 'Poppins', fontWeight: 500}}>
            Cantidad
        </span>
                            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                                <button
                                    onClick={disminuirCantidad}
                                    disabled={cantidad === 1}
                                    style={{
                                        fontSize: 20,
                                        background: 'none',
                                        border: 'none',
                                        color: cantidad === 1 ? '#ccc' : 'black',
                                        cursor: cantidad === 1 ? 'not-allowed' : 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    −
                                </button>
                                <span style={{fontSize: 18, fontFamily: 'Poppins', fontWeight: 500}}>{cantidad}</span>
                                <button
                                    onClick={aumentarCantidad}
                                    disabled={producto?.max_disponible !== undefined && cantidad >= producto.max_disponible}
                                    style={{
                                        fontSize: 20,
                                        background: 'none',
                                        border: 'none',
                                        color:
                                            producto?.max_disponible !== undefined && cantidad >= producto.max_disponible
                                                ? '#ccc'
                                                : 'black',
                                        cursor:
                                            producto?.max_disponible !== undefined && cantidad >= producto.max_disponible
                                                ? 'not-allowed'
                                                : 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {mostrarAvisoStock && (
                            <div style={{
                                marginTop: 8,
                                fontSize: 12,
                                color: '#D8000C',
                                fontFamily: 'Poppins',
                                fontWeight: 500
                            }}>
                                No puedes agregar más. Stock máximo alcanzado.
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => {
                            const cantidadOferta = producto.cantidad_restante
                                ? Math.min(cantidad, producto.cantidad_restante)
                                : 0;

                            agregarItem(producto.id_servicio, {
                                id_producto: producto.id_producto,
                                nombre: producto.nombre,
                                cantidad,
                                cantidad_oferta: cantidadOferta,
                                precio_oferta: producto.precio_oferta,
                                precio_actual: producto.precio_actual,
                                precio_original: producto.precio_actual,
                                cantidad_restante: producto.cantidad_restante,
                                tiempo_limite: producto.tiempo_limite,
                                foto: producto.foto,
                                id_servicio: producto.id_servicio,
                                nombre_servicio: producto.nombre_servicio ?? ''
                            });

                            navigate(`/carrito/${producto.id_servicio}`);
                            setTimeout(() => window.scrollTo(0, 0), 100);
                        }}
                        style={{
                            marginTop: 20,
                            width: '100%',
                            height: 60,
                            background: 'linear-gradient(138deg, #AEDC81 0%, #C7DDB1 100%)',
                            borderRadius: 5,
                            border: 'none',
                            color: 'white',
                            fontSize: 15,
                            fontFamily: 'Poppins',
                            fontWeight: 500,
                            cursor: 'pointer'
                        }}
                    >
                        Añadir al carrito
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductoDetalle;