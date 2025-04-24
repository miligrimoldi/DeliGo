import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PedidoConDetalles, fetchPedidosPorServicio, cambiarEstadoPedido } from "../../api.ts";

const PedidosAdmin = () => {
    const { id_servicio } = useParams<{ id_servicio: string }>();
    const servicioId = parseInt(id_servicio ?? "0", 10);
    const [pedidosActivos, setPedidosActivos] = useState<PedidoConDetalles[]>([]);
    const [pedidosAntiguos, setPedidosAntiguos] = useState<PedidoConDetalles[]>([]);
    const [solapa, setSolapa] = useState<"activos" | "antiguos">("activos");

    const cargarPedidos = async () => {
        const pedidos = await fetchPedidosPorServicio(servicioId);
        setPedidosActivos(pedidos.filter(p => p.estado !== "entregado" && p.estado !== "cancelado"));
        setPedidosAntiguos(pedidos.filter(p => p.estado === "entregado" || p.estado === "cancelado"));
    };

    useEffect(() => {
        if (!isNaN(servicioId)) {
            cargarPedidos();
        }
    }, [servicioId]);

    const handleEstadoChange = async (id_pedido: number, nuevo_estado: string) => {
        try {
            await cambiarEstadoPedido(id_pedido, nuevo_estado);
            await cargarPedidos();
        } catch (err) {
            console.error("Error al cambiar estado del pedido", err);
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
                        <select value={p.estado} onChange={(e) => handleEstadoChange(p.id_pedido, e.target.value)}>
                            <option value="en_preparacion">En preparación</option>
                            <option value="cancelado">Cancelado</option>
                            <option value="listo">Listo</option>
                            <option value="entregado">Entregado</option>
                        </select>
                    )}
                </div>
            ))}
        </div>
    );
};

export default PedidosAdmin;
