import React, { useEffect, useState } from 'react';
import '../css/entidades.css';
import { fetchEntidades, fetchMisEntidades } from '../api';

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
    const [search, setSearch] = useState('');
    /*
    activeTab -> guarda que pestania esta activa (entidades o mis entidades)
    entidades -> lista entidades (Entidad[])
    search -> lo que se busca en el buscador
     */

    const userId = 1; // Temporal, cuando este listo el login uso el localStorage o el contexto

    // Se ejecuta cada vez que cambia activeTab:
    useEffect(() => {
        const fetchData = async () => {
            const data =
                activeTab === 'entidades'
                    ? await fetchEntidades() // Si esta en entidades
                    : await fetchMisEntidades(userId); // Si esta en mis entidades
            setEntidades(data); // Guarda el resultado en entidades
        };
        fetchData();
    }, [activeTab]);

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
                {entidades
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
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default EntidadesTabs;
