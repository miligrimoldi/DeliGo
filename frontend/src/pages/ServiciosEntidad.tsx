import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchServiciosEntidad } from '../api.ts';


interface Servicio{
    id_servicio: number;
    nombre: string;
    descripcion: string;
}

const ServiciosEntidad: React.FC = () => {
    const {id_entidad} = useParams<{ id_entidad: string }>();
    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchServicios = async () => {
            try {
                const data = await fetchServiciosEntidad(Number(id_entidad));
                setServicios(data);
            } catch (err: any) {
                setError(err.response?.data?.error || 'Error al cargar servicios');
            }
        };

        fetchServicios();
    }, [id_entidad]);

    return (
        <div style={{ padding: '1rem' }}>
            {error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : (
                <>
                    <h2>Servicios disponibles</h2>
                    <ul>
                        {servicios.map((s) => (
                            <li key={s.id_servicio}>
                                <strong>{s.nombre}</strong>: {s.descripcion}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );

};

export default ServiciosEntidad;