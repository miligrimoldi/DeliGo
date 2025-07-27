import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api";
import { FaStar } from "react-icons/fa";
import AdminNavbar from "../../components/AdminNavbar";

type OpinionServicio = {
    usuario: string;
    comentario: string;
    puntaje: number;
    fecha: string;
};

type ProductoOpinion = {
    id_producto: number;
    nombre: string;
    foto: string;
    puntaje_promedio: number;
    cantidad_opiniones: number;
};

const Opiniones = () => {
    const { id_servicio } = useParams();
    const [puntajeServicio, setPuntajeServicio] = useState(0);
    const [opinionesServicio, setOpinionesServicio] = useState<OpinionServicio[]>([]);
    const [productosOpinados, setProductosOpinados] = useState<ProductoOpinion[]>([]);

    useEffect(() => {
        const fetchOpiniones = async () => {
            const res1 = await api.get(`/admin/servicio/${id_servicio}/opiniones`);
            const res2 = await api.get(`/admin/servicio/${id_servicio}/productos-opinados`);
            setPuntajeServicio(res1.data.promedio);
            setOpinionesServicio(res1.data.opiniones);
            setProductosOpinados(res2.data.productos);
        };
        fetchOpiniones();
    }, [id_servicio]);

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
                    Opiniones y puntajes
                </h2>
            </div>

            <div style={{
                padding: 30,
                maxWidth: 1000,
                margin: "0 auto",
                fontFamily: "Poppins, sans-serif",
                display: "flex",
                gap: 30,
                flexWrap: "wrap"
            }}>
                {/* Opiniones generales */}
                <div style={{
                    background: "white",
                    borderRadius: 10,
                    padding: 20,
                    flex: 1,
                    minWidth: 300,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                }}>
                    <h3 style={{ marginBottom: 10 }}>Opiniones generales del servicio</h3>
                    <p style={{ fontSize: 36, fontWeight: 600 }}>
                        {puntajeServicio.toFixed(1)} <FaStar style={{ color: "#769B7B" }} />
                    </p>
                    <p>{opinionesServicio.length} reseñas</p>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {opinionesServicio.map((o, idx) => (
                            <li key={idx} style={{ marginBottom: 10 }}>
                                <strong>{o.usuario}</strong> — {o.puntaje}★<br />
                                <span style={{ fontSize: 14, color: "#555" }}>{o.comentario}</span><br />
                                <small style={{ color: "#999" }}>{o.fecha}</small>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Productos opinados */}
                <div style={{
                    background: "white",
                    borderRadius: 10,
                    padding: 20,
                    flex: 1,
                    minWidth: 300,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                }}>
                    <h3 style={{ marginBottom: 10 }}>Productos del servicio</h3>
                    {productosOpinados.map((p) => (
                        <div key={p.id_producto} style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 12
                        }}>
                            <img src={p.foto} alt={p.nombre}
                                 style={{
                                     width: 50,
                                     height: 50,
                                     borderRadius: 10,
                                     marginRight: 10,
                                     objectFit: "cover"
                                 }} />
                            <div style={{ flex: 1 }}>
                                <strong>{p.nombre}</strong><br />
                                {p.cantidad_opiniones > 0 ? (
                                    <span style={{ color: "#769B7B" }}>
                                        {Number(p.puntaje_promedio).toFixed(1)}★ · {p.cantidad_opiniones} {p.cantidad_opiniones === 1 ? "reseña" : "reseñas"}
                                    </span>
                                ) : (
                                    <span style={{ color: "#999" }}>Sin reseñas aún</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <AdminNavbar id_servicio={parseInt(id_servicio ?? "0", 10)} esAdmin={user?.esAdmin || false} />
        </div>
    );
};

export default Opiniones;
