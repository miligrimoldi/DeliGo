import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    getStockPorServicio,
    StockIngrediente,
    updateStockDisponibilidad
} from "../../api.ts";
import { toast } from "react-toastify";

const StockPage = () => {
    const { id_servicio } = useParams();
    const [ingredientes, setIngredientes] = useState<StockIngrediente[]>([]);
    const [valoresTemporales, setValoresTemporales] = useState<Record<number, number>>({});
    const [confirmandoId, setConfirmandoId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStock = async () => {
            try {
                const data = await getStockPorServicio(Number(id_servicio));
                setIngredientes(data);
                const valoresIniciales: Record<number, number> = {};
                data.forEach((ing) => {
                    valoresIniciales[ing.id_ingrediente] = ing.cantidad;
                });
                setValoresTemporales(valoresIniciales);
            } catch (error) {
                console.error("Error al obtener stock:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStock();
    }, [id_servicio]);

    const cambiarCantidad = async (id_ingrediente: number, nuevaCantidad: number) => {
        try {
            await updateStockDisponibilidad(Number(id_servicio), id_ingrediente, nuevaCantidad);
            setIngredientes(prev =>
                prev.map(ing =>
                    ing.id_ingrediente === id_ingrediente ? { ...ing, cantidad: nuevaCantidad } : ing
                )
            );
            toast.success("Stock actualizado correctamente");
        } catch (error) {
            console.error("Error al actualizar disponibilidad:", error);
            toast.error("Error al actualizar stock");
        }
    };

    if (loading) return <p style={{ textAlign: "center", marginTop: 40, fontFamily: "Poppins, sans-serif" }}>Cargando stock...</p>;

    return (
        <div style={{
            backgroundColor: "#F4F5F9",
            minHeight: "100vh",
            padding: "40px 20px",
            display: "flex",
            justifyContent: "center",
            width: "45vw",
        }}>
            <div style={{
                backgroundColor: "white",
                padding: "30px 40px",
                borderRadius: 15,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                width: "100%",
                maxWidth: 900,
                fontFamily: "Poppins, sans-serif"
            }}>
                <h2 style={{
                    color: "#5d7554",
                    fontSize: 26,
                    marginBottom: 30,
                    textAlign: "center"
                }}>
                    Gestión de Stock
                </h2>

                <ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: 30 }}>
                    {ingredientes.map((ing) => (
                        <li key={ing.id_ingrediente} style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "12px 0",
                            borderBottom: "1px solid #eee"
                        }}>
                            <span style={{
                                fontSize: 15,
                                color: "#333",
                                flex: 1,
                                marginRight: 20,
                                wordBreak: "break-word"
                            }}>
                                {ing.nombre}
                            </span>

                            <input
                                type="number"
                                value={valoresTemporales[ing.id_ingrediente]}
                                min={0}
                                onChange={(e) =>
                                    setValoresTemporales(prev => ({
                                        ...prev,
                                        [ing.id_ingrediente]: parseInt(e.target.value)
                                    }))
                                }
                                style={{
                                    width: 50,
                                    height: 28,
                                    padding: "2px 6px",
                                    fontSize: 14,
                                    border: "1px solid #ccc",
                                    borderRadius: 5,
                                    fontFamily: "Poppins, sans-serif",
                                    marginRight: 6,
                                    lineHeight: 1.1
                                }}
                            />

                            <button
                                onClick={async () => {
                                    const nuevoValor = valoresTemporales[ing.id_ingrediente];
                                    setConfirmandoId(ing.id_ingrediente);
                                    await cambiarCantidad(ing.id_ingrediente, nuevoValor);
                                    setConfirmandoId(null);
                                }}
                                disabled={confirmandoId !== null || valoresTemporales[ing.id_ingrediente] === ing.cantidad}
                                style={{
                                    backgroundColor:
                                        confirmandoId !== null || valoresTemporales[ing.id_ingrediente] === ing.cantidad
                                            ? "#ccc"
                                            : "#7A916C",
                                    color: "white",
                                    width: 26,
                                    height: 26,
                                    fontSize: 14,
                                    borderRadius: 5,
                                    border: "none",
                                    cursor:
                                        confirmandoId !== null || valoresTemporales[ing.id_ingrediente] === ing.cantidad
                                            ? "not-allowed"
                                            : "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: 0,
                                    fontFamily: "Poppins, sans-serif"
                                }}
                            >
                                ✔
                            </button>
                        </li>
                    ))}
                </ul>

                <button
                    onClick={() => navigate(`/empleado/${id_servicio}`)}
                    style={{
                        backgroundColor: "#9AAA88",
                        color: "white",
                        padding: "10px 20px",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 16,
                        cursor: "pointer",
                        display: "block",
                        margin: "0 auto"
                    }}
                >
                    Volver al Home
                </button>
            </div>
        </div>
    );
};

export default StockPage;
