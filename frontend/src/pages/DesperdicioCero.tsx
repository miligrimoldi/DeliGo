import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCarrito } from "./CarritoContext";

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

    useEffect(() => {
        if (!id_servicio) return;
        fetch(`/servicio/${id_servicio}/desperdicio`)
            .then((res) => res.json())
            .then((data) => setProductos(data));
    }, [id_servicio]);

    return (
        <div style={{ padding: 20, fontFamily: "Poppins" }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: "center", color: "#4B614C" }}>
                DESPERDICIO CERO
            </h2>

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

                    <div style={{ padding: 12, flex: 1 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 600 }}>{producto.nombre}</h3>
                        <p style={{ color: "#555", fontSize: 14 }}>{producto.descripcion}</p>

                        <div style={{ marginTop: 10, fontSize: 16 }}>
              <span style={{ textDecoration: "line-through", marginRight: 8, color: "#999" }}>
                ${producto.precio_original.toFixed(2)}
              </span>
                            <span style={{ color: "#4B614C", fontWeight: 700 }}>
                ${producto.precio_oferta.toFixed(2)}
              </span>
                        </div>

                        {producto.tiempo_limite && (
                            <p style={{ fontSize: 12, color: "#777" }}>
                                Disponible hasta las {producto.tiempo_limite}
                            </p>
                        )}
                        {producto.cantidad_restante > 0 && (
                            <p style={{ fontSize: 12, color: "#777" }}>
                                Últimas {producto.cantidad_restante} unidades
                            </p>
                        )}

                        <button
                            onClick={() =>
                                agregarItem(Number(id_servicio), {
                                    id_producto: producto.id_producto,
                                    nombre: producto.nombre,
                                    precio_actual: producto.precio_oferta,
                                    cantidad: 1,
                                    foto: producto.foto,
                                    id_servicio: Number(id_servicio),
                                    nombre_servicio: "", // CARRRRGGGARRR!!!!!
                                })
                            }
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
                            Agregar al carrito
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DesperdicioCero;