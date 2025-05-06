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
    tiempo_estimado_minutos?: number;
}

const MisPedidosUsuario = () => {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const navigate = useNavigate();
    const [opinados, setOpinados] = useState<Record<number, boolean>>({});

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
                const checks = await Promise.all(
                    data
                        .filter((p: Pedido) => p.estado === "entregado")
                        .map(async (p: Pedido) => {
                            const res = await fetch(`/api/opinion/ya-opino/${p.id}`, {
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                                },
                            });
                            const op = await res.json();
                            return { id: p.id, yaOpino: op.servicio && op.productos.length > 0 };
                        })
                );

                const nuevoEstado: Record<number, boolean> = {};
                checks.forEach(({ id, yaOpino }) => {
                    nuevoEstado[id] = yaOpino;
                });
                setOpinados(nuevoEstado);

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
            case "en_preparacion": return { color: "#F5A623", fontWeight: "bold" };
            case "listo": return { color: "#4B614C", fontWeight: "bold" };
            case "entregado": return { color: "#4B614C", fontWeight: "bold" };
            case "cancelado": return { color: "#D0021B", fontWeight: "bold" };
            case "esperando_confirmacion": return { color: "#B0B0B0", fontWeight: "bold" };
            default: return { fontWeight: "bold" };
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
                <span style={{ fontWeight: 700}}>{p.entidad} - {p.servicio}</span>
                <span style={{...getEstadoStyle(p.estado), textAlign: "right", display: "inline-block"}}>
    {p.estado === "esperando_confirmacion" && (
        <>
            <div>ESPERANDO</div>
            <div>CONFIRMACIÓN</div>
        </>
    )}
                    {p.estado === "en_preparacion" && (
                        <>
                            <div>EN</div>
                            <div>PREPARACIÓN</div>
                        </>
                    )}
                    {p.estado === "listo" && (
                        <>
                            <div>LISTO</div>
                        </>
                    )}
                    {p.estado === "entregado" && (
                        <>
                            <div>ENTREGADO</div>
                        </>
                    )}
                    {p.estado === "cancelado" && (
                        <>
                            <div>CANCELADO</div>
                        </>
                    )}
</span>
            </div>
            <div style={{fontSize: 14, marginBottom: 10}}>{formatearFecha(p.fecha)}</div>

            {p.detalles.map((d, index) => (
                <div key={index} style={{display: "flex", alignItems: "center", marginBottom: 10}}>
                    <img src={d.foto} alt={d.producto} style={{
                        width: 50, height: 50, borderRadius: 10, objectFit: "cover", marginRight: 10
                    }}/>
                    <div style={{flex: 1}}>
                        <div style={{fontWeight: 600}}>{d.producto}</div>
                        <div style={{fontSize: 13}}>{d.cantidad} x ${d.precio_unitario.toFixed(2)}</div>
                    </div>
                    <div style={{ fontWeight: 600 }}>${d.subtotal.toFixed(2)}</div>
                </div>
            ))}

            <div style={{ textAlign: "right", fontWeight: 700, marginTop: 10 }}>
                Total: ${p.total.toFixed(2)}
            </div>

            {p.estado === "entregado" && (
                opinados[p.id] ? (
                    <div style={{
                        marginTop: 10,
                        textAlign: "left",
                        color: "gray",
                        fontFamily: "Poppins",
                        fontSize: 14,
                    }}>
                        Ya opinaste
                    </div>
                ) : (
                    <div
                        style={{
                            marginTop: 10,
                            textAlign: "left",
                            color: "#9AAA88",
                            fontFamily: "Poppins",
                            fontSize: 14,
                            cursor: "pointer",
                            textDecoration: "none",
                        }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
                        onClick={() => navigate(`/opinar/${p.id}`)}
                    >
                        Opinar
                    </div>
                )
            )}

            {p.estado === "en_preparacion" && p.tiempo_estimado_minutos && (
                <div style={{ marginTop: 10, fontSize: 14 }}>
                    <strong>Tiempo estimado de entrega:</strong> {p.tiempo_estimado_minutos} minutos
                </div>
            )}
        </div>
    );

    return (
        <div style={{ backgroundColor: '#F4F5F9', minHeight: '100vh' }}>
            {/* Header fijo */}
            <div
                style={{
                    backgroundColor: 'white',
                    paddingTop: 50,
                    paddingBottom: 20,
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
            >
                <div
                    style={{
                        maxWidth: "768px",
                        margin: '0 auto',
                        padding: '0 20px'
                    }}
                >
                    <h2
                        style={{
                            fontSize: 19,
                            fontFamily: 'Poppins',
                            fontWeight: 500,
                            letterSpacing: '0.54px',
                            margin: 0,
                            textAlign: "center"
                        }}
                    >
                        Mis Pedidos
                    </h2>
                </div>
            </div>

            {/* Contenido scrolleable */}
            <div style={{ padding: 20, maxWidth: 768, margin: "0 auto" }}>
                {actuales.length > 0 && (
                    <>
                        <h3 style={{ fontFamily: "Poppins", fontSize: 20, marginBottom: 10 }}>Activos</h3>
                        {actuales.map(renderPedido)}
                    </>
                )}

                {antiguos.length > 0 && (
                    <>
                        <h3 style={{ fontFamily: "Poppins", fontSize: 20, marginTop: 30, marginBottom: 10 }}>Antiguos</h3>
                        {antiguos.map(renderPedido)}
                    </>
                )}

                {pedidos.length === 0 && (
                    <p>No tenés pedidos realizados.</p>
                )}
            </div>
        </div>
    );

};

export default MisPedidosUsuario;