import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useRef } from "react";

interface DetallePedido {
    id_detalle: number;
    producto: string;
    foto: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    precio_original?: number;
    es_oferta?: boolean;
    cantidad_oferta?: number;
    cantidad_normal?: number;
    precio_oferta?: number;
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
    const estadoPrevio = useRef<Map<number, string>>(new Map());
    const tiempoPrevio = useRef<Map<number, number | undefined>>(new Map());
    const traducirEstado = (estado: string) => {
        switch (estado) {
            case "esperando_confirmacion": return "esperando confirmación";
            case "en_preparacion": return "en preparación";
            case "listo": return "listo";
            case "entregado": return "entregado";
            case "cancelado": return "cancelado";
            default: return estado;
        }
    };


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
                data.forEach((pedido: Pedido) => {
                    const anterior = estadoPrevio.current.get(pedido.id);
                    const actual = pedido.estado;
                    const tiempoAntes = tiempoPrevio.current.get(pedido.id);
                    const tiempoAhora = pedido.tiempo_estimado_minutos;

                    if (
                        pedido.estado === "en_preparacion" &&
                        tiempoAntes !== undefined &&
                        tiempoAhora !== undefined &&
                        tiempoAntes !== tiempoAhora
                    ) {
                        toast.info(`Se actualizó el tiempo estimado del pedido #${pedido.id}: de ${tiempoAntes} a ${tiempoAhora} minutos`);
                    }

                    tiempoPrevio.current.set(pedido.id, tiempoAhora);

                    if (anterior && anterior !== actual) {
                        toast.info(`Tu pedido #${pedido.id} pasó de ${traducirEstado(anterior)} a ${traducirEstado(actual)}`);
                    }
                    estadoPrevio.current.set(pedido.id, actual);
                });
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

        fetchPedidos();

        const intervalo = setInterval(fetchPedidos, 10000);

        return () => clearInterval(intervalo);
    }, []);


    const formatearFecha = (fechaStr: string) => {
        const fecha = new Date(fechaStr);
        return fecha.toLocaleString("es-AR", {
            timeZone: "America/Argentina/Buenos_Aires",
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

            {p.detalles.map((d) => {
                return (
                    <div key={d.id_detalle}
                         style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                        <img
                            src={d.foto}
                            alt={d.producto}
                            style={{
                                width: 50,
                                height: 50,
                                borderRadius: 10,
                                objectFit: "cover",
                                marginRight: 10
                            }}
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600 }}>{d.producto}</div>

                            {/* Lógica copiada exactamente del Carrito.tsx */}
                            {d.precio_oferta && d.cantidad_oferta !== undefined && d.cantidad_oferta > 0 ? (
                                <div>
                                    <div style={{ fontSize: 12, color: '#EF574B', fontWeight: 600 }}>
                                        Oferta: ${d.precio_oferta.toFixed(2)} x {d.cantidad_oferta}
                                    </div>
                                    {d.cantidad - d.cantidad_oferta > 0 && (
                                        <div style={{ fontSize: 12, color: '#6CC51D', fontWeight: 500 }}>
                                            Sin oferta: ${d.precio_unitario.toFixed(2)} x {d.cantidad - d.cantidad_oferta}
                                        </div>
                                    )}
                                    {d.precio_original && (
                                        <div style={{
                                            fontSize: 11,
                                            color: '#888',
                                            textDecoration: 'line-through',
                                            marginTop: 2
                                        }}>
                                            ${d.precio_original.toFixed(2)} x {d.cantidad}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ fontSize: 12, color: '#6CC51D', fontWeight: 500 }}>
                                    ${d.precio_unitario.toFixed(2)} x {d.cantidad}
                                </div>
                            )}
                        </div>
                        <div style={{ fontWeight: 600 }}>${d.subtotal.toFixed(2)}</div>
                    </div>
                );
            })}

            <div style={{textAlign: "right", fontWeight: 700, marginTop: 10}}>
                Total: ${p.total.toFixed(2)}
            </div>

            {p.estado === "entregado" && (
                <div style={{ marginTop: 10 }}>
                    {opinados[p.id] ? (
                        <div
                            style={{
                                textAlign: "left",
                                color: "gray",
                                fontFamily: "Poppins",
                                fontSize: 14,
                            }}
                        >
                            Ya opinaste
                        </div>
                    ) : (
                        <div
                            style={{
                                textAlign: "left",
                                color: "#9AAA88",
                                fontFamily: "Poppins",
                                fontSize: 14,
                                cursor: "pointer",
                                textDecoration: "none",
                                marginBottom: 4,
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                            onClick={() => navigate(`/opinar/${p.id}`)}
                        >
                            Opinar
                        </div>
                    )}

                    <div
                        style={{
                            textAlign: "left",
                            color: "#4A4A4A",
                            fontFamily: "Poppins",
                            fontSize: 14,
                            cursor: "pointer",
                            textDecoration: "none",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                        onClick={() => navigate(`/comprobante/${p.id}`)}
                    >
                        Ver comprobante
                    </div>
                </div>
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