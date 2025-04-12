import React, { useEffect, useState } from 'react';
import '../css/entidades.css';
import { fetchEntidades, fetchMisEntidades, asociarAEntidad, desasociarAEntidad } from '../api.ts';
import { useNavigate } from "react-router-dom";

export interface Entidad {
    id_entidad: number;
    nombre: string;
    ubicacion: string;
    logo_url: string;
    descripcion: string;
}

const EntidadesTabs: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'entidades' | 'mis'>('entidades');
    const [entidades, setEntidades] = useState<Entidad[]>([]);
    const [misEntidades, setMisEntidades] = useState<Entidad[]>([]);
    const [search, setSearch] = useState('');
    const [loadingId, setLoadingId] = useState<number | null>(null);

    const navigate = useNavigate();

    // Obtenemos solo el nombre del usuario si existe (opcional para mostrar en UI)
    const userData = localStorage.getItem("user");
    const nombreUsuario = userData ? JSON.parse(userData)?.nombre || 'Usuario' : 'Usuario';

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (activeTab === 'entidades') {
                    const data = await fetchEntidades();
                    setEntidades(data);

                    const asociadas = await fetchMisEntidades();
                    setMisEntidades(asociadas);
                } else {
                    const data = await fetchMisEntidades();
                    setEntidades(data);
                }
            } catch (error) {
                console.error("Error al obtener entidades:", error);
            }
        };

        fetchData();
    }, [activeTab]);

    const estaAsociado = (id_entidad: number): boolean => {
        return misEntidades.some((e) => e.id_entidad === id_entidad);
    };

    return (
        <div className="entidades-container">
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem' }}>
                <button
                    onClick={() => navigate("/perfil")}
                    style={{ background: 'none', border: '1px solid #ccc', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Mi perfil
                </button>
            </div>

            <div className="tabs">
                <button
                    className={`tab-button ${activeTab === 'entidades' ? 'active' : ''}`}
                    onClick={() => setActiveTab('entidades')}
                >
                    ENTIDADES
                </button>
                <button
                    className={`tab-button ${activeTab === 'mis' ? 'active' : ''}`}
                    onClick={() => setActiveTab('mis')}
                >
                    MIS ENTIDADES
                </button>
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Buscar"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="entidad-lista">
                {activeTab === 'mis' && entidades.length === 0 ? (
                    <p><strong>{nombreUsuario}</strong>: Aún no tienes entidades asociadas.</p>
                ) : (
                    entidades
                        .filter((e) =>
                            e.nombre.toLowerCase().includes(search.toLowerCase())
                        )
                        .map((entidad) => (
                            <div
                                className="entidad-card"
                                onClick={() => navigate(`/entidad/${entidad.id_entidad}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <img
                                    src={entidad.logo_url || 'https://via.placeholder.com/40'}
                                    alt={entidad.nombre}
                                    className="entidad-logo"
                                />
                                <span className="entidad-nombre">
        {entidad.nombre.toUpperCase()}
    </span>

                                {activeTab === 'entidades' ? (
                                    estaAsociado(entidad.id_entidad) ? (
                                        <button className="asociado-btn" disabled>
                                            Asociado
                                        </button>
                                    ) : (
                                        <button
                                            className="asociar-btn"
                                            disabled={loadingId === entidad.id_entidad}
                                            onClick={async (e) => {
                                                e.stopPropagation();  // Evita que el click sobre este botón también active el onClick de la tarjeta
                                                setLoadingId(entidad.id_entidad);
                                                await asociarAEntidad(entidad.id_entidad);
                                                const nuevas = await fetchMisEntidades();
                                                setMisEntidades(nuevas);
                                                setLoadingId(null);
                                            }}
                                        >
                                            {loadingId === entidad.id_entidad ? "Asociando..." : "Asociarme"}
                                        </button>
                                    )
                                ) : (
                                    <button
                                        className="asociar-btn"
                                        onClick={async (e) => {
                                            e.stopPropagation();  // Evita que el click sobre este botón también active el onClick de la tarjeta
                                            setLoadingId(entidad.id_entidad);
                                            try {
                                                await desasociarAEntidad(entidad.id_entidad);
                                                const nuevas = await fetchMisEntidades();
                                                setMisEntidades(nuevas);
                                                setEntidades(nuevas);
                                            } catch (e) {
                                                console.error("Error al desasociar:", e);
                                                alert("Error al desasociar la entidad.");
                                            }
                                            setLoadingId(null);
                                        }}
                                    >
                                        {loadingId === entidad.id_entidad ? "Desasociando..." : "Desasociarme"}
                                    </button>
                                )}
                            </div>

                        ))
                )}
            </div>
        </div>
    );
};

export default EntidadesTabs;
