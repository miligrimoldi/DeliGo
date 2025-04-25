import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchServiciosEntidad } from '../api.ts';
import { FaArrowLeft } from 'react-icons/fa';

interface Servicio {
    id_servicio: number;
    nombre: string;
    descripcion: string;
}

interface Entidad {
    id_entidad: number;
    nombre: string;
}

const ServiciosEntidad: React.FC = () => {
    const { id_entidad } = useParams<{ id_entidad: string }>();
    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [entidad, setEntidad] = useState<Entidad | null>(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const lastTab = location.state?.tab || 'entidades';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchServiciosEntidad(Number(id_entidad));
                setServicios(data.servicios);
                setEntidad(data.entidad);
            } catch (err: any) {
                setError(err.response?.data?.error || 'Error al cargar servicios');
            }
        };

        fetchData();
    }, [id_entidad]);

    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!entidad) return <p>Cargando...</p>;

    return (
        <div style={{ backgroundColor: '#F4F5F9', minHeight: '100vh', display: 'flex', flexDirection: 'column', width: "450px" }}>
            {/* Header fijo arriba */}
            <div
                style={{
                    backgroundColor: 'white',
                    paddingTop: '50px',
                    paddingBottom: '20px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    width: "450px"
                }}
            >
                <div
                    style={{
                        maxWidth: '768px',
                        margin: '0 auto',
                        padding: '0 20px',
                        position: 'relative'
                    }}
                >
                    <FaArrowLeft
                        onClick={() => navigate('/entidades', { state: { tab: lastTab } })}
                        style={{ fontSize: 20, cursor: 'pointer', position: 'absolute', top: 0, left: 15 }}
                    />

                    <h2
                        style={{
                            textAlign: 'center',
                            fontSize: '18px',
                            fontFamily: 'Poppins',
                            fontWeight: 500,
                            letterSpacing: '0.54px',
                            margin: 0
                        }}
                    >
                        {entidad.nombre}
                    </h2>
                </div>
            </div>

            {/* Contenido scrolleable */}
            <div style={{ flexGrow: 1, overflowY: 'auto' }}>
                <div style={{ maxWidth: '768px', margin: '0 auto', padding: '20px' }}>
                    <h3
                        style={{
                            fontFamily: 'Poppins',
                            fontWeight: 600,
                            fontSize: '18px',
                            color: '#4B614C',
                            marginBottom: '1rem'
                        }}
                    >
                        Servicios
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {servicios.map((s) => (
                            <div
                                key={s.id_servicio}
                                onClick={() => navigate(`/home/${s.id_servicio}`)}
                                style={{
                                    backgroundColor: '#EBEBEB',
                                    padding: '1rem',
                                    borderRadius: '20px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontFamily: 'Fredoka One',
                                    fontSize: '15px',
                                    letterSpacing: '0.45px'
                                }}
                                onMouseOver={(e) => {
                                    (e.currentTarget as HTMLDivElement).style.backgroundColor = '#dcdcdc';
                                }}
                                onMouseOut={(e) => {
                                    (e.currentTarget as HTMLDivElement).style.backgroundColor = '#EBEBEB';
                                }}
                            >
                                <strong>{s.nombre.toUpperCase()}</strong>
                                <br />
                                <span
                                    style={{
                                        fontFamily: 'Montserrat',
                                        fontWeight: 400,
                                        fontSize: '14px'
                                    }}
                                >
                  {s.descripcion}
                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiciosEntidad;