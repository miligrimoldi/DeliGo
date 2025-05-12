import React, { useEffect, useState } from "react";
import {
    fetchCategoriasPorServicio,
    fetchProductosPorCategoria,
    crearProducto,
    Producto,
    Categoria,
    eliminarProducto,
    modificarProducto, asociarIngredientesAProducto, desasociarIngredientesDeProducto, obtenerIngredientesDeProducto,
} from "../../api.ts";
import "../../css/CategoriasPanel.css";

type Props = {
    id_servicio: number;
};
interface Ingrediente {
    id_ingrediente: number;
    nombre: string;
}

const CategoriasPanel = ({ id_servicio }: Props) => {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [productoEditando, setProductoEditando] = useState<Producto | null>(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [ingredientesDisponibles, setIngredientesDisponibles] = useState<string[]>([]);
    const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState<string[]>([]);
    const [nuevoIngrediente, setNuevoIngrediente] = useState("");
    const [ingredientesOriginales, setIngredientesOriginales] = useState<Ingrediente[]>([]);


    const [formData, setFormData] = useState({
        nombre: "",
        precio_actual: 0,
        descripcion: "",
        informacion_nutricional: "",
        foto: "",
    });

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: name === "precio_actual" ? parseFloat(value) : value }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!categoriaSeleccionada) return;

        try {
            let id_producto: number;

            if (productoEditando) {
                // Modificamos el producto
                await modificarProducto(productoEditando.id_producto, formData);
                id_producto = productoEditando.id_producto;

                // Asociar ingredientes nuevos
                await asociarIngredientesAProducto(id_producto, ingredientesSeleccionados);

                // Desasociar los eliminados
                const ingredientesEliminados = ingredientesOriginales
                    .filter(orig => !ingredientesSeleccionados.includes(orig.nombre))
                    .map(ing => ing.id_ingrediente);

                if (ingredientesEliminados.length > 0) {
                    await desasociarIngredientesDeProducto(id_producto, ingredientesEliminados);
                }

                setProductoEditando(null);

            } else {
                // Creamos el producto
                const nuevoProducto = await crearProducto(
                    id_servicio,
                    categoriaSeleccionada.id_categoria,
                    formData
                );
                id_producto = nuevoProducto.id_producto;

                // Asociamos los ingredientes seleccionados
                await asociarIngredientesAProducto(id_producto, ingredientesSeleccionados);
            }

            // Reset del formulario
            setFormData({
                nombre: "",
                precio_actual: 0,
                descripcion: "",
                informacion_nutricional: "",
                foto: "",
            });

            setIngredientesSeleccionados([]);
            setIngredientesOriginales([]);
            setMostrarFormulario(false);

            // Recargar productos
            const nuevosProductos = await fetchProductosPorCategoria(
                id_servicio,
                categoriaSeleccionada.id_categoria
            );
            setProductos(nuevosProductos);

        } catch (error) {
            console.error("Error al guardar producto:", error);
            alert("Error al guardar producto");
        }
    };

    const obtenerImagenCategoria = (nombre: string): string => {
        const nombreNormalizado = nombre.toLowerCase();
        switch (nombreNormalizado) {
            case 'menú':
                return "/img/menu.png";
            case 'ensalada':
                return "/img/ensalada.png";
            case 'extras':
                return "/img/burga.png";
            case 'bebidas':
                return "/img/bebida.png";
            case 'dulce':
                return "/img/torta.png";
            case 'salado':
                return "/img/salado.png";
            case 'kiosko':
                return "/img/kiosko.png";
            case 'guarniciones':
                return "/img/guarniciones.png";
            case 'principales':
                return "/img/menu.png";
            default:
                return "/img/default.png";
        }
    };

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

    useEffect(() => {
        const fetchIngredientes = async () => {
            try {
                const res = await fetch(`/ingredientes/por-servicio/${id_servicio}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                const data = await res.json();
                setIngredientesDisponibles(data.map((ing:any) => ing.nombre));
            } catch (e) {
                console.error("error cargando ingredientes", e);
            }
        };
        fetchIngredientes();
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
    };

    const handleEliminarProducto = async (id_producto: number) => {
        const confirmado = confirm("¿Estás seguro que quieres eliminar este producto?");
        if (!confirmado || !categoriaSeleccionada) return;
        try {
            await eliminarProducto(id_producto);
            const nuevosProductos = await fetchProductosPorCategoria(id_servicio, categoriaSeleccionada.id_categoria);
            setProductos(nuevosProductos);
        } catch (error) {
            console.error("Error al eliminar producto:", error);
            alert("Error al eliminar el producto.");
        }
    };

    if (loading) return <p className="admin-loading">Cargando categorías...</p>;
    if (error) return <p className="admin-error">{error}</p>;

    return (
        <div className="categorias-panel">
            <h2 className="panel-titulo">Categorias</h2>
            <div style={{
                backgroundColor: "white",
                borderRadius: 10,
                padding: "20px",
                margin: "0 10px"
            }}>
                <div style={{
                    display: "flex",
                    overflowX: "auto",
                    gap: 10,
                    paddingTop: 10
                }}>
                    {categorias.map((cat) => (
                        <div
                            key={cat.id_categoria}
                            onClick={() => handleSeleccionCategoria(cat)}
                            style={{
                                minWidth: 83,
                                height: 132,
                                backgroundColor: categoriaSeleccionada?.id_categoria === cat.id_categoria ? "#7A916C" : "#9AAA88",
                                borderRadius: 10,
                                textAlign: "center",
                                color: categoriaSeleccionada?.id_categoria === cat.id_categoria ? "white" : "#4B614C",
                                fontFamily: "Lato",
                                fontWeight: 800,
                                fontSize: 13,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                cursor: "pointer"
                            }}
                        >
                            <img
                                src={obtenerImagenCategoria(cat.nombre)}
                                style={{
                                    width: 59,
                                    height: 66,
                                    objectFit: "contain",
                                    borderRadius: "50%",
                                    backgroundColor: "#B1C89A",
                                    margin: "0 auto 8px",
                                    padding: 6
                                }}
                            />
                            {cat.nombre.toUpperCase()}
                        </div>
                    ))}
                </div>
            </div>

            {categoriaSeleccionada && (
                <div className="productos-panel">
                    <h3 className="titulo-productos">Productos en "{categoriaSeleccionada.nombre}"</h3>
                    {productos.length === 0 ? (
                        <p className="admin-loading">No hay productos aún en esta categoría.</p>
                    ) : (
                        <ul className="lista-productos">
                            {productos.map((producto) => (
                                <li key={producto.id_producto} className="item-producto">
                                    <strong>{producto.nombre}</strong> - ${producto.precio_actual.toFixed(2)}
                                    <div className="botones-acciones">
                                        <button className="btn-accion eliminar" onClick={() => handleEliminarProducto(producto.id_producto)}>Eliminar</button>
                                        <button
                                            className="btn-accion editar"
                                            onClick={async () => {
                                                setProductoEditando(producto);
                                                setFormData({
                                                    nombre: producto.nombre,
                                                    precio_actual: producto.precio_actual,
                                                    descripcion: producto.descripcion,
                                                    informacion_nutricional: producto.informacion_nutricional || "",
                                                    foto: producto.foto || "",
                                                });
                                                try {
                                                    const data = await obtenerIngredientesDeProducto(producto.id_producto);

                                                    const nombres = data.ingredientes.map((ing: any) => ing.nombre);

                                                    setIngredientesSeleccionados(nombres);
                                                    setIngredientesOriginales(data.ingredientes);
                                                } catch (error) {
                                                    console.error("Error al cargar ingredientes del producto:", error);
                                                }

                                                setMostrarFormulario(true);
                                            }}
                                        >
                                            Editar
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    <button className="btn-agregar" onClick={() => setMostrarFormulario((prev) => !prev)}>
                        {mostrarFormulario ? "Cancelar" : "Cargar nuevo producto"}
                    </button>

                    {mostrarFormulario && (
                        <form className="formulario-producto" onSubmit={handleSubmit} style={{ marginTop: 20, padding: 15, backgroundColor: "white", borderRadius: 10, boxShadow: "0 1px 5px rgba(0,0,0,0.1)" }}>
                            <div style={{ marginBottom: 15 }}>
                                <label htmlFor="nombre" style={{ display: "block", marginBottom: 5, fontFamily: "Montserrat", fontSize: 14, color: "#333" }}>Nombre:</label>
                                <input type="text" id="nombre" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required style={{ width: "100%", padding: 8, borderRadius: 5, border: "1px solid #ccc", fontFamily: "Montserrat", fontSize: 14 }} />
                            </div>

                            <div style={{ marginBottom: 15 }}>
                                <label htmlFor="precio_actual" style={{ display: "block", marginBottom: 5, fontFamily: "Montserrat", fontSize: 14, color: "#333" }}>Precio:</label>
                                <input type="number" id="precio_actual" name="precio_actual" placeholder="Precio" value={formData.precio_actual} onChange={handleChange} required step="0.01" style={{ width: "100%", padding: 8, borderRadius: 5, border: "1px solid #ccc", fontFamily: "Montserrat", fontSize: 14 }} />
                            </div>

                            <div style={{ marginBottom: 15 }}>
                                <label htmlFor="descripcion" style={{ display: "block", marginBottom: 5, fontFamily: "Montserrat", fontSize: 14, color: "#333" }}>Descripción:</label>
                                <textarea id="descripcion" name="descripcion" placeholder="Descripción" value={formData.descripcion} onChange={handleChange} style={{ width: "100%", padding: 8, borderRadius: 5, border: "1px solid #ccc", fontFamily: "Montserrat", fontSize: 14, minHeight: 80 }} />
                            </div>

                            <div style={{ marginBottom: 15 }}>
                                <label htmlFor="informacion_nutricional" style={{ display: "block", marginBottom: 5, fontFamily: "Montserrat", fontSize: 14, color: "#333" }}>Información Nutricional:</label>
                                <textarea id="informacion_nutricional" name="informacion_nutricional" placeholder="Información Nutricional" value={formData.informacion_nutricional} onChange={handleChange} style={{ width: "100%", padding: 8, borderRadius: 5, border: "1px solid #ccc", fontFamily: "Montserrat", fontSize: 14, minHeight: 80 }} />
                            </div>

                            <div style={{ marginBottom: 15 }}>
                                <label htmlFor="foto" style={{ display: "block", marginBottom: 5, fontFamily: "Montserrat", fontSize: 14, color: "#333" }}>URL de la foto:</label>
                                <input type="text" id="foto" name="foto" placeholder="URL de la foto" value={formData.foto} onChange={handleChange} style={{ width: "100%", padding: 8, borderRadius: 5, border: "1px solid #ccc", fontFamily: "Montserrat", fontSize: 14 }} />
                            </div>

                            <div style={{ marginBottom: 15 }}>
                                <label style={{ display: "block", fontFamily: "Montserrat", marginBottom: 5 }}>
                                    Ingredientes del producto:
                                </label>

                                <select
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value && !ingredientesSeleccionados.includes(value)) {
                                            setIngredientesSeleccionados([...ingredientesSeleccionados, value]);
                                        }
                                    }}
                                    defaultValue=""
                                    style={{ width: "100%", padding: 8 }}
                                >
                                    <option value="" disabled>Seleccionar ingrediente...</option>
                                    {ingredientesDisponibles.map((ing) => (
                                        <option key={ing} value={ing}>{ing}</option>
                                    ))}
                                </select>

                                <ul style={{ marginTop: 10 }}>
                                    {ingredientesSeleccionados.map((ing) => (
                                        <li key={ing}>
                                            {ing}
                                            <button type="button" onClick={() => setIngredientesSeleccionados(prev => prev.filter(i => i !== ing))}>
                                                ❌
                                            </button>
                                        </li>
                                    ))}
                                </ul>

                                <input
                                    type="text"
                                    placeholder="Agregar ingrediente nuevo"
                                    value={nuevoIngrediente}
                                    onChange={(e) => setNuevoIngrediente(e.target.value)}
                                    style={{ width: "80%", marginTop: 10 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const ing = nuevoIngrediente.trim();
                                        if (ing && !ingredientesDisponibles.includes(ing)) {
                                            setIngredientesDisponibles([...ingredientesDisponibles, ing]);
                                        }
                                        if (ing && !ingredientesSeleccionados.includes(ing)) {
                                            setIngredientesSeleccionados([...ingredientesSeleccionados, ing]);
                                        }
                                        setNuevoIngrediente("");
                                    }}
                                >
                                    Agregar
                                </button>
                            </div>

                            <button type="submit" className="btn-submit" style={{ backgroundColor: "#008cba", color: "white", border: "none", borderRadius: 8, padding: "10px 15px", cursor: "pointer", fontSize: 16, fontFamily: "Montserrat" }}>
                                {productoEditando ? "Modificar Producto" : "Crear Producto"}
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
};

export default CategoriasPanel;