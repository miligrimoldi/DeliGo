import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PedidoConDetalles, fetchPedidosPorServicio, cambiarEstadoPedido } from "../../api.ts";
import "../../css/PedidosAdmin.css";
import { api } from "../../api";
import { toast } from "react-toastify";

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
    const [tiemposOriginales, setTiemposOriginales] = useState<Record<number, number>>({});
    const [opinionesPorPedido, setOpinionesPorPedido] = useState<Record<number, OpinionPedido>>({});
    const [visibles, setVisibles] = useState<Record<number, boolean>>({});
    const [pedidoEnPreparacionPendiente, setPedidoEnPreparacionPendiente] = useState<number | null>(null);
    const [errorMensaje, setErrorMensaje] = useState<string>("");

    const idsPreviosRef = useRef<number[]>([]);
    const estadosPreviosRef = useRef<Record<number, string>>({});
    const isFirstLoadRef = useRef(true);
    const ultimoCambioManualRef = useRef<{ id: number; estado: string; timestamp: number } | null>(null);

    const traducirEstado = (estado: string): string => {
        const traducciones: Record<string, string> = {
            "esperando_confirmacion": "esperando confirmación",
            "en_preparacion": "en preparación",
            "cancelado": "cancelado",
            "listo": "listo",
            "entregado": "entregado"
        };
        return traducciones[estado] || estado;
    };

    const toggleOpiniones = async (id_pedido: number) => {
        setVisibles(prev => ({ ...prev, [id_pedido]: !prev[id_pedido] }));

        if (!opinionesPorPedido[id_pedido]) {
            try {
                const res = await api.get(`/admin/pedido/${id_pedido}/opiniones`);
                setOpinionesPorPedido(prev => ({ ...prev, [id_pedido]: res.data }));
            } catch (err) {
                console.error("Error al cargar opiniones del pedido", err);
                setErrorMensaje("Error al cargar las opiniones del pedido");
                setTimeout(() => setErrorMensaje(""), 5000);
            }
        }
    };

    const cargarPedidos = useCallback(async () => {
        try {
            const pedidos = await fetchPedidosPorServicio(servicioId);
            const activos = pedidos.filter(p => p.estado !== "entregado" && p.estado !== "cancelado");

            if (!isFirstLoadRef.current) {
                const nuevos = activos.filter(p => !idsPreviosRef.current.includes(p.id_pedido));
                if (nuevos.length > 0) {
                    nuevos.forEach(p => {
                        toast.info(`Nuevo pedido recibido (#${p.id_pedido}) de ${p.email_usuario}`, {
                            position: "top-center",
                            autoClose: 5000,
                            toastId: `nuevo-pedido-${p.id_pedido}`
                        });
                    });
                }

                activos.forEach(p => {
                    const estadoPrevio = estadosPreviosRef.current[p.id_pedido];
                    const ahora = Date.now();

                    const esCambioManual = ultimoCambioManualRef.current?.id === p.id_pedido &&
                        ultimoCambioManualRef.current?.estado === p.estado &&
                        (ahora - ultimoCambioManualRef.current.timestamp) < 2000;

                    if (estadoPrevio && estadoPrevio !== p.estado && !esCambioManual) {
                        toast.info(`Pedido #${p.id_pedido} cambió a "${traducirEstado(p.estado)}"`, {
                            position: "top-center",
                            autoClose: 5000,
                            toastId: `cambio-estado-${p.id_pedido}-${p.estado}`
                        });
                    }
                });
            }

            idsPreviosRef.current = activos.map(p => p.id_pedido);
            const nuevosEstados: Record<number, string> = {};
            activos.forEach(p => {
                nuevosEstados[p.id_pedido] = p.estado;
            });
            estadosPreviosRef.current = nuevosEstados;

            isFirstLoadRef.current = false;

            setPedidosActivos(activos);
            setPedidosAntiguos(pedidos.filter(p => p.estado === "entregado" || p.estado === "cancelado"));

            const tiempos: Record<number, number> = {};
            const originales: Record<number, number> = {};
            pedidos.forEach(p => {
                if (p.estado === "en_preparacion" && p.tiempo_estimado_minutos !== undefined) {
                    tiempos[p.id_pedido] = p.tiempo_estimado_minutos;
                    originales[p.id_pedido] = p.tiempo_estimado_minutos;
                }
            });
            setTiemposEstimados(tiempos);
            setTiemposOriginales(originales);
        } catch (error) {
            console.error("Error cargando pedidos:", error);
            setErrorMensaje("Error al cargar los pedidos");
            setTimeout(() => setErrorMensaje(""), 5000);
        }
    }, [servicioId]);

    useEffect(() => {
        if (isNaN(servicioId)) return;

        cargarPedidos();

        const intervalo = setInterval(() => {
            cargarPedidos();
        }, 10000);

        return () => clearInterval(intervalo);
    }, [servicioId, cargarPedidos]);

    const handleEstadoChange = async (id_pedido: number, nuevo_estado: string) => {
        if (nuevo_estado === "en_preparacion") {
            if (!tiemposEstimados[id_pedido]) {
                setTiemposEstimados(prev => ({ ...prev, [id_pedido]: 1 }));
            }
            setPedidoEnPreparacionPendiente(id_pedido);
            return;
        }

        try {
            ultimoCambioManualRef.current = {
                id: id_pedido,
                estado: nuevo_estado,
                timestamp: Date.now()
            };

            await cambiarEstadoPedido(id_pedido, nuevo_estado);
            setPedidoEnPreparacionPendiente(null);

            toast.success(`Pedido #${id_pedido} cambió a "${traducirEstado(nuevo_estado)}"`, {
                position: "top-center",
                autoClose: 3000,
                toastId: `manual-${id_pedido}-${nuevo_estado}-${Date.now()}`
            });

            estadosPreviosRef.current[id_pedido] = nuevo_estado;

            setTimeout(() => cargarPedidos(), 500);
        } catch (err) {
            console.error("Error al cambiar estado del pedido", err);
            setErrorMensaje(`Error al cambiar estado del pedido #${id_pedido}`);
            setTimeout(() => setErrorMensaje(""), 5000);
        }
    };

    const handleTiempoChange = async (id_pedido: number, nuevoTiempo: number) => {
        try {
            const pedidoActual = pedidosActivos.find(p => p.id_pedido === id_pedido);
            const yaEstabaEnPreparacion = pedidoActual?.estado === "en_preparacion";

            ultimoCambioManualRef.current = {
                id: id_pedido,
                estado: "en_preparacion",
                timestamp: Date.now()
            };

            await cambiarEstadoPedido(id_pedido, "en_preparacion", nuevoTiempo);
            setTiemposOriginales(prev => ({ ...prev, [id_pedido]: nuevoTiempo }));
            setTiemposEstimados(prev => ({ ...prev, [id_pedido]: nuevoTiempo }));
            setPedidoEnPreparacionPendiente(null);

            if (yaEstabaEnPreparacion) {
                toast.success(`Tiempo estimado del pedido #${id_pedido} actualizado a ${nuevoTiempo} minutos`, {
                    position: "top-center",
                    autoClose: 4000,
                    toastId: `tiempo-actualizado-${id_pedido}-${nuevoTiempo}-${Date.now()}`
                });
            } else {
                toast.success(`Pedido #${id_pedido} pasó a estar en preparación con tiempo estimado de ${nuevoTiempo} minutos`, {
                    position: "top-center",
                    autoClose: 4000,
                    toastId: `tiempo-${id_pedido}-${nuevoTiempo}-${Date.now()}`
                });
            }

            estadosPreviosRef.current[id_pedido] = "en_preparacion";

            setTimeout(() => cargarPedidos(), 500);
        } catch (err) {
            console.error("Error al actualizar tiempo estimado", err);
            setTiemposEstimados(prev => ({ ...prev, [id_pedido]: tiemposOriginales[id_pedido] || 1 }));

            setErrorMensaje(`Error al actualizar tiempo del pedido #${id_pedido}`);
            setTimeout(() => setErrorMensaje(""), 5000);
        }
    };

    const cancelarPreparacion = (id_pedido: number) => {
        setPedidoEnPreparacionPendiente(null);
        if (tiemposOriginales[id_pedido]) {
            setTiemposEstimados(prev => ({ ...prev, [id_pedido]: tiemposOriginales[id_pedido] }));
        } else {
            setTiemposEstimados(prev => {
                const nuevo = { ...prev };
                delete nuevo[id_pedido];
                return nuevo;
            });
        }
    };

    const validarTiempo = (tiempo: number): string | null => {
        if (!tiempo || tiempo < 1 || tiempo > 300) {
            return "Ingresá un tiempo válido (entre 1 y 300 minutos)";
        }
        return null;
    };

    const pedidos = solapa === "activos" ? pedidosActivos : pedidosAntiguos;
    const navigate = useNavigate();

    const verdeClaro = "#e6f7e6";
    const sombraSutil = "0 2px 4px rgba(0,0,0,0.08)";

    return (
        <div className="pedidos-admin" style={{ padding: "20px", fontFamily: "Montserrat, sans-serif", backgroundColor: "#f8fdf8" }}>
            <h2 style={{ color: "#2f6f3f", marginBottom: "20px", textShadow: "0.5px 0.5px #e0e0e0" }}>Pedidos</h2>

            {/* Mensaje de error */}
            {errorMensaje && (
                <div style={{
                    backgroundColor: "#ffe6e6",
                    color: "#d32f2f",
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                    border: "1px solid #ffcdd2",
                    fontWeight: "500"
                }}>
                    {errorMensaje}
                </div>
            )}

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
                        Pedido #<span style={{ color: "#2f6f3f" }}>{p.id_pedido}</span> - Estado: <span style={{ color: "#2f6f3f" }}>{traducirEstado(p.estado)}</span> - Usuario <span style={{ color: "#2f6f3f" }}>{p.email_usuario}</span>
                    </p>
                    <ul style={{ listStyleType: "none", padding: 0, marginBottom: "10px" }}>
                        {p.detalles.map(d => (
                            <li key={d.id_detalle} style={{ color: "#555" }}>
                                {d.producto.nombre} x{d.cantidad}
                            </li>
                        ))}
                    </ul>

                    {solapa === "activos" && (
                        <div style={{display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap"}}>
                            <select
                                value={pedidoEnPreparacionPendiente === p.id_pedido ? "en_preparacion" : p.estado}
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

                            {(pedidoEnPreparacionPendiente === p.id_pedido || p.estado === "en_preparacion") && (
                                <div style={{display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap"}}>
                                    <label style={{fontSize: "14px", color: "#555"}}>Tiempo estimado (min):</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={300}
                                        value={tiemposEstimados[p.id_pedido] || 1}
                                        onChange={(e) => {
                                            const valor = e.target.value;
                                            if (valor === '') {
                                                setTiemposEstimados(prev => ({...prev, [p.id_pedido]: 1}));
                                                return;
                                            }

                                            const nuevoTiempo = parseInt(valor, 10);
                                            if (!isNaN(nuevoTiempo) && nuevoTiempo >= 1 && nuevoTiempo <= 300) {
                                                setTiemposEstimados(prev => ({...prev, [p.id_pedido]: nuevoTiempo}));
                                            }
                                        }}
                                        onBlur={(e) => {
                                            const valor = parseInt(e.target.value, 10);
                                            if (isNaN(valor) || valor < 1) {
                                                setTiemposEstimados(prev => ({
                                                    ...prev,
                                                    [p.id_pedido]: tiemposOriginales[p.id_pedido] || 1
                                                }));
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const tiempo = tiemposEstimados[p.id_pedido] || 1;
                                                const error = validarTiempo(tiempo);
                                                if (error) {
                                                    setErrorMensaje(error);
                                                    setTimeout(() => setErrorMensaje(""), 5000);
                                                } else {
                                                    handleTiempoChange(p.id_pedido, tiempo);
                                                }
                                            }
                                        }}
                                        style={{
                                            padding: "6px",
                                            borderRadius: "5px",
                                            border: `1px solid ${verdeClaro}`,
                                            width: "70px",
                                            fontFamily: "Montserrat, sans-serif",
                                            fontSize: "14px",
                                            color: "#333",
                                            backgroundColor: "white",
                                            boxShadow: sombraSutil
                                        }}
                                    />
                                    {pedidoEnPreparacionPendiente === p.id_pedido && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    const tiempo = tiemposEstimados[p.id_pedido] || 1;
                                                    const error = validarTiempo(tiempo);
                                                    if (error) {
                                                        setErrorMensaje(error);
                                                        setTimeout(() => setErrorMensaje(""), 5000);
                                                        return;
                                                    }
                                                    handleTiempoChange(p.id_pedido, tiempo);
                                                }}
                                                style={{
                                                    backgroundColor: "#2f6f3f",
                                                    color: "white",
                                                    padding: "6px 10px",
                                                    borderRadius: "6px",
                                                    border: "none",
                                                    fontSize: "14px",
                                                    cursor: "pointer",
                                                    fontFamily: "Montserrat, sans-serif"
                                                }}
                                            >
                                                Confirmar
                                            </button>
                                            <button
                                                onClick={() => cancelarPreparacion(p.id_pedido)}
                                                style={{
                                                    backgroundColor: "#dc3545",
                                                    color: "white",
                                                    padding: "6px 10px",
                                                    borderRadius: "6px",
                                                    border: "none",
                                                    fontSize: "14px",
                                                    cursor: "pointer",
                                                    fontFamily: "Montserrat, sans-serif"
                                                }}
                                            >
                                                Cancelar
                                            </button>
                                        </>
                                    )}
                                    {p.estado === "en_preparacion" && pedidoEnPreparacionPendiente !== p.id_pedido && (
                                        <button
                                            onClick={() => {
                                                const tiempo = tiemposEstimados[p.id_pedido] || 1;
                                                const error = validarTiempo(tiempo);
                                                if (error) {
                                                    setErrorMensaje(error);
                                                    setTimeout(() => setErrorMensaje(""), 5000);
                                                    return;
                                                }
                                                handleTiempoChange(p.id_pedido, tiempo);
                                            }}
                                            style={{
                                                backgroundColor: "#7A916C",
                                                color: "white",
                                                padding: "8px 14px",
                                                borderRadius: "6px",
                                                border: "none",
                                                fontSize: "14px",
                                                cursor: "pointer",
                                                fontFamily: "Montserrat, sans-serif",
                                                fontWeight: "500",
                                                boxShadow: sombraSutil,
                                                transition: "all 0.2s ease",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "4px"
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.backgroundColor = "#6b7f5f";
                                                e.currentTarget.style.transform = "translateY(-1px)";
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.backgroundColor = "#7A916C";
                                                e.currentTarget.style.transform = "translateY(0)";
                                            }}
                                        >
                                            Actualizar tiempo
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {p.estado === "entregado" && (
                        <>
                            <div style={{
                                display: "flex",
                                gap: "8px",
                                marginTop: "10px",
                                width: "50%",
                            }}>
                                <button
                                    onClick={() => navigate(`/admin/${id_servicio}/comprobante/${p.id_pedido}`)}
                                    style={{
                                        flex: 1,
                                        whiteSpace: "nowrap",
                                        backgroundColor: "#2f6f3f",
                                        color: "white",
                                        padding: "6px 8px",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        fontFamily: "Montserrat, sans-serif",
                                        fontSize: "13px",
                                        fontWeight: 500,
                                        boxShadow: sombraSutil,
                                        lineHeight: "1",
                                    }}
                                >
                                    Ver comprobante
                                </button>
                                <button
                                    onClick={() => toggleOpiniones(p.id_pedido)}
                                    style={{
                                        flex: 1,
                                        whiteSpace: "nowrap",
                                        backgroundColor: "#7A916C",
                                        color: "white",
                                        padding: "6px 8px",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        fontFamily: "Montserrat, sans-serif",
                                        fontSize: "13px",
                                        fontWeight: 500,
                                        boxShadow: sombraSutil,
                                        lineHeight: "1",
                                    }}
                                >
                                    Ver opiniones
                                </button>
                            </div>

                            {visibles[p.id_pedido] && opinionesPorPedido[p.id_pedido] && (
                                <div style={{marginTop: 10, backgroundColor: "#f9f9f9", padding: 12, borderRadius: 6}}>

                                    {opinionesPorPedido[p.id_pedido]?.servicio ? (
                                        <div style={{marginBottom: 16}}>
                                            <strong style={{display: "block", marginBottom: 4}}>
                                                Opinión del servicio: {opinionesPorPedido[p.id_pedido].nombre_servicio}
                                            </strong>
                                            <span>
      {opinionesPorPedido[p.id_pedido].servicio?.usuario ?? "Usuario desconocido"} —
                                                {opinionesPorPedido[p.id_pedido].servicio?.puntaje ?? 0}★
    </span><br/>
                                            <span style={{fontSize: 13}}>
      {opinionesPorPedido[p.id_pedido].servicio?.comentario ?? "Sin comentario"}
    </span><br/>
                                            <small style={{color: "#999"}}>
                                                {opinionesPorPedido[p.id_pedido].servicio?.fecha ?? "Sin fecha"}
                                            </small>
                                        </div>
                                    ) : (
                                        <p style={{color: "#999", fontSize: 13}}>Sin opinión del servicio.</p>
                                    )}

                                    {opinionesPorPedido[p.id_pedido]?.productos?.length > 0 ? (
                                        <>
                                            <strong style={{display: "block", marginBottom: 6}}>Opiniones de
                                                productos:</strong>
                                            {opinionesPorPedido[p.id_pedido].productos.map((op, idx) => (
                                                <div key={idx}
                                                     style={{display: "flex", alignItems: "center", marginBottom: 10}}>
                                                    {op.foto && (
                                                        <img
                                                            src={op.foto}
                                                            alt={op.producto ?? "producto"}
                                                            style={{
                                                                width: 40,
                                                                height: 40,
                                                                borderRadius: 6,
                                                                marginRight: 10,
                                                                objectFit: "cover"
                                                            }}
                                                        />
                                                    )}
                                                    <div>
                                                        <strong>{op.producto ?? "Producto"}</strong> — {op.usuario ?? "Usuario"} — {op.puntaje ?? 0}★<br/>
                                                        <span
                                                            style={{fontSize: 13}}>{op.comentario ?? "Sin comentario"}</span><br/>
                                                        <small style={{color: "#999"}}>{op.fecha ?? "Sin fecha"}</small>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    ) : (
                                        <p style={{color: "#999", fontSize: 13}}>Sin opiniones de productos.</p>
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