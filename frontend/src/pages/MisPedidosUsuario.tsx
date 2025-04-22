import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface DetallePedido {
    producto: string;
    foto: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
}

interface Pedido {
    id: number;
    fecha: string;
    estado: string;
    total: number;
    servicio: string;
    entidad: string;
    detalles: DetallePedido[];
}

const MisPedidosUsuario = () => {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPedidos = async () => {
            try {
                const response = await fetch("/api/pedidos/mis", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                const data = await response.json();
                setPedidos(data);
            } catch (error) {
                console.error("Error al traer los pedidos:", error);
            }
        };

        fetchPedidos();
    }, []);

    const formatearFecha = (fechaStr: string) => {
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString("es-AR", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getEstadoStyle = (estado: string) => {
        switch (estado) {
            case "en_preparacion": return { color: "#F5A623" };
            case "listo_para_retirar": return { color: "#7ED321" };
            case "entregado": return { color: "#4A90E2" };
            case "cancelado": return { color: "#D0021B" };
            default: return {};
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h2 style={{ fontFamily: "Poppins", marginBottom: 20 }}>Mis Pedidos</h2>

            {pedidos.length === 0 ? (
                <p>No tenés pedidos realizados.</p>
            ) : (
                pedidos.map(p => (
                    <div key={p.id} style={{
                        background: "white",
                        borderRadius: 10,
                        padding: 16,
                        marginBottom: 16,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontWeight: 700 }}>{p.entidad} - {p.servicio}</span>
                            <span style={getEstadoStyle(p.estado)}>{p.estado.replace("_", " ").toUpperCase()}</span>
                        </div>
                        <div style={{ fontSize: 14, marginBottom: 10 }}>{formatearFecha(p.fecha)}</div>

                        {p.detalles.map((d, index) => (
                            <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                                <img src={d.foto} alt={d.producto} style={{ width: 50, height: 50, borderRadius: 10, objectFit: "cover", marginRight: 10 }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600 }}>{d.producto}</div>
                                    <div style={{ fontSize: 13 }}>
                                        {d.cantidad} x ${d.precio_unitario.toFixed(2)}
                                    </div>
                                </div>
                                <div style={{ fontWeight: 600 }}>${d.subtotal.toFixed(2)}</div>
                            </div>
                        ))}

                        <div style={{ textAlign: "right", fontWeight: 700, marginTop: 10 }}>
                            Total: ${p.total.toFixed(2)}
                        </div>
                    </div>
                ))
            )}

            <button
                onClick={() => navigate(-1)}
                style={{
                    marginTop: 20,
                    backgroundColor: "#769B7B",
                    color: "white",
                    padding: "10px 20px",
                    borderRadius: 5,
                    border: "none",
                    fontFamily: "Poppins",
                    cursor: "pointer"
                }}
            >
                Volver
            </button>
        </div>
    );
};

export default MisPedidosUsuario;