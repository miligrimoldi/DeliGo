import React, { useEffect, useState } from 'react';
import '../css/entidades.css';
import { fetchEntidades, fetchMisEntidades, asociarAEntidad } from '../api';

export interface Entidad {
    id_entidad: number;
    nombre: string;
    ubicacion: string;
    logo_url: string;
    descripcion: string;
}

//sintaxis (useState) -> const [valor, setValor] = useState(valorInicial);
const EntidadesTabs: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'entidades' | 'mis'>('entidades');
    const [entidades, setEntidades] = useState<Entidad[]>([]);
    const [misEntidades, setMisEntidades] = useState<Entidad[]>([]);
    const [search, setSearch] = useState('');
    /*
    activeTab -> guarda que pestania esta activa (entidades o mis entidades)
    entidades -> lista entidades (Entidad[])
    search -> lo que se busca en el buscador
     */

    const userId = 1;
    //const userId = parseInt(localStorage.getItem("userId") || "");

    // Se ejecuta cada vez que cambia activeTab:
    useEffect(() => {
        const fetchData = async () => {
            if (activeTab === 'entidades') {
                const data = await fetchEntidades(); // Si esta en entidades
                setEntidades(data);

                if (userId) {
                    const asociadas = await fetchMisEntidades(userId); // <- para saber cuáles están asociadas
                    setMisEntidades(asociadas);
                }
            } else if (userId) {
                const data = await fetchMisEntidades(userId); // Si esta en mis entidades
                setEntidades(data);
            } else {
                setEntidades([]); // No hay usuario logueado, no se muestran entidades
            }
        };
        fetchData();
    }, [activeTab]);

    // Función para saber si una entidad está en misEntidades
    const estaAsociado = (id_entidad: number): boolean => {
        return misEntidades.some((e) => e.id_entidad === id_entidad);
    };

    return (
        <div className="entidades-container">
            {/* tabs (dos botones para cambiar entre pestanias) */}
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

            {/* Barra buscadora */}
            <div className="search-bar">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Buscar"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Lista de entidades */}
            <div className="entidad-lista">
                {activeTab === 'mis' && !userId ? (
                    <p>Aún no tienes entidades asociadas.</p>
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

                                {/* Botón solo si estás en "entidades" y estás logueada */}
                                {activeTab === 'entidades' && userId && (
                                    estaAsociado(entidad.id_entidad) ? (
                                        <button className="asociado-btn" disabled>
                                            Asociado
                                        </button>
                                    ) : (
                                        <button
                                            className="asociar-btn"
                                            onClick={async () => {
                                                await asociarAEntidad(userId, entidad.id_entidad);
                                                const nuevas = await fetchMisEntidades(userId);
                                                setMisEntidades(nuevas);
                                            }}
                                        >
                                            Asociarme
                                        </button>
                                    )
                                )}
                            </div>
                        ))
                )}
            </div>
        </div>
    );
};

export default EntidadesTabs;
