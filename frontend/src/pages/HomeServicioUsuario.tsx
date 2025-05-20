import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {getDetalleServicio, fetchProductosPorCategoriaPublica} from "../api.ts";
import { FaArrowLeft, FaFilter } from "react-icons/fa";
import { useCarrito } from './CarritoContext.tsx';

type Categoria = {
    id_categoria: number;
    nombre: string;
};

type Producto = {
    id_producto: number;
    nombre: string;
    descripcion: string;
    precio_actual: number;
    foto: string;
    puntaje_promedio?: number;
    es_desperdicio_cero?: boolean;
    precio_oferta?: number;
    cantidad_restante?: number;
    tiempo_limite?: string | null;
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
    const { id_servicio } = useParams<{ id_servicio: string }>();
    const navigate = useNavigate();
    const [servicio, setServicio] = useState<Servicio | null>(null);
    const [entidad, setEntidad] = useState<Entidad | null>(null);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [productosPorCategoria, setProductosPorCategoria] = useState<Record<number, Producto[]>>({});
    const [filtro, setFiltro] = useState("");
    const [minPrecio, setMinPrecio] = useState("");
    const [maxPrecio, setMaxPrecio] = useState("");
    const [minPuntaje, setMinPuntaje] = useState("");
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const refs = useRef<Record<number, HTMLDivElement | null>>({});
    const { items, setServicioActivo } = useCarrito();
    const totalArticulos = items.reduce((sum, item) => sum + item.cantidad, 0);


    useEffect(() => {
        if (!id_servicio) return;

        // Función que obtiene los detalles del servicio y productos
        const fetchData = async () => {
            const data = await getDetalleServicio(Number(id_servicio));
            setServicio(data.servicio);
            setEntidad(data.entidad);
            setCategorias(data.categorias);
            setServicioActivo(data.servicio.id_servicio);

            const productosMap: Record<number, Producto[]> = {};
            await Promise.all(
                data.categorias.map(async (cat: Categoria) => {
                    const productos = await fetchProductosPorCategoriaPublica(Number(id_servicio), cat.id_categoria);
                    productosMap[cat.id_categoria] = productos;
                })
            );
            setProductosPorCategoria(productosMap);
        };

        // Llamada inicial para obtener los datos
        fetchData();

        // Configurar el intervalo de 20 segundos
        const intervalId = setInterval(fetchData, 20000);

        // Limpiar el intervalo cuando el componente se desmonte o id_servicio cambie
        return () => {
            clearInterval(intervalId);
        };
    }, [id_servicio]);

    const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFiltro(e.target.value.toLowerCase());
    };

    const filtrarProducto = (p: Producto) => {
        const nombreMatch = filtro === "" || p.nombre.toLowerCase().includes(filtro);
        const precio = p.precio_actual;
        const cumpleMin = minPrecio === "" || precio >= parseFloat(minPrecio);
        const cumpleMax = maxPrecio === "" || precio <= parseFloat(maxPrecio);
        const puntaje = p.puntaje_promedio ?? 0;
        const cumplePuntaje = minPuntaje === "" || puntaje >= parseFloat(minPuntaje);
        return nombreMatch && cumpleMin && cumpleMax && cumplePuntaje;
    };

    const hayFiltros = filtro !== "" || minPrecio !== "" || maxPrecio !== "" || minPuntaje !== "";


    const handleClickCategoria = (id_categoria: number) => {
        refs.current[id_categoria]?.scrollIntoView({ behavior: "smooth" });
    };

    const handleIrAlCarrito = () => {
        localStorage.setItem('lastFromCarrito', window.location.pathname);
        navigate(`/carrito/${id_servicio}`);
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

    if (!servicio || !entidad) return <p>Cargando...</p>;

    return (
        <div style={{ backgroundColor: "#F4F5F9" }}>
            {/* Header fijo */}
            <div style={{
                backgroundColor: "white", paddingTop: 50, paddingBottom: 20,
                position: "sticky", top: 0, zIndex: 10,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
                <div style={{
                    maxWidth: 768, margin: "0 auto", padding: "0 20px", position: "relative",
                    display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    <FaArrowLeft
                        onClick={() => navigate(`/entidad/${entidad.id_entidad}`)}
                        style={{ fontSize: 20, cursor: "pointer", position: "absolute", left: 20 }}
                    />
                    <div
                        onClick={handleIrAlCarrito}
                        style={{ position: "absolute", right: 20, cursor: "pointer" }}
                    >
                        <img src="/img/carrito_compras.png" alt="Carrito" style={{ width: 24, height: 24 }} />
                        {totalArticulos > 0 && (
                            <div style={{
                                position: "absolute", top: -6, right: -6,
                                backgroundColor: "#769B7B", color: "white",
                                borderRadius: "50%", width: 18, height: 18,
                                fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center",
                                fontFamily: "Poppins", fontWeight: 600, boxShadow: "0 0 0 2px white"
                            }}>
                                {totalArticulos}
                            </div>
                        )}
                    </div>
                    <h2 style={{
                        fontSize: 18, fontFamily: "Poppins", fontWeight: 500, letterSpacing: "0.54px"
                    }}>
                        {entidad.nombre} - {servicio.nombre}
                    </h2>
                </div>
            </div>

            {/* Contenido scrolleable */}
            <div style={{paddingBottom: 60}}>
                <div style={{maxWidth: "768px", margin: "0 auto", padding: "0 20px"}}>
                    <div style={{display: 'flex', gap: 10, paddingTop: 30, maxWidth: "768px", minWidth:'300px'}}>
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={filtro}
                            onChange={handleFiltroChange}
                            style={{flex: 1, padding: 10, borderRadius: 10, border: '1px solid #ccc', maxWidth: "768px", minWidth:'300px'}}
                        />
                        <button onClick={() => setMostrarFiltros(prev => !prev)}
                                style={{border: 'none', background: 'none'}}>
                            <FaFilter
                                size={20}
                                color={mostrarFiltros ? "#4B614C" : "#888"}
                                style={{transition: "color 0.3s ease"}}
                            />
                        </button>
                    </div>

                    {mostrarFiltros && (
                        <div style={{
                            padding: 20,
                            backgroundColor: 'white',
                            borderTop: '1px solid #ccc',
                            borderRadius: 10,
                            marginTop: 20,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 16,
                        }}>
                            <div>
                                <label style={{ fontWeight: 600, fontFamily: 'Montserrat', marginBottom: 8, display: 'block' }}>Rango de precio</label>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <input
                                        type="number"
                                        placeholder="Min."
                                        value={minPrecio}
                                        onChange={e => {
                                            const val = parseFloat(e.target.value);
                                            setMinPrecio(val < 0 ? "0" : e.target.value);
                                        }}
                                        style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max."
                                        value={maxPrecio}
                                        onChange={e => {
                                            const val = parseFloat(e.target.value);
                                            setMaxPrecio(val < 0 ? "0" : e.target.value);
                                        }}
                                        style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontWeight: 600, fontFamily: 'Montserrat', marginBottom: 8, display: 'block' }}>Calificación mínima</label>
                                <input
                                    type="number"
                                    placeholder="0 a 5 estrellas"
                                    value={minPuntaje}
                                    onChange={e => {
                                        const val = parseFloat(e.target.value);
                                        if (val < 0) setMinPuntaje("0");
                                        else if (val > 5) setMinPuntaje("5");
                                        else setMinPuntaje(e.target.value);
                                    }}
                                    style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: 10 }}>
                                <button
                                    onClick={() => setMostrarFiltros(false)}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#AEDC81',
                                        padding: 10,
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 5,
                                        fontWeight: 600
                                    }}>
                                    Aplicar filtros
                                </button>
                                <button
                                    onClick={() => {
                                        setFiltro("");
                                        setMinPrecio("");
                                        setMaxPrecio("");
                                        setMinPuntaje("");
                                        setMostrarFiltros(false);
                                    }}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#4B614C',
                                        padding: 10,
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 5,
                                        fontWeight: 600
                                    }}>
                                    Limpiar filtros
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                {!hayFiltros && (
                    <>
                        {/* Promo */}
                        <div style={{
                            backgroundColor: "#9AAA88", borderRadius: 20,
                            margin: "20px 0", padding: "20px 20px 60px 20px",
                            color: "white", fontFamily: "Fredoka One", position: "relative"
                        }}>
                            <div style={{fontSize: 35}}>DESPERDICIO CERO</div>
                            <div style={{color: "#4B614C", fontSize: 25, paddingBottom: 10}}>Descuentos Imperdibles
                            </div>
                            <button
                                onClick={() => navigate(`/desperdicio/${id_servicio}`)}
                                style={{
                                    position: "absolute", bottom: 20, left: 20,
                                    backgroundColor: "#4B614C", color: "white",
                                    padding: "10px 20px", borderRadius: "30px", border: "none",
                                    fontFamily: "Montserrat", fontWeight: 700, fontSize: 17,
                                    cursor: "pointer"
                                }}
                            >
                                Comprar
                            </button>
                        </div>

                        {/* Categorías */}
                        <div style={{
                            backgroundColor: "white", borderRadius: 10,
                            padding: "20px", marginBottom: 20
                        }}>
                            <h3 style={{
                                fontSize: 17, fontFamily: "Montserrat", fontWeight: 700
                            }}>Categorías</h3>
                            <div style={{
                                display: "flex", overflowX: "auto", gap: 10, paddingTop: 10
                            }}>
                                {categorias.map((cat) => (
                                    <div
                                        key={cat.id_categoria}
                                        onClick={() => handleClickCategoria(cat.id_categoria)}
                                        style={{
                                            minWidth: 83,
                                            height: 132,
                                            backgroundColor: "#9AAA88",
                                            borderRadius: 10,
                                            textAlign: "center",
                                            color: "#4B614C",
                                            fontFamily: "Lato",
                                            fontWeight: 800,
                                            fontSize: 13,
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            cursor: "pointer",
                                            transition: "background-color 0.3s ease",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = "#7F8F6E"; // verde más oscuro al pasar
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = "#9AAA88"; // color original al salir
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
                    </>
                )}
                {/* Productos */}
                {categorias.map((cat) => {
                    const productosFiltrados = productosPorCategoria[cat.id_categoria]?.filter(filtrarProducto);
                    if (!productosFiltrados || productosFiltrados.length === 0) return null;

                    return (
                        <div key={cat.id_categoria} ref={(el) => { refs.current[cat.id_categoria] = el; }} style={{ marginBottom: "2rem" }}>
                            <h3 style={{ color: "#4B614C", fontSize: 20, fontFamily: "Lato", fontWeight: 800, marginBottom: 10 }}>{cat.nombre}</h3>
                            {productosFiltrados.map((producto) => (
                                <div key={producto.id_producto} style={{ backgroundColor: "white", borderRadius: 20, display: "flex", overflow: "hidden", marginBottom: 20, boxShadow: "0 1px 5px rgba(0,0,0,0.1)" }}>
                                    <div style={{ width: 176, backgroundColor: "#4B614C" }}>
                                        <img src={producto.foto} alt={producto.nombre} style={{ width: "100%", height: 169, objectFit: "cover", borderRadius: 20 }} />
                                    </div>
                                    <div style={{ padding: 15, flex: 1 }}>
                                        <h4 style={{ textAlign: "center", fontSize: 20, fontFamily: "Fredoka One", color: "black" }}>{producto.nombre.toUpperCase()}</h4>
                                        <p style={{ textAlign: "center", color: "black", fontSize: 17, fontFamily: "Montserrat" }}>{producto.descripcion}</p>
                                        {producto.es_desperdicio_cero && (
                                            <div style={{ textAlign: "center", marginTop: 6 }}>
    <span style={{
        backgroundColor: "#EF574B",
        color: "white",
        padding: "2px 8px",
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "Poppins"
    }}>
      ¡OFERTA!
    </span>
                                                <div style={{ marginTop: 4, fontFamily: "Poppins", fontSize: 14 }}>
      <span style={{ textDecoration: "line-through", color: "#888", marginRight: 8 }}>
        ${producto.precio_actual.toFixed(2)}
      </span>
                                                    <span style={{ color: "#4B614C", fontWeight: 600 }}>
        ${producto.precio_oferta?.toFixed(2)}
      </span>
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ textAlign: "center", marginTop: 10 }}>
                                            <button onClick={() => navigate(`/producto/${producto.id_producto}`)} style={{ backgroundColor: "#4B614C", color: "white", fontSize: 17, fontFamily: "Montserrat", fontWeight: 700, borderRadius: 30, padding: "10px 30px", border: "none" }}>
                                                Ver
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default HomeServicioUsuario;