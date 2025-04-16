import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getDetalleServicio } from "../api";

type Categoria = {
    id_categoria: number;
    nombre: string;
};

type Servicio = {
    id_servicio: number;
    nombre: string;
};

type Entidad = {
    id_entidad: number;
    nombre: string;
};

const HomeServicioUsuario = () => {
    const { id_servicio } = useParams();
    const [servicio, setServicio] = useState<Servicio | null>(null);
    const [entidad, setEntidad] = useState<Entidad | null>(null);
    const [categorias, setCategorias] = useState<Categoria[]>([]);

    useEffect(() => {
        if (!id_servicio) return;

        getDetalleServicio(Number(id_servicio)).then((data) => {
            setServicio(data.servicio);
            setEntidad(data.entidad);
            setCategorias(data.categorias);
        });
    }, [id_servicio]);

    if (!servicio || !entidad) return <p>Cargando...</p>;

    return (
        <div className="home">
            <h2>
                {servicio.nombre} - {entidad.nombre}
            </h2>
            <h3>Categorías</h3>
            <ul>
                {categorias.map((c) => (
                    <li key={c.id_categoria}>{c.nombre}</li>
                ))}
            </ul>
        </div>
    );
};

export default HomeServicioUsuario;
