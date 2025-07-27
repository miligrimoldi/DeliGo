import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    getStockPorServicio,
    StockIngrediente,
    updateStockDisponibilidad
} from "../../api.ts";
import { toast } from "react-toastify";
import AdminNavbar from "../../components/AdminNavbar";

const StockPage = () => {
    const { id_servicio } = useParams();
    const servicioId = parseInt(id_servicio ?? "0", 10);
    const [ingredientes, setIngredientes] = useState<StockIngrediente[]>([]);
    const [valoresTemporales, setValoresTemporales] = useState<Record<number, number>>({});
    const [confirmandoId, setConfirmandoId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [nuevoNombre, setNuevoNombre] = useState("");
    const [nuevaCantidad, setNuevaCantidad] = useState(0);
    const [confirmandoEliminarId, setConfirmandoEliminarId] = useState<number | null>(null);

    const agregarIngrediente = async () => {
        if (!nuevoNombre.trim()) return;
        try {
            const res = await fetch(`/stock/${id_servicio}/nuevo`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    nombre: nuevoNombre.trim(),
                    cantidad: nuevaCantidad,
                }),
            });

            if (!res.ok) throw new Error("Ya existe o error al agregar");
            toast.success("Ingrediente agregado");
            setNuevoNombre("");
            setNuevaCantidad(0);

            const data = await getStockPorServicio(Number(id_servicio));
            setIngredientes(data);
            const iniciales: Record<number, number> = {};
            data.forEach((ing) => (iniciales[ing.id_ingrediente] = ing.cantidad));
            setValoresTemporales(iniciales);
        } catch (e) {
            console.error(e);
            toast.error("No se pudo agregar el ingrediente");
        }
    };

    const eliminarIngrediente = async (id_ingrediente: number) => {
        try {
            const res = await fetch(`/stock/${id_servicio}/${id_ingrediente}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!res.ok) throw new Error("No se pudo eliminar");

            setIngredientes(prev => prev.filter(i => i.id_ingrediente !== id_ingrediente));
            toast.success("Ingrediente eliminado");
            setConfirmandoEliminarId(null);
        } catch (e) {
            console.error(e);
            toast.error("Error al eliminar ingrediente");
        }
    };

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


    const user = JSON.parse(localStorage.getItem("user") || "null");

    return (
        <div style={{ backgroundColor: "#f4f5f9", minHeight: "100vh", paddingBottom: 60 }}>
            <div style={{
                backgroundColor: "#f4f5f9",
                padding: "25px 40px",
                borderBottom: "1px solid #ccc",
                position: "sticky",
                top: 0,
                zIndex: 10,
                textAlign: "center"
            }}>
                <h2 style={{
                    fontFamily: "Poppins",
                    fontSize: 26,
                    color: "#333",
                    margin: 0
                }}>
                    Gestión de Stock
                </h2>
            </div>


            <div style={{
                backgroundColor: "#ffffff",
                borderRadius: 10,
                padding: "30px 40px",
                margin: "30px auto",
                maxWidth: 800,
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                fontFamily: "Poppins, sans-serif"
            }}>
                {/* Formulario para nuevo ingrediente */}
                <div style={{ marginBottom: 30, textAlign: "center" }}>
                    <h4 style={{ marginBottom: 10, fontSize: 18, fontWeight: 500 }}>Agregar nuevo ingrediente</h4>
                    <input
                        type="text"
                        placeholder="Nombre del ingrediente"
                        value={nuevoNombre}
                        onChange={(e) => setNuevoNombre(e.target.value)}
                        style={{ marginRight: 10, padding: 8, borderRadius: 6, border: "1px solid #ccc", width: 180 }}
                    />
                    <input
                        type="number"
                        placeholder="Cantidad"
                        min={0}
                        value={nuevaCantidad}
                        onChange={(e) => setNuevaCantidad(parseInt(e.target.value))}
                        style={{ marginRight: 10, padding: 8, borderRadius: 6, border: "1px solid #ccc", width: 100 }}
                    />
                    <button
                        onClick={agregarIngrediente}
                        style={{
                            backgroundColor: "#7A916C",
                            color: "white",
                            border: "none",
                            borderRadius: 6,
                            padding: "8px 16px",
                            fontFamily: "Poppins"
                        }}
                    >
                        Agregar
                    </button>
                </div>

                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
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
                                    marginRight: 6
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
                                    justifyContent: "center"
                                }}
                            >
                                ✔
                            </button>

                            {confirmandoEliminarId === ing.id_ingrediente ? (
                                <button
                                    onClick={() => eliminarIngrediente(ing.id_ingrediente)}
                                    style={{
                                        backgroundColor: "red",
                                        color: "white",
                                        marginLeft: 6,
                                        borderRadius: 5,
                                        padding: "4px 8px",
                                        fontFamily: "Poppins",
                                        border: "none",
                                        fontSize: 13,
                                        cursor: "pointer"
                                    }}
                                >
                                    Confirmar ❌
                                </button>
                            ) : (
                                <button
                                    onClick={() => setConfirmandoEliminarId(ing.id_ingrediente)}
                                    style={{
                                        backgroundColor: "#ccc",
                                        marginLeft: 6,
                                        borderRadius: 5,
                                        padding: "4px 8px",
                                        fontFamily: "Poppins",
                                        border: "none",
                                        fontSize: 13,
                                        cursor: "pointer"
                                    }}
                                >
                                    ❌
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Barra de navegación al final */}
            <AdminNavbar id_servicio={servicioId} esAdmin={user?.esAdmin || false}/>
        </div>
    );
};

export default StockPage;
