import { useNavigate } from 'react-router-dom';
import { useCarrito } from '../pages/CarritoContext';
import { FaArrowLeft, FaTrash } from 'react-icons/fa';

const Carrito = () => {
    const { items, total, modificarCantidad, eliminarItem } = useCarrito();
    const navigate = useNavigate();

    if (items.length === 0) {
        return (
            <div style={{ padding: 20, background: 'white', height: '100vh', textAlign: 'center' }}>
                <FaArrowLeft onClick={() => navigate(-1)} style={{ fontSize: 22, cursor: 'pointer' }} />
                <img src="/img/carrito_compras.png" alt="Carrito vacío" style={{ width: 120, marginTop: 40 }} />
                <h2>¡El carrito está vacío!</h2>
                <p>Podés volver atrás para seguir comprando.</p>
                <button
                    onClick={() => navigate('/')}
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
        );
    }

    return (
        <div style={{ background: '#F4F5F9', minHeight: '100vh', padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                <FaArrowLeft onClick={() => navigate(-1)} style={{ fontSize: 22, cursor: 'pointer' }} />
                <h2 style={{ marginLeft: 'auto', marginRight: 'auto', fontFamily: 'Poppins' }}>Carrito</h2>
            </div>

            {items.map(item => (
                <div key={item.id_producto} style={{
                    background: 'white', borderRadius: 5, padding: 12,
                    display: 'flex', alignItems: 'center', marginBottom: 12, gap: 12
                }}>
                    <img src={item.foto || "https://placehold.co/68x68"} alt="Producto" style={{ width: 68, height: 68, borderRadius: '50%' }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontFamily: 'Poppins' }}>{item.nombre}</div>
                        <div style={{ fontSize: 12, color: '#6CC51D', fontWeight: 500 }}>
                            ${item.precio_actual.toFixed(2)} x {item.cantidad}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                            <button
                                onClick={() => modificarCantidad(item.id_producto, item.cantidad - 1)}
                                style={{ fontSize: 20, background: 'none', border: 'none', cursor: 'pointer' }}
                            >−</button>
                            <span style={{ fontSize: 16 }}>{item.cantidad}</span>
                            <button
                                onClick={() => modificarCantidad(item.id_producto, item.cantidad + 1)}
                                style={{ fontSize: 20, background: 'none', border: 'none', cursor: 'pointer' }}
                            >+</button>
                        </div>
                    </div>
                    <button
                        onClick={() => eliminarItem(item.id_producto)}
                        style={{ background: 'none', border: 'none', color: '#EF574B', cursor: 'pointer' }}
                    >
                        <FaTrash />
                    </button>
                </div>
            ))}

            <div style={{
                marginTop: 20, background: 'white', padding: 16, borderRadius: 5,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <span style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 18 }}>Total</span>
                <span style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 18 }}>${total.toFixed(2)}</span>
            </div>

            <button style={{
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
    );
};

export default Carrito;
