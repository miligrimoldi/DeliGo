import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { fetchProductoPorId } from '../api.ts';

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

    useEffect(() => {
        if (!id_producto) return;
        console.log("Buscando producto con ID:", id_producto);
        fetchProductoPorId(Number(id_producto))
            .then((data) => {
                console.log("Producto recibido:", data);
                setProducto(data);
            })
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
                style={{position: 'absolute', top: 40, left: 30, fontSize: 22, cursor: 'pointer', zIndex: 2}}
            />

            {/* Contenido blanco inferior */}
            <div style={{
                position: 'absolute', top: 458, left: 0, width: '100%',
                backgroundColor: '#F4F5F9', borderTopLeftRadius: 10, borderTopRightRadius: 10,
                padding: '24px', zIndex: 3
            }}>
                <div style={{color: '#769B7B', fontSize: 18, fontFamily: 'Poppins', fontWeight: 600}}>
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

                {/* Ingredientes (DESCOMENTARRRR) */}
                {/*
                <div style={{ marginTop: 16 }}>
                    <span style={{
                        color: 'black', fontSize: 13,
                        fontFamily: 'Poppins', fontWeight: 600
                    }}>
                        Ingredientes
                    </span>
                    <div style={{
                        marginTop: 8,
                        display: 'flex',
                        gap: 8,
                        padding: '8px',
                        background: '#E2E6BE',
                        borderRadius: 5,
                        overflowX: 'auto'
                    }}>
                        {producto.ingredientes.map((imgSrc, idx) => (
                            <img key={idx} src={imgSrc} alt={`Ingrediente ${idx}`} style={{ width: 47, height: 38, borderRadius: 4 }} />
                        ))}
                    </div>
                </div>
                */}

                {/* Cantidad */}
                <div style={{
                    backgroundColor: 'white', marginTop: 20, padding: 10,
                    borderRadius: 5, display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', height: 50
                }}>
                    <span style={{color: '#868889', fontSize: 12, fontFamily: 'Poppins', fontWeight: 500}}>
                        Cantidad
                    </span>
                    <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                        <button onClick={disminuirCantidad}
                                style={{fontSize: 20, background: 'none', border: 'none'}}>−
                        </button>
                        <span style={{fontSize: 18, fontFamily: 'Poppins', fontWeight: 500}}>{cantidad}</span>
                        <button onClick={aumentarCantidad}
                                style={{fontSize: 20, background: 'none', border: 'none'}}>+
                        </button>
                    </div>
                </div>

                {/* Botón de añadir al carrito */}
                <button
                    onClick={() => console.log('Añadir al carrito', producto.id_producto, cantidad)}
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
