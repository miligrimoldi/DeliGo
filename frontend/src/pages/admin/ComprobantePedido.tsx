import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPedidoById } from "../../api.ts";

const ComprobantePedido = () => {
    const { id_pedido } = useParams();
    const [pedido, setPedido] = useState<any>(null);

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
            <p><strong>Fecha:</strong> {new Date(pedido.fecha).toLocaleString()}</p>
            <p><strong>Usuario:</strong> {pedido.email_usuario}</p>
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
                        <span style={{ fontSize: "14px", color: "#666" }}>
                            Precio unitario: ${parseFloat(d.producto.precio).toFixed(2)}<br />
                            Subtotal: ${(parseFloat(d.producto.precio) * d.cantidad).toFixed(2)}
                        </span>
                    </li>
                ))}
            </ul>

            <h3 style={{ marginTop: "20px", color: "#2f6f3f" }}>Total: ${parseFloat(pedido.total).toFixed(2)}</h3>
        </div>
    );
};

export default ComprobantePedido;
