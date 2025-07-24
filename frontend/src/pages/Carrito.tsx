import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useCarrito } from '../pages/CarritoContext';
import { FaArrowLeft, FaTrash, FaShoppingCart } from 'react-icons/fa';
import { realizarPedido } from '../api';
import { getStockPorServicio, obtenerIngredientesDeProducto, obtenerProductoPorId } from '../api';

const Carrito = () => {
    const { id_servicio } = useParams<{ id_servicio: string }>();
    const {
        items,
        total,
        modificarCantidad,
        eliminarItem,
        vaciarCarrito,
        setServicioActivo,
        actualizarMaximoDisponible
    } = useCarrito();
    const navigate = useNavigate();
    const from = localStorage.getItem('lastFromCarrito') || '/entidades';
    const [errorMensaje, setErrorMensaje] = useState('');
    const [mensajeStockAgotado, setMensajeStockAgotado] = useState<Record<number, boolean>>({});

    useEffect(() => {
        if (id_servicio) {
            setServicioActivo(Number(id_servicio));
        }
    }, [id_servicio]);

    useEffect(() => {
        const sincronizarCarrito = async () => {
            if (!id_servicio) return;

            const stock = await getStockPorServicio(Number(id_servicio));

            const nuevosItems = await Promise.all(items.map(async (item) => {
                const ingredientes = await obtenerIngredientesDeProducto(item.id_producto);
                const productoActual = await obtenerProductoPorId(item.id_producto);

                const maximo = Math.min(
                    ...ingredientes.map((ing) => {
                        const stockIng = stock.find(s => s.id_ingrediente === ing.id_ingrediente);
                        if (!stockIng || stockIng.cantidad === 0) return 0;
                        return Math.floor(stockIng.cantidad / ing.cantidad);
                    })
                );

                const hayOferta = productoActual.es_desperdicio_cero && productoActual.precio_oferta !== null && productoActual.cantidad_restante > 0;
                const nuevaCantidadOferta = hayOferta
                    ? Math.min(productoActual.cantidad_restante, item.cantidad)
                    : 0;

                return {
                    ...item,
                    max_disponible: maximo,
                    precio_oferta: hayOferta ? productoActual.precio_oferta : undefined,
                    cantidad_oferta: nuevaCantidadOferta,
                    tiempo_limite: hayOferta ? productoActual.tiempo_limite : null,
                };
            }));

            nuevosItems.forEach((item) => {
                modificarCantidad(item.id_servicio, item.id_producto, item.cantidad);
                actualizarMaximoDisponible(item.id_servicio, item.id_producto, item.max_disponible ?? Infinity);
            });
        };

        sincronizarCarrito();
    }, [id_servicio]);

    useEffect(() => {
        const nuevosMensajes: Record<number, boolean> = {};
        items.forEach((item) => {
            if (
                item.max_disponible !== undefined &&
                item.cantidad === item.max_disponible
            ) {
                nuevosMensajes[item.id_producto] = true;
                setTimeout(() => {
                    setMensajeStockAgotado(prev => ({
                        ...prev,
                        [item.id_producto]: false
                    }));
                }, 3000);
            }
        });
        setMensajeStockAgotado(nuevosMensajes);
    }, [items]);

    const handleRealizarPedido = async () => {
        try {
            setErrorMensaje('');

            const itemsFiltrados = items.map(item => {
                if (item.cantidad_oferta && !item.precio_oferta) {
                    return {
                        ...item,
                        cantidad_oferta: 0,
                    };
                }
                return item;
            });

            await realizarPedido(itemsFiltrados);
            if (id_servicio) vaciarCarrito(Number(id_servicio));
            navigate("/mis-pedidos");
        } catch (error: unknown) {
            console.error("Error al realizar el pedido:", error);
            if (error instanceof Error) {
                setErrorMensaje(error.message);
            } else {
                setErrorMensaje('Ocurrió un error al realizar el pedido');
            }
        }
    };


    if (items.length === 0) {
        return (
            <div style={{ background: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{
                    padding: '50px 20px',
                    textAlign: 'center',
                    maxWidth: '768px',
                    margin: '0 auto',
                }}>
                    <FaShoppingCart size={90} color="#000" />
                    <div style={{ paddingTop: 30 }}>
                        <h2>¡El carrito está vacío!</h2>
                        <p>Podés volver atrás para seguir comprando.</p>
                    </div>
                    <button
                        onClick={() => navigate(from)}
                        style={{
                            marginTop: 20,
                            background: '#AEDC81',
                            color: 'white',
                            padding: '10px 20px',
                            borderRadius: 5,
                            border: 'none',
                            fontFamily: 'Poppins',
                            fontWeight: 500
                        }}
                    >
                        Ir a comprar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: '#F4F5F9', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{
                backgroundColor: 'white',
                paddingTop: '50px',
                paddingBottom: '20px',
                position: 'sticky',
                top: 0,
                zIndex: 10,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <div style={{ width: "450px", margin: '0 auto', padding: '0 20px', position: 'relative' }}>
                    <FaArrowLeft
                        onClick={() => navigate(from)}
                        style={{ fontSize: 20, cursor: 'pointer', position: 'absolute', top: 0, left: 30 }}
                    />
                    <h2 style={{
                        textAlign: 'center',
                        fontFamily: 'Poppins',
                        fontWeight: 500,
                        fontSize: 18,
                        margin: 0
                    }}>Carrito</h2>
                    {items.length > 0 && (
                        <div style={{
                            textAlign: 'center',
                            fontSize: 14,
                            fontFamily: 'Poppins',
                            color: '#868889',
                            marginTop: 4
                        }}>
                            Servicio: {items[0].nombre_servicio}
                        </div>
                    )}
                </div>
            </div>

            <div style={{ flexGrow: 1, overflowY: 'auto' }}>
                <div style={{ width: "450px", margin: '0 auto', padding: '20px' }}>
                    {items.map(item => (
                        <div key={item.id_producto} style={{
                            background: 'white',
                            borderRadius: 5,
                            padding: 12,
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: 12,
                            gap: 12
                        }}>
                            <img src={item.foto || "https://placehold.co/68x68"} alt="Producto"
                                 style={{ width: 68, height: 68, borderRadius: '50%' }} />
                            <div style={{flex: 1}}>
                                <div style={{fontWeight: 600, fontFamily: 'Poppins'}}>{item.nombre}</div>
                                {item.precio_oferta && item.cantidad_oferta !== undefined && item.cantidad_oferta > 0 ? (
                                    <div>
                                        <div style={{ fontSize: 12, color: '#EF574B', fontWeight: 600 }}>
                                            Oferta: ${item.precio_oferta.toFixed(2)} x {item.cantidad_oferta}
                                        </div>
                                        {item.cantidad - item.cantidad_oferta > 0 && (
                                            <div style={{ fontSize: 12, color: '#6CC51D', fontWeight: 500 }}>
                                                Sin oferta: ${item.precio_actual.toFixed(2)} x {item.cantidad - item.cantidad_oferta}
                                            </div>
                                        )}
                                        {item.precio_original && (
                                            <div style={{
                                                fontSize: 11,
                                                color: '#888',
                                                textDecoration: 'line-through',
                                                marginTop: 2
                                            }}>
                                                ${item.precio_original.toFixed(2)} x {item.cantidad}
                                            </div>
                                        )}
                                        {item.tiempo_limite && (
                                            <div style={{
                                                fontSize: 10,
                                                color: '#4B614C',
                                                marginTop: 4,
                                                fontStyle: 'italic'
                                            }}>
                                                Válido hasta {new Date(item.tiempo_limite).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ fontSize: 12, color: '#6CC51D', fontWeight: 500 }}>
                                        ${item.precio_actual.toFixed(2)} x {item.cantidad}
                                    </div>
                                )}
                                <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 8}}>
                                    <button
                                        onClick={() => modificarCantidad(item.id_servicio, item.id_producto, item.cantidad - 1)}
                                        disabled={item.cantidad === 1}
                                        style={{
                                            fontSize: 20,
                                            background: 'none',
                                            border: 'none',
                                            color: item.cantidad === 1 ? '#ccc' : 'black',
                                            cursor: item.cantidad === 1 ? 'not-allowed' : 'pointer',
                                            fontWeight: 600
                                        }}
                                    >
                                        −
                                    </button>

                                    <span style={{fontSize: 16}}>{item.cantidad}</span>

                                    <button
                                        onClick={() => modificarCantidad(item.id_servicio, item.id_producto, item.cantidad + 1)}
                                        disabled={item.max_disponible !== undefined && item.cantidad >= item.max_disponible}
                                        style={{
                                            fontSize: 20,
                                            background: 'none',
                                            border: 'none',
                                            color: item.max_disponible !== undefined && item.cantidad >= item.max_disponible ? '#ccc' : 'black',
                                            cursor: item.max_disponible !== undefined && item.cantidad >= item.max_disponible ? 'not-allowed' : 'pointer',
                                            fontWeight: 600
                                        }}
                                    >
                                        +
                                    </button>
                                </div>

                                {mensajeStockAgotado[item.id_producto] && (
                                    <div style={{
                                        fontSize: 11,
                                        color: '#D8000C',
                                        marginTop: 4,
                                        fontFamily: 'Poppins',
                                        fontWeight: 500,
                                    }}>
                                        No puedes agregar más. Stock máximo alcanzado.
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => eliminarItem(item.id_servicio, item.id_producto)}
                                style={{background: 'none', border: 'none', color: '#EF574B', cursor: 'pointer'}}
                            >
                                <FaTrash/>
                            </button>
                        </div>
                    ))}

                    <div style={{
                        marginTop: 20,
                        background: 'white',
                        padding: 16,
                        borderRadius: 5,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{fontFamily: 'Poppins', fontWeight: 600, fontSize: 18}}>Total</span>
                        <span style={{fontFamily: 'Poppins', fontWeight: 600, fontSize: 18}}>${total.toFixed(2)}</span>
                    </div>

                    {errorMensaje && (
                        <div style={{
                            marginTop: 16,
                            backgroundColor: '#FFE5E5',
                            color: '#D8000C',
                            padding: '10px 15px',
                            borderRadius: 5,
                            fontFamily: 'Poppins',
                            fontSize: 14,
                            fontWeight: 500
                        }}>
                            {errorMensaje}
                        </div>
                    )}

                    <button
                        onClick={handleRealizarPedido}
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
                        }}>
                        Realizar pedido
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Carrito;
