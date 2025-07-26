import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import { FaArrowLeft, FaPen } from "react-icons/fa";

const StarRating = ({ rating, setRating }: { rating: number; setRating: (val: number) => void }) => {
    return (
        <div style={{ display: "flex", gap: 4 }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    onClick={() => setRating(star)}
                    style={{
                        cursor: "pointer",
                        fontSize: 24,
                        color: star <= rating ? "#4B614C" : "#ccc",
                    }}
                >
                    ★
                </span>
            ))}
        </div>
    );
};

const Opinar = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pedido, setPedido] = useState<any>(null);
    const [comentarioServicio, setComentarioServicio] = useState("");
    const [puntajeServicio, setPuntajeServicio] = useState(0);
    const [opinionesProducto, setOpinionesProducto] = useState<any[]>([]);
    const [mostrarExito, setMostrarExito] = useState(false);

    useEffect(() => {
        const fetchPedido = async () => {
            const response = await api.get(`/api/pedidos/${id}`);
            setPedido(response.data);
            setOpinionesProducto(
                response.data.detalles.map((d: any) => ({
                    id_producto: d.id_producto,
                    nombre: d.producto.nombre,
                    foto: d.producto.foto,
                    comentario: "",
                    puntaje: 0,
                }))
            );
        };
        fetchPedido();
    }, [id]);

    const handleSubmit = async () => {
        try {
            await api.post("/api/opinion/servicio", {
                id_servicio: pedido.servicio.id_servicio,
                id_pedido: pedido.id_pedido,
                comentario: comentarioServicio,
                puntaje: puntajeServicio,
            });

            for (const opinion of opinionesProducto) {
                await api.post("/api/opinion/producto", {
                    id_producto: opinion.id_producto,
                    id_pedido: pedido.id_pedido,
                    comentario: opinion.comentario,
                    puntaje: opinion.puntaje,
                });
            }

            setMostrarExito(true);
        } catch (error) {
            alert("Error al guardar opiniones");
        }
    };

    if (!pedido) return <div>Cargando...</div>;

    return (
        <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
                <FaArrowLeft style={{ cursor: "pointer" }} onClick={() => navigate(-1)} />
                <h2 style={{ marginLeft: 10 }}>Opinar</h2>
            </div>

            <h3 style={{ fontWeight: 600 }}>¿Cómo estuvo tu experiencia?</h3>
            <p style={{ marginBottom: 0, color: "#868889" }}>Calificar: <strong>{pedido.servicio.nombre}</strong></p>
            <StarRating rating={puntajeServicio} setRating={setPuntajeServicio} />
            <textarea
                placeholder="Contanos sobre tu experiencia"
                value={comentarioServicio}
                onChange={(e) => setComentarioServicio(e.target.value)}
                style={{ width: "100%", padding: 10, marginTop: 10, borderRadius: 5, border: "1px solid #ccc" }}
            />

            <h4 style={{ marginTop: 30, color: "#868889" }}>Calificar productos:</h4>
            {opinionesProducto.map((op, idx) => (
                <div key={op.id_producto} style={{ display: "flex", flexDirection: "column", background: "#fff", borderRadius: 10, padding: 10, marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <img src={op.foto} alt={op.nombre} style={{ width: 60, height: 60, borderRadius: 10, marginRight: 10 }} />
                        <div>
                            <strong>{op.nombre}</strong>
                            <StarRating
                                rating={op.puntaje}
                                setRating={(val) => {
                                    const copia = [...opinionesProducto];
                                    copia[idx].puntaje = val;
                                    setOpinionesProducto(copia);
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", marginTop: 10 }}>
                        <FaPen style={{ marginRight: 8, color: "#868889" }} />
                        <input
                            type="text"
                            placeholder="Comentario"
                            value={op.comentario}
                            onChange={(e) => {
                                const copia = [...opinionesProducto];
                                copia[idx].comentario = e.target.value;
                                setOpinionesProducto(copia);
                            }}
                            style={{ flex: 1, borderRadius: 5, padding: 8, border: "1px solid #ccc" }}
                        />
                    </div>
                </div>
            ))}

            <button
                onClick={handleSubmit}
                style={{
                    marginTop: 20,
                    width: "100%",
                    height: 60,
                    background: "linear-gradient(138deg, #AEDC81 0%, #C7DDB1 100%)",
                    borderRadius: 5,
                    border: "none",
                    color: "white",
                    fontSize: 16,
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    cursor: "pointer"
                }}
            >
                Opinar
            </button>

            {mostrarExito && (
                <div style={{
                    position: "fixed",
                    top: 0, left: 0,
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 9999
                }}>
                    <div style={{
                        backgroundColor: "white",
                        padding: 30,
                        borderRadius: 10,
                        textAlign: "center",
                        maxWidth: 400
                    }}>
                        <h2 style={{ fontFamily: "Poppins", color: "#4B614C", marginBottom: 20 }}>¡Gracias por tu opinión!</h2>
                        <button
                            onClick={() => navigate("/mis-pedidos")}
                            style={{
                                backgroundColor: "#AEDC81",
                                border: "none",
                                borderRadius: 5,
                                color: "white",
                                fontSize: 16,
                                fontFamily: "Poppins",
                                padding: "12px 24px",
                                cursor: "pointer"
                            }}
                        >
                            Volver a mis pedidos
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Opinar;