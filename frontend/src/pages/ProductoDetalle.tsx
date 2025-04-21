import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { fetchProductoPorId } from '../api.ts';
import { useCarrito } from '../pages/CarritoContext';

type Producto = {
    id_producto: number;
    nombre: string;
    descripcion: string;
    precio_actual: number;
    foto: string;
    // ingredientes: string[];  // ← Descomentar cuando se agregue al modelo
};

const ProductoDetalle = () => {
    const { id_producto } = useParams<{ id_producto: string }>();
    const navigate = useNavigate();
    const [producto, setProducto] = useState<Producto | null>(null);
    const [cantidad, setCantidad] = useState(1);
    const { agregarItem, items } = useCarrito();

    const totalArticulos = items.reduce((sum, item) => sum + item.cantidad, 0);

    useEffect(() => {
        if (!id_producto) return;
        fetchProductoPorId(Number(id_producto))
            .then((data) => setProducto(data))
            .catch((error) => {
                console.error("Error al obtener el producto:", error);
            });
    }, [id_producto]);

    const aumentarCantidad = () => setCantidad((prev) => prev + 1);
    const disminuirCantidad = () => setCantidad((prev) => (prev > 1 ? prev - 1 : 1));

    if (!producto) return <p>Cargando...</p>;

    return (
        <div style={{ position: 'relative', background: 'white', minHeight: '100vh' }}>
            {/* Fondo verde claro circular */}
            <div style={{
                width: 490, height: 490, position: 'absolute',
                left: -41, top: -120, backgroundColor: '#F2FFE6',
                borderRadius: '9999px', zIndex: 0
            }} />

            {/* Imagen del producto centrada */}
            <div style={{ position: 'relative', zIndex: 2, paddingTop: 32 }}>
                <img
                    src={(producto.foto && producto.foto.trim() !== "") ? producto.foto : "https://placehold.co/321x483?text=Sin+imagen"}
                    alt="Producto"
                    width={321}
                    height={483}
                    style={{
                        display: 'block',
                        margin: '0 auto',
                        borderRadius: 20
                    }}
                />
            </div>

            {/* Flecha para volver */}
            <FaArrowLeft
                onClick={() => navigate(-1)}
                style={{ position: 'absolute', top: 40, left: 30, fontSize: 22, cursor: 'pointer', zIndex: 2 }}
            />

            {/* Ícono del carrito con contador */}
            <div
                style={{
                    position: 'absolute',
                    top: 36,
                    right: 28,
                    cursor: 'pointer',
                    zIndex: 3
                }}
                onClick={() => navigate('/carrito')}
            >
                <img
                    src="/img/carrito_compras.png"
                    alt="Carrito"
                    style={{ width: 32, height: 32 }}
                />
                {totalArticulos > 0 && (
                    <div
                        style={{
                            position: 'absolute',
                            top: -6,
                            right: -6,
                            backgroundColor: '#769B7B',
                            color: 'white',
                            borderRadius: '50%',
                            width: 22,
                            height: 22,
                            fontSize: 13,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: 'Poppins',
                            fontWeight: 600,
                            boxShadow: '0 0 0 2px white'
                        }}
                    >
                        {totalArticulos}
                    </div>
                )}
            </div>

            {/* Contenido blanco inferior */}
            <div style={{
                position: 'absolute', top: 458, left: 0, width: '100%',
                backgroundColor: '#F4F5F9', borderTopLeftRadius: 10, borderTopRightRadius: 10,
                padding: '24px', zIndex: 3
            }}>
                <div style={{ color: '#769B7B', fontSize: 18, fontFamily: 'Poppins', fontWeight: 600 }}>
                    {typeof producto.precio_actual === 'number' ? `$${producto.precio_actual.toFixed(2)}` : '$0.00'}
                </div>

                <div style={{
                    color: 'black', fontSize: 20,
                    fontFamily: 'Poppins', fontWeight: 600, marginTop: 4
                }}>
                    {producto.nombre}
                </div>

                <div style={{
                    fontSize: 12, color: '#868889', fontFamily: 'Poppins',
                    fontWeight: 400, lineHeight: '19.56px', marginTop: 12
                }}>
                    {producto.descripcion}
                </div>

                {/* Cantidad */}
                <div style={{
                    backgroundColor: 'white', marginTop: 20, padding: 10,
                    borderRadius: 5, display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', height: 50
                }}>
                    <span style={{ color: '#868889', fontSize: 12, fontFamily: 'Poppins', fontWeight: 500 }}>
                        Cantidad
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <button onClick={disminuirCantidad}
                                style={{ fontSize: 20, background: 'none', border: 'none' }}>−
                        </button>
                        <span style={{ fontSize: 18, fontFamily: 'Poppins', fontWeight: 500 }}>{cantidad}</span>
                        <button onClick={aumentarCantidad}
                                style={{ fontSize: 20, background: 'none', border: 'none' }}>+
                        </button>
                    </div>
                </div>

                {/* Botón de añadir al carrito */}
                <button
                    onClick={() => {
                        if (producto) {
                            agregarItem({
                                id_producto: producto.id_producto,
                                nombre: producto.nombre,
                                precio_actual: producto.precio_actual,
                                cantidad,
                                foto: producto.foto
                            });
                            navigate('/carrito');
                        }
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
    );
};

export default ProductoDetalle;
