import React, { useState } from 'react';

const EntidadesTabs: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'entidades' | 'mis'>('entidades');

    const tabClass = (tab: 'entidades' | 'mis') =>
        `px-4 py-2 font-semibold text-sm transition-all duration-300 ${
            activeTab === tab
                ? 'text-white bg-green-600 rounded-t-md border-b-4 border-green-600'
                : 'text-green-800 bg-green-100 rounded-t-md'
        }`;

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Tabs */}
            <div className="flex justify-around bg-green-100 rounded-t-md overflow-hidden">
                <button className={tabClass('entidades')} onClick={() => setActiveTab('entidades')}>
                    ENTIDADES
                </button>
                <button className={tabClass('mis')} onClick={() => setActiveTab('mis')}>
                    MIS ENTIDADES
                </button>
            </div>

            {/* Contenido */}
            <div className="bg-white border border-t-0 p-4 rounded-b-md shadow">
                {activeTab === 'entidades' ? (
                    <div>📋 Lista de todas las entidades (con buscador, etc.)</div>
                ) : (
                    <div>⭐ Tus entidades favoritas o asociadas</div>
                )}
            </div>
        </div>
    );
};

export default EntidadesTabs;
