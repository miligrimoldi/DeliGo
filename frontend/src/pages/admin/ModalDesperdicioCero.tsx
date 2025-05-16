import { useState, useEffect } from "react";
import { marcarComoDesperdicioCero, desmarcarComoDesperdicioCero } from "../../api.ts";

interface ModalProps {
    idProducto: number;
    precioActual: number;
    yaMarcado?: boolean;
    precioOfertaInicial?: number;
    cantidadRestanteInicial?: number;
    tiempoLimiteInicial?: string;
    onClose: () => void;
    onSuccess?: () => void;
}

const ModalDesperdicioCero = ({
                                  idProducto,
                                  precioActual,
                                  yaMarcado = false,
                                  precioOfertaInicial,
                                  cantidadRestanteInicial,
                                  tiempoLimiteInicial,
                                  onClose,
                                  onSuccess
                              }: ModalProps) => {
    const [precioOferta, setPrecioOferta] = useState(precioActual);
    const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0);
    const [editando, setEditando] = useState<"porcentaje" | "precio" | null>("porcentaje");
    const [cantidadRestante, setCantidadRestante] = useState(1);
    const [tiempoLimite, setTiempoLimite] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (yaMarcado) {
            if (precioOfertaInicial !== undefined) {
                setPrecioOferta(precioOfertaInicial);
                const descuento = 100 - (precioOfertaInicial / precioActual) * 100;
                setDescuentoPorcentaje(parseFloat(descuento.toFixed(1)));
            }
            if (cantidadRestanteInicial !== undefined) {
                setCantidadRestante(cantidadRestanteInicial);
            }
            if (tiempoLimiteInicial) {
                setTiempoLimite(tiempoLimiteInicial);
            }
        }
    }, []);

    useEffect(() => {
        if (editando === "porcentaje") {
            const nuevoPrecio = parseFloat((precioActual * (1 - descuentoPorcentaje / 100)).toFixed(2));
            setPrecioOferta(nuevoPrecio >= 0 ? nuevoPrecio : 0);
        }
    }, [descuentoPorcentaje]);

    useEffect(() => {
        if (editando === "precio") {
            const nuevoDescuento = 100 - (precioOferta / precioActual) * 100;
            setDescuentoPorcentaje(parseFloat(nuevoDescuento.toFixed(1)));
        }
    }, [precioOferta]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await marcarComoDesperdicioCero(idProducto, {
                precio_oferta: precioOferta,
                cantidad_restante: cantidadRestante,
                tiempo_limite: tiempoLimite || null,
            });
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error("Error al marcar como desperdicio cero");
        } finally {
            setLoading(false);
        }
    };

    const handleDesmarcar = async () => {
        const confirmar = window.confirm("¿Estás seguro que querés quitar este producto de Desperdicio Cero?");
        if (!confirmar) return;

        setLoading(true);
        try {
            await desmarcarComoDesperdicioCero(idProducto);
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error("Error al quitar Desperdicio Cero");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ backgroundColor: "white", padding: 24, borderRadius: 12, width: 350 }}>
                <h3 style={{ marginBottom: 16, fontFamily: "Poppins", fontWeight: 600 }}>
                    {yaMarcado ? "Editar Desperdicio Cero" : "Marcar como Desperdicio Cero"}
                </h3>

                <p style={{ fontSize: 14, marginBottom: 12 }}>
                    Precio original: <strong>${precioActual.toFixed(2)}</strong>
                </p>

                <label>Descuento (%):</label>
                <input
                    type="number"
                    min={0}
                    max={100}
                    value={descuentoPorcentaje}
                    onChange={(e) => {
                        setEditando("porcentaje");
                        setDescuentoPorcentaje(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)));
                    }}
                    style={{ width: "100%", padding: 8, marginBottom: 12 }}
                />

                <label>Precio oferta:</label>
                <input
                    type="number"
                    min={0}
                    max={precioActual}
                    value={precioOferta}
                    onChange={(e) => {
                        setEditando("precio");
                        setPrecioOferta(Math.max(0, parseFloat(e.target.value) || 0));
                    }}
                    style={{ width: "100%", padding: 8, marginBottom: 12 }}
                />

                <label>Cantidad restante:</label>
                <input
                    type="number"
                    min={1}
                    value={cantidadRestante}
                    onChange={(e) => setCantidadRestante(parseInt(e.target.value))}
                    style={{ width: "100%", padding: 8, marginBottom: 12 }}
                />

                <label>Disponible hasta (opcional):</label>
                <input
                    type="time"
                    value={tiempoLimite}
                    onChange={(e) => setTiempoLimite(e.target.value)}
                    style={{ width: "100%", padding: 8, marginBottom: 16 }}
                />

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                    <button onClick={onClose} style={{ padding: "8px 16px" }}>Cancelar</button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || precioOferta <= 0}
                        style={{
                            backgroundColor: "#4B614C", color: "white", border: "none",
                            padding: "8px 16px", borderRadius: 6, fontWeight: 600,
                            cursor: loading ? "not-allowed" : "pointer"
                        }}
                    >
                        {loading ? "Guardando..." : "Confirmar"}
                    </button>
                </div>

                {yaMarcado && (
                    <button
                        onClick={handleDesmarcar}
                        disabled={loading}
                        style={{
                            marginTop: 20,
                            backgroundColor: "#a94442",
                            color: "white",
                            padding: "8px 16px",
                            borderRadius: 6,
                            border: "none",
                            fontWeight: 600,
                            width: "100%",
                            cursor: loading ? "not-allowed" : "pointer"
                        }}
                    >
                        {loading ? "Quitando..." : "Quitar Desperdicio Cero"}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ModalDesperdicioCero;