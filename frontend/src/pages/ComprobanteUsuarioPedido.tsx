import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPedidoByIdUsuario } from "../api.ts";

const ComprobanteUsuarioPedido = () => {
    const { id } = useParams();
    const [pedido, setPedido] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const obtenerPedido = async () => {
            try {
                const data = await getPedidoByIdUsuario(Number(id));
                setPedido(data);
            } catch (err) {
                console.error("Error al obtener el pedido:", err);
            }
        };

        if (id) {
            obtenerPedido();
        }
    }, [id]);

    if (!pedido) return <p>Cargando comprobante...</p>;

    return (
        <div style={{
            maxWidth: "600px",
            margin: "40px auto",
            padding: "20px",
            backgroundColor: "#f9f9f9",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
            fontFamily: "Montserrat, sans-serif",
        }}>
            <h2 style={{ color: "#2f6f3f", textAlign: "center", marginBottom: "20px" }}>Comprobante de Pedido</h2>
            <p><strong>Número de Pedido:</strong> {pedido.id_pedido}</p>
            <p><strong>Fecha:</strong> {
                new Date(pedido.fecha).toLocaleString("es-AR", {
                    timeZone: "America/Argentina/Buenos_Aires"
                })
            }</p>
            <p><strong>Entidad:</strong> {pedido.entidad.nombre}</p>
            <p><strong>Servicio:</strong> {pedido.servicio.nombre}</p>

            <h3 style={{ marginTop: "20px", color: "#2f6f3f" }}>Productos:</h3>
            <ul style={{ paddingLeft: "0" }}>
                {pedido.detalles.map((d: any) => (
                    <li key={d.id_detalle} style={{
                        listStyle: "none",
                        marginBottom: "10px",
                        padding: "10px",
                        borderBottom: "1px solid #ddd"
                    }}>
                        <strong>{d.producto.nombre}</strong> × {d.cantidad}<br />

                        {d.precio_oferta && d.cantidad_oferta > 0 ? (
                            <div style={{ fontSize: "14px", color: "#555" }}>
                                <div style={{ color: "#EF574B", fontWeight: 600 }}>
                                    Oferta: ${d.precio_oferta.toFixed(2)} × {d.cantidad_oferta}
                                </div>
                                {d.cantidad_normal > 0 && (
                                    <div style={{ color: "#6CC51D", fontWeight: 500 }}>
                                        Normal: ${d.precio_original.toFixed(2)} × {d.cantidad_normal}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ fontSize: "14px", color: "#555" }}>
                                ${d.precio_unitario.toFixed(2)} × {d.cantidad}
                            </div>
                        )}

                        <div style={{ fontSize: "14px", color: "#666", marginTop: 4 }}>
                            Subtotal: ${d.subtotal.toFixed(2)}
                        </div>
                    </li>
                ))}
            </ul>

            <h3 style={{ marginTop: "20px", color: "#2f6f3f" }}>Total: ${parseFloat(pedido.total).toFixed(2)}</h3>

            <div style={{ textAlign: "center", marginTop: "30px" }}>
                <button
                    onClick={() => navigate(`/mis-pedidos`)}
                    style={{
                        backgroundColor: "#2f6f3f",
                        color: "white",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        fontSize: "16px",
                        cursor: "pointer",
                        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                        transition: "background-color 0.3s",
                    }}
                    onMouseOver={e => (e.currentTarget.style.backgroundColor = "#245733")}
                    onMouseOut={e => (e.currentTarget.style.backgroundColor = "#2f6f3f")}
                >
                    Volver a Pedidos
                </button>
            </div>
        </div>
    );
};

export default ComprobanteUsuarioPedido;
