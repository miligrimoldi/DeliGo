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
    tiempo_estimado_minutos?: number; // Se agrega esta propiedad para el tiempo estimado
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

        // Llamada inicial
        fetchPedidos();

        // Refresca cada 10 segundos
        const intervalo = setInterval(fetchPedidos, 10000);

        // Si el usuario se va a otra pagina, corta el fetch
        return () => clearInterval(intervalo);
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
            case "listo": return { color: "#4B614C" };
            case "entregado": return { color: "#4B614C" };
            case "cancelado": return { color: "#D0021B" };
            case "esperando_confirmacion": return { color: "#B0B0B0" };
            default: return {};
        }
    };

    const actuales = pedidos.filter(p => p.estado === "en_preparacion" || p.estado === "listo"|| p.estado === "esperando_confirmacion");
    const antiguos = pedidos.filter(p => p.estado === "entregado" || p.estado === "cancelado");

    const renderPedido = (p: Pedido) => (
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
                    <img src={d.foto} alt={d.producto} style={{
                        width: 50, height: 50, borderRadius: 10, objectFit: "cover", marginRight: 10
                    }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{d.producto}</div>
                        <div style={{ fontSize: 13 }}>{d.cantidad} x ${d.precio_unitario.toFixed(2)}</div>
                    </div>
                    <div style={{ fontWeight: 600 }}>${d.subtotal.toFixed(2)}</div>
                </div>
            ))}

            <div style={{ textAlign: "right", fontWeight: 700, marginTop: 10 }}>
                Total: ${p.total.toFixed(2)}
            </div>

            {p.estado === "en_preparacion" && p.tiempo_estimado_minutos && (
                <div style={{ marginTop: 10, fontSize: 14 }}>
                    <strong>Tiempo estimado de entrega:</strong> {p.tiempo_estimado_minutos} minutos
                </div>
            )}
        </div>
    );

    return (
        <div style={{ padding: 20, maxWidth: 768, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "Poppins", marginBottom: 20 }}>Mis Pedidos</h2>

            {actuales.length > 0 && (
                <>
                    <h3 style={{ fontFamily: "Poppins", marginBottom: 10 }}>Activos</h3>
                    {actuales.map(renderPedido)}
                </>
            )}

            {antiguos.length > 0 && (
                <>
                    <h3 style={{ fontFamily: "Poppins", marginTop: 30, marginBottom: 10 }}>Antiguos</h3>
                    {antiguos.map(renderPedido)}
                </>
            )}

            {pedidos.length === 0 && (
                <p>No tenés pedidos realizados.</p>
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