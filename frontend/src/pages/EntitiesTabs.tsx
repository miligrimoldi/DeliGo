import React, { useEffect, useState } from 'react';
import '../css/entidades.css';
import { fetchEntidades, fetchMisEntidades, asociarAEntidad, desasociarAEntidad} from '../api.ts';
import {useNavigate} from "react-router-dom";

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

    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;
    const userId = user?.id_usuario;
    const nombreUsuario = user?.nombre || 'Usuario';
    const [loadingId, setLoadingId] = useState<number | null>(null);


    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;

            if (activeTab === 'entidades') {
                const data = await fetchEntidades();
                setEntidades(data);

                const asociadas = await fetchMisEntidades(userId);;
                setMisEntidades(asociadas);
            } else {
                const data = await fetchMisEntidades(userId);
                setEntidades(data);
            }
        };

        fetchData();
    }, [activeTab, userId]);

    const estaAsociado = (id_entidad: number): boolean => {
        return misEntidades.some((e) => e.id_entidad === id_entidad);
    };

    const navigate = useNavigate();


    if (!userId) {
        return <p style={{ padding: "1rem" }}>Debe iniciar sesión para ver las entidades.</p>;
    }

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
                            <div key={entidad.id_entidad} className="entidad-card">
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
                                            onClick={async () => {
                                                setLoadingId(entidad.id_entidad);
                                                try {
                                                    const res = await asociarAEntidad(entidad.id_entidad);
                                                    console.log("Respuesta OK:", res);
                                                    const nuevas = await fetchMisEntidades(userId);
                                                    setMisEntidades(nuevas);
                                                } catch (err) {
                                                    console.error("Error asociando:", err);
                                                    alert("Hubo un problema al asociarte. Revisá consola.");
                                                } finally {
                                                    setLoadingId(null);
                                                }
                                            }}
                                        >
                                            {loadingId === entidad.id_entidad ? "Asociando..." : "Asociarme"}
                                        </button>
                                    )
                                ) : (
                                    <button
                                        className="asociar-btn"
                                        onClick={async () => {
                                            setLoadingId(entidad.id_entidad);
                                            try {
                                                await desasociarAEntidad(userId, entidad.id_entidad);
                                                const nuevas = await fetchMisEntidades(userId);
                                                setMisEntidades(nuevas);
                                                setEntidades(nuevas); // ya que estamos en "mis"
                                            } catch {
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
