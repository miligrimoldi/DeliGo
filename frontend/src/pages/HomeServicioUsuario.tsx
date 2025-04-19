import { useParams, useNavigate } from "react-router-dom";
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
    const navigate = useNavigate();
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
        <div style={{ backgroundColor: '#F4F5F9', minHeight: '100vh', padding: '1rem' }}>
            {/* Encabezado */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                backgroundColor: 'white',
                borderRadius: '10px',
                marginBottom: '1rem',
                position: 'relative'
            }}>
                <h2 style={{
                    fontSize: '18px',
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                    letterSpacing: '0.54px',
                    color: '#000'
                }}>
                    {servicio.nombre} - {entidad.nombre}
                </h2>

                {/* 🛒 Carrito */}
                <button
                    onClick={() => navigate('/carrito')}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem'
                    }}
                >
                    <img
                        src="/img/carrito_compras.png"
                        alt="Carrito"
                        style={{ width: '30px', height: '30px' }}
                    />
                </button>
            </div>

            {/* Promo desperdicio cero */}
            <div style={{
                backgroundColor: '#9AAA88',
                borderRadius: '20px',
                padding: '1rem',
                color: 'white',
                fontFamily: 'Fredoka One',
                marginBottom: '1rem',
                position: 'relative'
            }}>
                <div style={{ fontSize: '25px' }}>DESPERDICIO CERO</div>
                <div style={{ color: '#4B614C', fontSize: '25px' }}>70% OFF</div>
                <button style={{
                    position: 'absolute',
                    bottom: '1rem',
                    left: '1rem',
                    backgroundColor: '#4B614C',
                    color: 'white',
                    padding: '0.5rem 1.2rem',
                    borderRadius: '30px',
                    border: 'none',
                    fontFamily: 'Montserrat',
                    fontWeight: 700
                }}>Comprar</button>
            </div>

            {/* Categorías */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '10px',
                padding: '1rem'
            }}>
                <h3 style={{
                    fontSize: '17px',
                    fontFamily: 'Montserrat',
                    fontWeight: 700,
                    color: 'black'
                }}>Categorías</h3>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '1rem',
                    flexWrap: 'wrap',
                    gap: '10px'
                }}>
                    {categorias.map((c) => (
                        <div key={c.id_categoria} style={{
                            width: '80px',
                            height: '130px',
                            backgroundColor: '#9AAA88',
                            borderRadius: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <div style={{
                                width: '59px',
                                height: '66px',
                                backgroundColor: '#B1C89A',
                                borderRadius: '50%',
                                marginBottom: '0.5rem'
                            }} />
                            <span style={{
                                textAlign: 'center',
                                color: '#4B614C',
                                fontSize: '13px',
                                fontFamily: 'Lato',
                                fontWeight: 800
                            }}>
                                {c.nombre.toUpperCase()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomeServicioUsuario;
