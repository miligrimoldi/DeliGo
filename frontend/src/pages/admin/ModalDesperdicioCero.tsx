import { useState, useEffect } from "react";
import { marcarComoDesperdicioCero, desmarcarComoDesperdicioCero } from "../../api.ts";
import { getMaxDisponible } from "../../api";

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
    const [precioOferta, setPrecioOferta] = useState<string | number>(precioActual);
    const [descuentoPorcentaje, setDescuentoPorcentaje] = useState<string | number>(0);
    const [editando, setEditando] = useState<"porcentaje" | "precio" | null>("porcentaje");
    const [cantidadRestante, setCantidadRestante] = useState(1);
    const [tiempoLimite, setTiempoLimite] = useState("");
    const [loading, setLoading] = useState(false);
    const [confirmarDesmarcar, setConfirmarDesmarcar] = useState(false);
    const [maximoDisponible, setMaximoDisponible] = useState<number | null>(null);
    const [errorMensaje, setErrorMensaje] = useState<string | null>(null);


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
                const date = new Date(tiempoLimiteInicial);
                if (!isNaN(date.getTime())) {
                    const tzOffset = date.getTimezoneOffset() * 60000;
                    const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
                    setTiempoLimite(localISOTime);
                }
            }
        }
    }, []);

    useEffect(() => {
        if (editando === "porcentaje") {
            const nuevoPrecio = parseFloat((precioActual * (1 - Number(descuentoPorcentaje) / 100)).toFixed(2));
            setPrecioOferta(nuevoPrecio >= 0 ? nuevoPrecio : 0);
        }
    }, [descuentoPorcentaje]);

    useEffect(() => {
        if (editando === "precio") {
            const nuevoDescuento = 100 - Number(Number(precioOferta) / precioActual) * 100;
            setDescuentoPorcentaje(parseFloat(nuevoDescuento.toFixed(1)));
        }
    }, [precioOferta]);


    useEffect(() => {
        getMaxDisponible(idProducto)
            .then(setMaximoDisponible)
            .catch(() => setMaximoDisponible(null));
    }, [idProducto]);

    const handleSubmit = async () => {
        setErrorMensaje(null); // Limpiar mensaje previo

        if (tiempoLimite) {
            const fechaLimite = new Date(tiempoLimite);
            const ahora = new Date();
            if (fechaLimite < ahora) {
                setErrorMensaje("La fecha límite no puede ser anterior al momento actual.");
                return;
            }
        }

        setLoading(true);
        try {
            await marcarComoDesperdicioCero(idProducto, {
                precio_oferta: Number(precioOferta),
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

    const desmarcarProducto = async () => {
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
            <div style={{backgroundColor: "white", padding: 24, borderRadius: 12, width: 350}}>
                <h3 style={{marginBottom: 16, fontFamily: "Poppins", fontWeight: 600}}>
                    {yaMarcado ? "Editar Desperdicio Cero" : "Marcar como Desperdicio Cero"}
                </h3>

                <p style={{fontSize: 14, marginBottom: 12}}>
                    Precio original: <strong>${precioActual.toFixed(2)}</strong>
                </p>

                <label>Descuento (%):</label>
                <input
                    type="number"
                    min={0}
                    max={100}
                    value={descuentoPorcentaje.toString()}
                    onChange={(e) => {
                        setEditando("porcentaje");
                        setDescuentoPorcentaje(e.target.value);
                    }}
                    onBlur={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                            setDescuentoPorcentaje(Math.max(0, Math.min(100, val)));
                        } else {
                            setDescuentoPorcentaje(0);
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e') {
                            e.preventDefault();
                        }
                    }}
                    style={{width: "100%", padding: 8, marginBottom: 12}}
                />

                <label>Precio oferta:</label>
                <input
                    type="number"
                    min={0}
                    max={precioActual}
                    value={precioOferta.toString()}
                    onChange={(e) => {
                        setEditando("precio");
                        setPrecioOferta(e.target.value);
                    }}
                    onBlur={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                            setPrecioOferta(Math.max(0, Math.min(precioActual, val)));
                        } else {
                            setPrecioOferta(0);
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e') {
                            e.preventDefault();
                        }
                    }}
                    style={{width: "100%", padding: 8, marginBottom: 12}}
                />

                <input
                    type="number"
                    min={1}
                    max={maximoDisponible || undefined}
                    value={cantidadRestante}
                    onChange={(e) => {
                        const nueva = parseInt(e.target.value);
                        if (!isNaN(nueva)) {
                            const limitada = maximoDisponible ? Math.min(nueva, maximoDisponible) : nueva;
                            setCantidadRestante(Math.max(1, limitada));
                        }
                    }}
                    style={{ width: "100%", padding: 8, marginBottom: 12 }}
                />
                {maximoDisponible !== null && (
                    <p style={{ fontSize: 12, color: "#888" }}>
                        Stock disponible para oferta: {maximoDisponible}
                    </p>
                )}

                <label>Disponible hasta (opcional):</label>
                <input
                    type="datetime-local"
                    value={tiempoLimite}
                    onChange={(e) => setTiempoLimite(e.target.value)}
                    style={{width: "100%", padding: 8, marginBottom: 16}}
                />

                {errorMensaje && (
                    <p style={{ color: "red", fontSize: 13, marginTop: -8, marginBottom: 12 }}>
                        {errorMensaje}
                    </p>
                )}

                <div style={{display: "flex", justifyContent: "space-between", marginTop: 12}}>
                    <button onClick={onClose} style={{padding: "8px 16px"}}>Cancelar</button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || Number(precioOferta) <= 0}
                        style={{
                            backgroundColor: "#4B614C", color: "white", border: "none",
                            padding: "8px 16px", borderRadius: 6, fontWeight: 600,
                            cursor: loading ? "not-allowed" : "pointer"
                        }}
                    >
                        {loading ? "Guardando..." : "Confirmar"}
                    </button>
                </div>

                {yaMarcado && !confirmarDesmarcar && (
                    <button
                        onClick={() => setConfirmarDesmarcar(true)}
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
                        Quitar Desperdicio Cero
                    </button>
                )}

                {confirmarDesmarcar && (
                    <div style={{
                        marginTop: 5,
                        backgroundColor: '#fcebea',
                        padding: 12,
                        borderRadius: 6,
                        border: '1px solid #a94442',
                        fontFamily: 'Poppins',
                        textAlign: 'center'
                    }}>
                        <p style={{ marginBottom: 5 }}>¿Estás seguro que querés quitar este producto de Desperdicio Cero?</p>
                        <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
                            <button
                                onClick={() => setConfirmarDesmarcar(false)}
                                style={{
                                    padding: "6px 12px",
                                    backgroundColor: "#ccc",
                                    border: "none",
                                    borderRadius: 4,
                                    cursor: "pointer"
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={desmarcarProducto}
                                disabled={loading}
                                style={{
                                    padding: "6px 12px",
                                    backgroundColor: "#a94442",
                                    color: "white",
                                    border: "none",
                                    borderRadius: 4,
                                    fontWeight: 400,
                                    cursor: loading ? "not-allowed" : "pointer"
                                }}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModalDesperdicioCero;