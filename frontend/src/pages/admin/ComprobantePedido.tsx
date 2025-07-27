import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPedidoById } from "../../api.ts";
import { ArrowLeft } from "lucide-react";

const ComprobantePedido = () => {
    const { id_pedido } = useParams();
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

        if (id_pedido) obtenerPedido();
    }, [id_pedido]);

    if (!pedido) return <p style={{ fontFamily: "Montserrat, sans-serif", textAlign: "center" }}>Cargando comprobante...</p>;

    return (
        <div style={{
            maxWidth: "650px",
            margin: "40px auto",
            padding: "30px",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.08)",
            fontFamily: "'Montserrat', sans-serif",
        }}>
            {/* Header con flecha + título */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "25px"
            }}>
                <ArrowLeft
                    size={24}
                    strokeWidth={2}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(-1)}
                />
                <h2 style={{
                    fontFamily: "'Georgia', serif",
                    fontWeight: "600",
                    fontSize: "24px",
                    color: "#1f1f1f",
                    margin: 0
                }}>
                    Comprobante de Pedido
                </h2>
            </div>

            {/* Encapsulado gris - Datos del pedido */}
            <div style={{
                backgroundColor: "#f3f4f6",
                padding: "18px 22px",
                borderRadius: "10px",
                marginBottom: "25px",
                lineHeight: "1.8",
                fontSize: "15px"
            }}>
                <p><strong>Número de Pedido:</strong> {pedido.id_pedido}</p>
                <p><strong>Fecha:</strong> {
                    new Date(pedido.fecha).toLocaleString("es-AR", {
                        timeZone: "America/Argentina/Buenos_Aires"
                    })
                }</p>
                <p><strong>Usuario:</strong> {pedido.email_usuario}</p>
                <p><strong>Entidad:</strong> {pedido.entidad.nombre}</p>
                <p><strong>Servicio:</strong> {pedido.servicio.nombre}</p>
            </div>

            {/* Encapsulado gris - Productos */}
            <div style={{
                backgroundColor: "#f3f4f6",
                padding: "18px 22px",
                borderRadius: "10px",
                marginBottom: "25px"
            }}>
                <h3 style={{
                    fontFamily: "'Georgia', serif",
                    fontSize: "20px",
                    fontWeight: "600",
                    marginBottom: "15px",
                    color: "#1f1f1f"
                }}>
                    Productos
                </h3>

                <ul style={{ paddingLeft: 0 }}>
                    {pedido.detalles.map((d: any) => (
                        <li key={d.id_detalle} style={{
                            listStyle: "none",
                            padding: "12px 0",
                            borderBottom: "1px solid #e0e0e0"
                        }}>
                            <div style={{
                                fontWeight: "600",
                                fontSize: "16px",
                                color: "#2f6f3f"
                            }}>
                                {d.producto.nombre} × {d.cantidad}
                            </div>
                            <div style={{ fontSize: "14px", color: "#555" }}>
                                {d.precio_oferta && d.cantidad_oferta > 0 ? (
                                    <>
                                        <div>Oferta: ${d.precio_oferta.toFixed(2)} x {d.cantidad_oferta}</div>
                                        {d.cantidad_normal > 0 && d.precio_original != null && (
                                            <div>Sin oferta: ${d.precio_original.toFixed(2)} x {d.cantidad_normal}</div>
                                        )}
                                        {d.precio_original != null && (
                                            <div style={{
                                                fontSize: 12,
                                                textDecoration: 'line-through',
                                                color: '#888'
                                            }}>
                                                Precio original: ${d.precio_original.toFixed(2)} x {d.cantidad}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div>${d.precio_original?.toFixed(2) ?? "N/A"} x {d.cantidad}</div>
                                )}
                                <div><strong>Subtotal:</strong> ${d.subtotal.toFixed(2)}</div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Total */}
            <h3 style={{
                fontFamily: "'Georgia', serif",
                fontSize: "20px",
                fontWeight: "600",
                color: "#1f1f1f",
                textAlign: "right"
            }}>
                Total: ${parseFloat(pedido.total).toFixed(2)}
            </h3>
        </div>
    );
};

export default ComprobantePedido;
