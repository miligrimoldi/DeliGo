import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useCarrito } from '../pages/CarritoContext';
import { FaArrowLeft, FaTrash } from 'react-icons/fa';
import { realizarPedido } from '../api';

const Carrito = () => {
    const { id_servicio } = useParams<{ id_servicio: string }>();
    const {
        items,
        total,
        modificarCantidad,
        eliminarItem,
        vaciarCarrito,
        setServicioActivo
    } = useCarrito();
    const navigate = useNavigate();
    const from = localStorage.getItem('lastFromCarrito') || '/entidades';

    useEffect(() => {
        if (id_servicio) {
            setServicioActivo(Number(id_servicio));
        }
    }, [id_servicio]);

    const handleRealizarPedido = async () => {
        try {
            await realizarPedido(items);
            if (id_servicio) vaciarCarrito(Number(id_servicio));
            navigate("/mis-pedidos");
        } catch (error) {
            console.error("Error al realizar el pedido:", error);
        }
    };

    if (items.length === 0) {
        return (
            <div style={{ background: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{
                    padding: '30px 20px',
                    textAlign: 'center',
                    maxWidth: '768px',
                    margin: '0 auto',
                }}>
                    <img src="/img/carrito_compras.png" alt="Carrito vacío" style={{ width: 120, marginTop: 80 }} />
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
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontFamily: 'Poppins' }}>{item.nombre}</div>
                                <div style={{ fontSize: 12, color: '#6CC51D', fontWeight: 500 }}>
                                    ${item.precio_actual.toFixed(2)} x {item.cantidad}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                                    <button
                                        onClick={() => modificarCantidad(item.id_servicio, item.id_producto, item.cantidad - 1)}
                                        style={{ fontSize: 20, background: 'none', border: 'none', cursor: 'pointer' }}
                                    >−</button>
                                    <span style={{ fontSize: 16 }}>{item.cantidad}</span>
                                    <button
                                        onClick={() => modificarCantidad(item.id_servicio, item.id_producto, item.cantidad + 1)}
                                        style={{ fontSize: 20, background: 'none', border: 'none', cursor: 'pointer' }}
                                    >+</button>
                                </div>
                            </div>
                            <button
                                onClick={() => eliminarItem(item.id_servicio, item.id_producto)}
                                style={{ background: 'none', border: 'none', color: '#EF574B', cursor: 'pointer' }}
                            >
                                <FaTrash />
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
                        <span style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 18 }}>Total</span>
                        <span style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 18 }}>${total.toFixed(2)}</span>
                    </div>

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
