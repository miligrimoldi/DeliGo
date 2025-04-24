import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PedidoConDetalles, fetchPedidosPorServicio, cambiarEstadoPedido } from "../../api.ts";

const PedidosAdmin = () => {
    const { id_servicio } = useParams<{ id_servicio: string }>();
    const servicioId = parseInt(id_servicio ?? "0", 10);
    const [pedidosActivos, setPedidosActivos] = useState<PedidoConDetalles[]>([]);
    const [pedidosAntiguos, setPedidosAntiguos] = useState<PedidoConDetalles[]>([]);
    const [solapa, setSolapa] = useState<"activos" | "antiguos">("activos");
    const [tiemposEstimados, setTiemposEstimados] = useState<Record<number, number>>({});

    const cargarPedidos = async () => {
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
    };

    useEffect(() => {
        if (!isNaN(servicioId)) {
            cargarPedidos();
        }
    }, [servicioId]);

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

    return (
        <div className="pedidos-admin">
            <h2>Pedidos</h2>
            <div>
                <button onClick={() => setSolapa("activos")}>Pedidos activos</button>
                <button onClick={() => setSolapa("antiguos")}>Pedidos antiguos</button>
            </div>
            {pedidos.map(p => (
                <div key={p.id_pedido} className="pedido-card">
                    <p><strong>Pedido #{p.id_pedido}</strong> - Estado: {p.estado}</p>
                    <ul>
                        {p.detalles.map(d => (
                            <li key={d.id_detalle}>
                                {d.producto.nombre} x{d.cantidad}
                            </li>
                        ))}
                    </ul>

                    {solapa === "activos" && (
                        <>
                            <select value={p.estado} onChange={(e) => handleEstadoChange(p.id_pedido, e.target.value)}>
                                <option value="esperando_confirmacion">Esperando Confirmacion</option>
                                <option value="en_preparacion">En preparación</option>
                                <option value="cancelado">Cancelado</option>
                                <option value="listo">Listo</option>
                                <option value="entregado">Entregado</option>
                            </select>

                            {p.estado === "en_preparacion" && (
                                <div>
                                    <label>Tiempo estimado (min): </label>
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
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            ))}
        </div>
    );
};

export default PedidosAdmin;
