import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCarrito } from "./CarritoContext";
import { getDetalleServicio } from "../api";
import { FaArrowLeft } from "react-icons/fa";

interface ProductoDesperdicio {
    id_producto: number;
    nombre: string;
    descripcion: string;
    foto: string;
    precio_original: number;
    precio_oferta: number;
    cantidad_restante: number;
    tiempo_limite?: string | null;
}

const DesperdicioCero = () => {
    const { id_servicio } = useParams<{ id_servicio: string }>();
    const [productos, setProductos] = useState<ProductoDesperdicio[]>([]);
    const { agregarItem } = useCarrito();
    const [nombreServicio, setNombreServicio] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (!id_servicio) return;

        fetch(`/servicio/${id_servicio}/desperdicio`)
            .then((res) => res.json())
            .then((data) => setProductos(data));

        getDetalleServicio(Number(id_servicio))
            .then(data => {
                setNombreServicio(data.servicio.nombre);
            })
            .catch(err => console.error("Error al obtener nombre del servicio:", err));
    }, [id_servicio]);

    useEffect(() => {
        if (!id_servicio) return;

        const fetchYFiltrar = () => {
            fetch(`/servicio/${id_servicio}/desperdicio`)
                .then(res => res.json())
                .then(data => {
                    console.log("Productos desperdicio crudos:", data);
                    const ahora = new Date();

                    const filtrados = data.filter((p: ProductoDesperdicio) => {
                        if (!p.tiempo_limite) return p.cantidad_restante > 0;

                        const vencimiento = new Date(p.tiempo_limite);
                        if (isNaN(vencimiento.getTime())) {
                            console.warn("Fecha inválida en producto:", p);
                            return false;
                        }

                        return ahora <= vencimiento && p.cantidad_restante > 0;
                    });
                    setProductos(filtrados);
                });
        };

        fetchYFiltrar();
        const intervalId = setInterval(fetchYFiltrar, 20000); // refresca cada 20s

        return () => clearInterval(intervalId);
    }, [id_servicio]);


    return (
        <div style={{ background: "#F4F5F9", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Header fijo */}
            <div style={{
                backgroundColor: "white",
                paddingTop: "50px",
                paddingBottom: "20px",
                position: "sticky",
                top: 0,
                zIndex: 10,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
                <div style={{
                    width: "450px",
                    margin: "0 auto",
                    padding: "0 20px",
                    position: "relative",
                    textAlign: "center"
                }}>
                    <FaArrowLeft
                        onClick={() => navigate(`/home/${id_servicio}`)}
                        style={{
                            fontSize: 20,
                            cursor: "pointer",
                            position: "absolute",
                            top: 0,
                            left: 30
                        }}
                    />
                    <h2 style={{
                        fontFamily: "Poppins",
                        fontWeight: 600,
                        fontSize: 18,
                        margin: 0
                    }}>
                        Desperdicio Cero
                    </h2>
                </div>
            </div>

            {/* Contenido scrolleable */}
            <div style={{ flexGrow: 1, overflowY: "auto" }}>
                <div style={{ padding: 20, maxWidth: 450, margin: "0 auto", fontFamily: "Poppins" }}>
                    {productos.map((producto) => (
                        <div
                            key={producto.id_producto}
                            style={{
                                display: "flex",
                                backgroundColor: "white",
                                borderRadius: 16,
                                marginBottom: 20,
                                overflow: "hidden",
                                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                            }}
                        >
                            <img
                                src={producto.foto}
                                alt={producto.nombre}
                                style={{ width: 120, height: 120, objectFit: "cover" }}
                            />

                            <div style={{padding: 12, flex: 1}}>
                                <h3 style={{fontSize: 18, fontWeight: 600}}>{producto.nombre}</h3>
                                <p style={{color: "#555", fontSize: 14}}>{producto.descripcion}</p>

                                <div style={{marginTop: 10, fontSize: 16}}>
                                    <span style={{textDecoration: "line-through", marginRight: 8, color: "#999"}}>
                                        ${producto.precio_original.toFixed(2)}
                                    </span>
                                    <span style={{color: "#4B614C", fontWeight: 700}}>
                                        ${producto.precio_oferta.toFixed(2)}
                                    </span>
                                </div>

                                {producto.tiempo_limite && (
                                    <p style={{fontSize: 12, color: "#777"}}>
                                        Disponible hasta las {producto.tiempo_limite}
                                    </p>
                                )}
                                {producto.cantidad_restante > 0 && (
                                    <p style={{fontSize: 12, color: "#777"}}>
                                        {producto.cantidad_restante === 1
                                            ? "Última unidad"
                                            : `Últimas ${producto.cantidad_restante} unidades`}
                                    </p>
                                )}

                                <button
                                    onClick={async () => {
                                        try {
                                            const res = await fetch(`/producto/${producto.id_producto}`);
                                            if (!res.ok) throw new Error("No disponible");
                                            const detalle = await res.json();

                                            const ahora = new Date();
                                            const vencimiento = new Date(detalle.tiempo_limite);

                                            if (!detalle.es_desperdicio_cero || ahora > vencimiento || detalle.cantidad_restante <= 0) {
                                                alert("Este producto ya no está disponible con descuento.");
                                                return;
                                            }

                                            agregarItem(Number(id_servicio), {
                                                id_producto: detalle.id_producto,
                                                nombre: detalle.nombre,
                                                precio_actual: detalle.precio_oferta,
                                                cantidad: 1,
                                                foto: detalle.foto,
                                                id_servicio: Number(id_servicio),
                                                nombre_servicio: nombreServicio,
                                            });

                                        } catch (error) {
                                            console.error("Error al intentar agregar:", error);
                                            alert("Este producto ya no está disponible con descuento.");
                                        }
                                    }}
                                    style={{
                                        marginTop: 10,
                                        backgroundColor: "#4B614C",
                                        color: "white",
                                        border: "none",
                                        borderRadius: 20,
                                        padding: "8px 16px",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                    }}
                                >
                                    Añadir al carrito
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DesperdicioCero;
