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
        <div style={{
            backgroundColor: '#F4F5F9',
            minHeight: '100vh',
            padding: '1rem',
            paddingTop: '60px',
            position: 'relative'
        }}>
            <FaArrowLeft
                onClick={() => navigate('/entidades', {state: {tab: lastTab}})}
                style={{
                    cursor: 'pointer',
                    fontSize: '24px',
                    color: 'black',
                    marginBottom: '1rem'
                }}
            />

            {/* Header */}
            <div style={{
                backgroundColor: 'white',
                padding: '1rem',
                borderBottom: '1px solid #ccc',
                marginBottom: '1rem'
            }}>
                <h2 style={{
                    textAlign: 'center',
                    fontSize: '18px',
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                    letterSpacing: '0.54px'
                }}>
                    {entidad.nombre}
                </h2>
            </div>

            {/* Servicios */}
            <div>
                <h3 style={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    fontSize: '18px',
                    color: '#4B614C',
                    marginBottom: '1rem'
                }}>Servicios</h3>

                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
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
                            <strong>{s.nombre.toUpperCase()}</strong><br/>
                            <span style={{
                                fontFamily: 'Montserrat',
                                fontWeight: 400,
                                fontSize: '14px'
                            }}>{s.descripcion}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ServiciosEntidad;
