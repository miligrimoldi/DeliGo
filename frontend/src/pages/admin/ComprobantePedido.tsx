import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPedidoById } from "../../api.ts";

const ComprobantePedido = () => {
    const { id_pedido, id_servicio } = useParams();
    const [pedido, setPedido] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const obtenerPedido = async () => {
            try {
                const data = await getPedidoById(Number(id_pedido));
                setPedido(data);
            } catch (err) {
                console.error("Error al obtener el pedido:", err);
            }
        };

        if (id_pedido) {
            obtenerPedido();
        }
    }, [id_pedido]);

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
            <p><strong>Usuario:</strong> {pedido.email_usuario}</p>
            <p><strong>Entidad:</strong> {pedido.entidad.nombre}</p>
            <p><strong>Servicio:</strong> {pedido.servicio.nombre}</p>

            <h3 style={{ marginTop: "20px", color: "#2f6f3f" }}>Productos:</h3>
            <ul style={{ paddingLeft: "0" }}>
                {pedido.detalles.map((d: any) => (
                    <li key={d.id_detalle} style={{ listStyle: "none", marginBottom: "10px", padding: "10px", borderBottom: "1px solid #ddd" }}>
                        <strong>{d.producto.nombre}</strong> × {d.cantidad}<br />
                        <span style={{ fontSize: "14px", color: "#666" }}>
                            {d.precio_oferta && d.cantidad_oferta > 0 ? (
                                <>
                                    <div>Oferta: ${d.precio_oferta.toFixed(2)} x {d.cantidad_oferta}</div>
                                    {d.cantidad_normal > 0 && d.precio_original != null && (
                                        <div>Sin oferta: ${d.precio_original.toFixed(2)} x {d.cantidad_normal}</div>
                                    )}
                                    {d.precio_original != null && (
                                        <div style={{ fontSize: 12, textDecoration: 'line-through', color: '#888' }}>
                                            Precio original: ${d.precio_original.toFixed(2)} x {d.cantidad}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div>${d.precio_original != null ? d.precio_original.toFixed(2) : "N/A"} x {d.cantidad}</div>
                            )}
                            <div><strong>Subtotal:</strong> ${d.subtotal.toFixed(2)}</div>
                        </span>
                    </li>
                ))}
            </ul>

            <h3 style={{ marginTop: "20px", color: "#2f6f3f" }}>Total: ${parseFloat(pedido.total).toFixed(2)}</h3>

            <div style={{ textAlign: "center", marginTop: "30px" }}>
                <button
                    onClick={() => navigate(`/empleado/${id_servicio}/pedidos`)}
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

export default ComprobantePedido;
