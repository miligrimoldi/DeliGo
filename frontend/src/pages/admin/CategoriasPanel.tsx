import { useEffect, useState } from "react";
import { fetchCategoriasPorServicio, fetchProductosPorCategoria, crearProducto, Producto, Categoria } from "../../api.ts";


type Props = {
    id_servicio: number;
};

const CategoriasPanel = ({ id_servicio }: Props) => {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        nombre: "",
        precio_actual: 0,
        descripcion: "",
        informacion_nutricional: "",
        foto: "",
    })

    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = event.target;
        setFormData(prev => ({ ...prev, [name]: name === "precio_actual" ? parseFloat(value) : value }));
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!categoriaSeleccionada) return;

        try {
            await crearProducto(id_servicio, categoriaSeleccionada.id_categoria, formData);
            setFormData({
                nombre: "",
                precio_actual: 0,
                descripcion: "",
                informacion_nutricional: "",
                foto: "",
            });
            setMostrarFormulario(false);
            const nuevosProductos = await fetchProductosPorCategoria(id_servicio, categoriaSeleccionada.id_categoria);
            setProductos(nuevosProductos);
        } catch (error) {
            console.error("Error al crear producto:", error);
            alert("Error al crear producto");
        }

    }

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

    const handleSeleccionCategoria = async (categoria: Categoria) => {
        setCategoriaSeleccionada(categoria);
        setLoading(true);
        try {
            const data = await fetchProductosPorCategoria(id_servicio, categoria.id_categoria);
            setProductos(data);
        } catch (err) {
            console.error(err);
            setError("Error al cargar los productos");
        } finally {
            setLoading(false);
        }

    }

    if (loading) return <p>Cargando categorías...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="categorias-panel">
            <h2>Categorías</h2>
            <div className="categorias-lista">
                {categorias.map((cat) => (
                    <button key={cat.id_categoria} className="btn-categoria" onClick={() => handleSeleccionCategoria(cat)}>
                        {cat.nombre}
                    </button>
                ))}
            </div>
            {categoriaSeleccionada && (
                <div className="productos-panel">
                    <h3>Productos seleccionados en "{categoriaSeleccionada.nombre}" </h3>
                    {productos.length === 0 ? (
                            <p>No hay productos aun</p>
                    ) : (
                        <ul className="lista-productos">
                            {productos.map((producto) => (
                                <li key={producto.id_producto}>
                                    <strong>{producto.nombre}</strong> - ${producto.precio_actual.toFixed(2)}
                                </li>
                            ))}
                        </ul>
                    )}
                    <button className="cargar-producto" onClick={() => setMostrarFormulario((prev) => !prev)}>
                        {mostrarFormulario ? "Cancelar" : "Cargar producto"}
                    </button>

                    {mostrarFormulario && (
                    <form className="formulario-producto" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="nombre"
                            placeholder="Nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="number"
                            name="precio_actual"
                            placeholder="Precio"
                            value={formData.precio_actual}
                            onChange={handleChange}
                            required
                            step="0.01"
                        />
                        <textarea
                            name="descripcion"
                            placeholder="Descripción"
                            value={formData.descripcion}
                            onChange={handleChange}
                        />
                        <textarea
                            name="informacion_nutricional"
                            placeholder="Información Nutricional"
                            value={formData.informacion_nutricional}
                            onChange={handleChange}
                        />
                        <input
                            type="text"
                            name="foto"
                            placeholder="URL de la foto"
                            value={formData.foto}
                            onChange={handleChange}
                        />
                        <button type="submit">Crear Producto</button>
                    </form>
                    )}
                </div>
            )}
        </div>


    );
};

export default CategoriasPanel;
