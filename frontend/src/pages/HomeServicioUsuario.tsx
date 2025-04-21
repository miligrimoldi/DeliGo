import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { getDetalleServicio, fetchProductosPorCategoria } from "../api.ts";
import { FaArrowLeft } from "react-icons/fa";
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
    const refs = useRef<Record<number, HTMLDivElement | null>>({});
    const { items } = useCarrito();
    const totalArticulos = items.reduce((sum, item) => sum + item.cantidad, 0);

    useEffect(() => {
        if (!id_servicio) return;

        getDetalleServicio(Number(id_servicio)).then(async (data) => {
            setServicio(data.servicio);
            setEntidad(data.entidad);
            setCategorias(data.categorias);

            const productosMap: Record<number, Producto[]> = {};
            await Promise.all(
                data.categorias.map(async (cat: Categoria) => {
                    const productos = await fetchProductosPorCategoria(Number(id_servicio), cat.id_categoria);
                    productosMap[cat.id_categoria] = productos;
                })
            );
            setProductosPorCategoria(productosMap);
        });
    }, [id_servicio]);

    const handleClickCategoria = (id_categoria: number) => {
        refs.current[id_categoria]?.scrollIntoView({ behavior: "smooth" });
    };

    const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFiltro(e.target.value.toLowerCase());
    };

    if (!servicio || !entidad) return <p>Cargando...</p>;

    return (
        <div style={{ height: "100vh", overflow: "hidden", backgroundColor: "#F4F5F9" }}>
            {/* Header fijo (despues arreglar)!!!*/}
            <div style={{
                background: "white",
                padding: "20px",
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 10,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
                <FaArrowLeft
                    onClick={() => navigate(-1)}
                    style={{
                        cursor: "pointer",
                        fontSize: "20px",
                        position: "absolute",
                        top: 25,
                        left: 20,
                        color: "black"
                    }}
                />
                <h2
                    style={{
                        fontSize: 18,
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        letterSpacing: "0.54px",
                        textAlign: "center",
                        margin: 0
                    }}
                >
                    {entidad.nombre} - {servicio.nombre}
                </h2>
                <div
                    onClick={() => navigate("/carrito")}
                    style={{
                        position: "absolute",
                        top: 20,
                        right: 20,
                        cursor: "pointer"
                    }}
                >
                    <img
                        src="/img/carrito_compras.png"
                        alt="Carrito"
                        style={{width: 30, height: 30}}
                    />
                    {totalArticulos > 0 && (
                        <div style={{
                            position: "absolute",
                            top: -6,
                            right: -6,
                            backgroundColor: "#769B7B",
                            color: "white",
                            borderRadius: "50%",
                            width: 20,
                            height: 20,
                            fontSize: 12,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: "Poppins",
                            fontWeight: 600,
                            boxShadow: "0 0 0 2px white"
                        }}>
                            {totalArticulos}
                        </div>
                    )}
                </div>
            </div>

            <div style={{paddingTop: "100px", height: "100%", overflowY: "auto"}}>
                {/* Buscador */}
                <div style={{padding: "0 20px", marginTop: "10px"}}>
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={filtro}
                        onChange={handleFiltroChange}
                        style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "10px",
                            border: "1px solid #ccc",
                            fontFamily: "Montserrat"
                        }}
                    />
                </div>

                <div style={{
                    backgroundColor: "#9AAA88",
                    borderRadius: 20,
                    margin: "20px",
                    padding: "20px",
                    color: "white",
                    fontFamily: "Fredoka One",
                    position: "relative"
                }}>
                    <div style={{ fontSize: 25 }}>DESPERDICIO CERO</div>
                    <div style={{ color: "#4B614C", fontSize: 25 }}>70% OFF</div>
                    <button style={{
                        position: "absolute",
                        bottom: 20,
                        left: 20,
                        backgroundColor: "#4B614C",
                        color: "white",
                        padding: "10px 20px",
                        borderRadius: "30px",
                        border: "none",
                        fontFamily: "Montserrat",
                        fontWeight: 700,
                        fontSize: 17
                    }}>Comprar</button>
                </div>

                {/* Categorías */}
                <div style={{
                    backgroundColor: "white",
                    borderRadius: 10,
                    padding: "20px",
                    margin: "0 10px"
                }}>
                    <h3 style={{
                        fontSize: 17,
                        fontFamily: "Montserrat",
                        fontWeight: 700
                    }}>Categorías</h3>
                    <div style={{
                        display: "flex",
                        overflowX: "auto",
                        gap: 10,
                        paddingTop: 10
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
                                    cursor: "pointer"
                                }}
                            >
                                <div style={{
                                    width: 59,
                                    height: 66,
                                    backgroundColor: "#B1C89A",
                                    borderRadius: "50%",
                                    margin: "0 auto 8px"
                                }} />
                                {cat.nombre.toUpperCase()}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Productos */}
                <div style={{ padding: "20px" }}>
                    {categorias.map((cat) => {
                        const productosFiltrados = productosPorCategoria[cat.id_categoria]?.filter((p) =>
                            p.nombre.toLowerCase().includes(filtro)
                        );
                        if (!productosFiltrados || productosFiltrados.length === 0) return null;

                        return (
                            <div
                                key={cat.id_categoria}
                                ref={(el) => { refs.current[cat.id_categoria] = el; }}
                                style={{ marginBottom: "2rem" }}
                            >
                                <h3 style={{
                                    color: "#4B614C",
                                    fontSize: 20,
                                    fontFamily: "Lato",
                                    fontWeight: 800,
                                    marginBottom: 10
                                }}>{cat.nombre}</h3>

                                {productosFiltrados.map((producto) => (
                                    <div key={producto.id_producto} style={{
                                        backgroundColor: "white",
                                        borderRadius: 20,
                                        display: "flex",
                                        overflow: "hidden",
                                        marginBottom: 20,
                                        boxShadow: "0 1px 5px rgba(0,0,0,0.1)"
                                    }}>
                                        <div style={{ width: 176, backgroundColor: "#4B614C" }}>
                                            <img
                                                src={producto.foto}
                                                alt={producto.nombre}
                                                style={{
                                                    width: "100%",
                                                    height: 169,
                                                    objectFit: "cover",
                                                    borderRadius: 20
                                                }}
                                            />
                                        </div>
                                        <div style={{ padding: 15, flex: 1 }}>
                                            <h4 style={{
                                                textAlign: "center",
                                                fontSize: 20,
                                                fontFamily: "Fredoka One",
                                                color: "black"
                                            }}>{producto.nombre.toUpperCase()}</h4>
                                            <p style={{
                                                textAlign: "center",
                                                color: "black",
                                                fontSize: 17,
                                                fontFamily: "Montserrat"
                                            }}>{producto.descripcion}</p>
                                            <div style={{ textAlign: "center", marginTop: 10 }}>
                                                <button onClick={() => navigate(`/producto/${producto.id_producto}`)} style={{
                                                    backgroundColor: "#4B614C",
                                                    color: "white",
                                                    fontSize: 17,
                                                    fontFamily: "Montserrat",
                                                    fontWeight: 700,
                                                    borderRadius: 30,
                                                    padding: "10px 30px",
                                                    border: "none"
                                                }}>Ver</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default HomeServicioUsuario;
