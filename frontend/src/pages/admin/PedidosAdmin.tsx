import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PedidoConDetalles, fetchPedidosPorServicio, cambiarEstadoPedido } from "../../api.ts";
import "../../css/PedidosAdmin.css";
import { api } from "../../api";

interface Opinion {
    usuario: string;
    comentario: string;
    puntaje: number;
    fecha: string;
    producto?: string;
    foto?: string;
}

interface OpinionPedido {
    nombre_servicio: string;
    servicio: Opinion | null;
    productos: Opinion[];
}


const PedidosAdmin = () => {
    const { id_servicio } = useParams<{ id_servicio: string }>();
    const servicioId = parseInt(id_servicio ?? "0", 10);
    const [pedidosActivos, setPedidosActivos] = useState<PedidoConDetalles[]>([]);
    const [pedidosAntiguos, setPedidosAntiguos] = useState<PedidoConDetalles[]>([]);
    const [solapa, setSolapa] = useState<"activos" | "antiguos">("activos");
    const [tiemposEstimados, setTiemposEstimados] = useState<Record<number, number>>({});
    const [opinionesPorPedido, setOpinionesPorPedido] = useState<Record<number, OpinionPedido>>({});
    const [visibles, setVisibles] = useState<Record<number, boolean>>({});

    const toggleOpiniones = async (id_pedido: number) => {
        setVisibles(prev => ({ ...prev, [id_pedido]: !prev[id_pedido] }));

        if (!opinionesPorPedido[id_pedido]) {
            try {
                const res = await api.get(`/admin/pedido/${id_pedido}/opiniones`);
                setOpinionesPorPedido(prev => ({ ...prev, [id_pedido]: res.data }));
            } catch (err) {
                console.error("Error al cargar opiniones del pedido", err);
            }
        }
    };

    const cargarPedidos = useCallback(async () => {
        const pedidos = await fetchPedidosPorServicio(servicioId);
        setPedidosActivos(pedidos.filter(p => p.estado !== "entregado" && p.estado !== "cancelado"));
        setPedidosAntiguos(pedidos.filter(p => p.estado === "entregado" || p.estado === "cancelado"));

        const tiempos: Record<number, number> = {};
        pedidos.forEach(p => {
            if (p.estado === "en_preparacion" && p.tiempo_estimado_minutos !== undefined) {
                tiempos[p.id_pedido] = p.tiempo_estimado_minutos;
            }
        });
        setTiemposEstimados(tiempos);
    }, [servicioId]);

    useEffect(() => {
        if (!isNaN(servicioId)) {
            cargarPedidos();
        }
    }, [servicioId, cargarPedidos]);

    const handleEstadoChange = async (id_pedido: number, nuevo_estado: string) => {
        try {
            if (nuevo_estado === "en_preparacion") {
                const tiempo = prompt("Ingresar tiempo estimado de entrega en minutos:");
                const tiempoNum = parseInt(tiempo ?? "");
                if (isNaN(tiempoNum)) {
                    alert("Debe ingresar un número válido.");
                    return;
                }
                await cambiarEstadoPedido(id_pedido, nuevo_estado, tiempoNum);
            } else {
                await cambiarEstadoPedido(id_pedido, nuevo_estado);
            }
            await cargarPedidos();
        } catch (err) {
            console.error("Error al cambiar estado del pedido", err);
        }
    };

    const handleTiempoChange = async (id_pedido: number, nuevoTiempo: number) => {
        try {
            setTiemposEstimados(prev => ({ ...prev, [id_pedido]: nuevoTiempo }));
            await cambiarEstadoPedido(id_pedido, "en_preparacion", nuevoTiempo);
            await cargarPedidos();
        } catch (err) {
            console.error("Error al actualizar tiempo estimado", err);
        }
    };

    const pedidos = solapa === "activos" ? pedidosActivos : pedidosAntiguos;
    const navigate = useNavigate();

    const verdeClaro = "#e6f7e6";
    const sombraSutil = "0 2px 4px rgba(0,0,0,0.08)";

    return (
        <div className="pedidos-admin" style={{ padding: "20px", fontFamily: "Montserrat, sans-serif", backgroundColor: "#f8fdf8" }}>
            <h2 style={{ color: "#2f6f3f", marginBottom: "20px", textShadow: "0.5px 0.5px #e0e0e0" }}>Pedidos</h2>
            <div className="solapas" style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <button
                    onClick={() => setSolapa("activos")}
                    style={{
                        backgroundColor: solapa === "activos" ? "#7A916C" : "white",
                        color: solapa === "activos" ? "white" : "#4B614C",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        padding: "8px 15px",
                        cursor: "pointer",
                        fontWeight: "500",
                        boxShadow: sombraSutil,
                        transition: "background-color 0.3s ease"
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = solapa !== "activos" ? verdeClaro : "#7A916C")}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = solapa === "activos" ? "#7A916C" : "white")}
                >
                    Pedidos activos
                </button>
                <button
                    onClick={() => setSolapa("antiguos")}
                    style={{
                        backgroundColor: solapa === "antiguos" ? "#7A916C" : "white",
                        color: solapa === "antiguos" ? "white" : "#4B614C",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        padding: "8px 15px",
                        cursor: "pointer",
                        fontWeight: "500",
                        boxShadow: sombraSutil,
                        transition: "background-color 0.3s ease"
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = solapa !== "antiguos" ? verdeClaro : "#7A916C")}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = solapa === "antiguos" ? "#7A916C" : "white")}
                >
                    Pedidos antiguos
                </button>
            </div>
            {pedidos.map(p => (
                <div key={p.id_pedido} className="pedido-card" style={{ backgroundColor: "white", borderRadius: "10px", padding: "15px", marginBottom: "15px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)", border: `1px solid ${verdeClaro}` }}>
                    <p style={{ fontWeight: "bold", color: "#2f6f3f", marginBottom: "10px" }}>
                        Pedido #<span style={{ color: "#2f6f3f" }}>{p.id_pedido}</span> - Estado: <span style={{ color: "#2f6f3f" }}>{p.estado}</span> - Usuario <span style={{ color: "#2f6f3f" }}>{p.email_usuario}</span>
                    </p>
                    <ul style={{ listStyleType: "none", padding: 0, marginBottom: "10px" }}>
                        {p.detalles.map(d => (
                            <li key={d.id_detalle} style={{ color: "#555" }}>
                                {d.producto.nombre} x{d.cantidad}
                            </li>
                        ))}
                    </ul>

                    {solapa === "activos" && (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <select
                                value={p.estado}
                                onChange={(e) => handleEstadoChange(p.id_pedido, e.target.value)}
                                style={{
                                    padding: "8px",
                                    borderRadius: "5px",
                                    border: `1px solid ${verdeClaro}`,
                                    fontFamily: "Montserrat, sans-serif",
                                    fontSize: "14px",
                                    color: "#333",
                                    boxShadow: sombraSutil,
                                    backgroundColor: "white"
                                }}
                            >
                                <option value="esperando_confirmacion">Esperando Confirmacion</option>
                                <option value="en_preparacion">En preparación</option>
                                <option value="cancelado">Cancelado</option>
                                <option value="listo">Listo</option>
                                <option value="entregado">Entregado</option>
                            </select>

                            {p.estado === "en_preparacion" && (
                                <div className="tiempo-estimado" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                    <label style={{ fontSize: "14px", color: "#555" }}>Tiempo estimado (min):</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={tiemposEstimados[p.id_pedido] ?? ""}
                                        onChange={(e) => {
                                            const nuevoTiempo = parseInt(e.target.value);
                                            if (!isNaN(nuevoTiempo)) {
                                                setTiemposEstimados(prev => ({ ...prev, [p.id_pedido]: nuevoTiempo }));
                                            }
                                        }}
                                        onBlur={(e) => {
                                            const nuevoTiempo = parseInt(e.target.value);
                                            if (!isNaN(nuevoTiempo)) {
                                                handleTiempoChange(p.id_pedido, nuevoTiempo);
                                            }
                                        }}
                                        style={{
                                            padding: "8px",
                                            borderRadius: "5px",
                                            border: `1px solid ${verdeClaro}`,
                                            fontFamily: "Montserrat, sans-serif",
                                            fontSize: "14px",
                                            color: "#333",
                                            width: "80px",
                                            boxShadow: sombraSutil,
                                            backgroundColor: "white"
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                    {p.estado === "entregado" && (
                        <>
                            <button
                                onClick={() => navigate(`/admin/${id_servicio}/comprobante/${p.id_pedido}`)}
                                style={{
                                    backgroundColor: "#2f6f3f",
                                    color: "white",
                                    padding: "8px 12px",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontFamily: "Montserrat, sans-serif",
                                    fontSize: "14px",
                                    boxShadow: sombraSutil,
                                    marginTop: "10px"
                                }}
                            >
                                Ver comprobante
                            </button>
                            <button onClick={() => toggleOpiniones(p.id_pedido)} style={{ marginTop: 10 }}>Ver opiniones</button>
                            {visibles[p.id_pedido] && opinionesPorPedido[p.id_pedido] && (
                                <div style={{ marginTop: 10, backgroundColor: "#f9f9f9", padding: 12, borderRadius: 6 }}>

                                    {opinionesPorPedido[p.id_pedido]?.servicio ? (
                                        <div style={{ marginBottom: 16 }}>
                                            <strong style={{ display: "block", marginBottom: 4 }}>
                                                Opinión del servicio: {opinionesPorPedido[p.id_pedido].nombre_servicio}
                                            </strong>
                                            <span>
      {opinionesPorPedido[p.id_pedido].servicio?.usuario ?? "Usuario desconocido"} —
                                                {opinionesPorPedido[p.id_pedido].servicio?.puntaje ?? 0}★
    </span><br />
                                            <span style={{ fontSize: 13 }}>
      {opinionesPorPedido[p.id_pedido].servicio?.comentario ?? "Sin comentario"}
    </span><br />
                                            <small style={{ color: "#999" }}>
                                                {opinionesPorPedido[p.id_pedido].servicio?.fecha ?? "Sin fecha"}
                                            </small>
                                        </div>
                                    ) : (
                                        <p style={{ color: "#999", fontSize: 13 }}>Sin opinión del servicio.</p>
                                    )}

                                    {opinionesPorPedido[p.id_pedido]?.productos?.length > 0 ? (
                                        <>
                                            <strong style={{ display: "block", marginBottom: 6 }}>Opiniones de productos:</strong>
                                            {opinionesPorPedido[p.id_pedido].productos.map((op, idx) => (
                                                <div key={idx} style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                                                    {op.foto && (
                                                        <img
                                                            src={op.foto}
                                                            alt={op.producto ?? "producto"}
                                                            style={{ width: 40, height: 40, borderRadius: 6, marginRight: 10, objectFit: "cover" }}
                                                        />
                                                    )}
                                                    <div>
                                                        <strong>{op.producto ?? "Producto"}</strong> — {op.usuario ?? "Usuario"} — {op.puntaje ?? 0}★<br />
                                                        <span style={{ fontSize: 13 }}>{op.comentario ?? "Sin comentario"}</span><br />
                                                        <small style={{ color: "#999" }}>{op.fecha ?? "Sin fecha"}</small>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    ) : (
                                        <p style={{ color: "#999", fontSize: 13 }}>Sin opiniones de productos.</p>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            ))}
            <button
                className="btn-volver"
                onClick={() => navigate(`/empleado/${id_servicio}`)}
                style={{
                    backgroundColor: "white",
                    color: "#2f6f3f",
                    border: `1px solid #ccc`,
                    borderRadius: "8px",
                    padding: "10px 15px",
                    cursor: "pointer",
                    fontWeight: "500",
                    fontSize: "16px",
                    marginTop: "20px",
                    boxShadow: sombraSutil,
                    transition: "background-color 0.3s ease"
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = verdeClaro)}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "white")}
            >
                Inicio
            </button>
        </div>
    );
};

export default PedidosAdmin;