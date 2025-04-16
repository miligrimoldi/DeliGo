import { useEffect, useState } from "react";
import { fetchCategoriasPorServicio, Categoria } from "../../api.ts";

type Props = {
    id_servicio: number;
};

const CategoriasPanel = ({ id_servicio }: Props) => {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const cargarCategorias = async () => {
            try {
                const data = await fetchCategoriasPorServicio(id_servicio);
                setCategorias(data);
            } catch (err) {
                console.error(err);
                setError("Error al cargar las categorías");
            } finally {
                setLoading(false);
            }
        };

        cargarCategorias();
    }, [id_servicio]);

    if (loading) return <p>Cargando categorías...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="categorias-panel">
            <h2>Categorías</h2>
            <div className="categorias-lista">
                {categorias.map((cat) => (
                    <button key={cat.id_categoria} className="btn-categoria">
                        {cat.nombre}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoriasPanel;
