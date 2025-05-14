import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api";
import { FaStar } from "react-icons/fa";

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

    return (
        <div style={{ padding: 30 }}>
            <h2 style={{ fontFamily: "Poppins", marginBottom: 20 }}>Opiniones y puntajes</h2>

            <div style={{
                display: "flex", gap: 24, flexWrap: "wrap"
            }}>
                {/*Opiniones generales */}
                <div style={{ background: "white", borderRadius: 10, padding: 20, flex: 1, minWidth: 300 }}>
                    <h3 style={{ marginBottom: 10 }}>Opiniones generales del servicio</h3>
                    <p style={{ fontSize: 36, fontWeight: 600 }}>{puntajeServicio.toFixed(1)} <FaStar style={{ color: "#769B7B" }} /></p>
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

                {/*Productos del servicio */}
                <div style={{ background: "white", borderRadius: 10, padding: 20, flex: 1, minWidth: 300 }}>
                    <h3 style={{ marginBottom: 10 }}>Productos del servicio</h3>
                    {productosOpinados.map((p) => (
                        <div key={p.id_producto} style={{
                            display: "flex", alignItems: "center", marginBottom: 12
                        }}>
                            <img src={p.foto} alt={p.nombre} style={{ width: 50, height: 50, borderRadius: 10, marginRight: 10 }} />
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
        </div>
    );
};

export default Opiniones;
