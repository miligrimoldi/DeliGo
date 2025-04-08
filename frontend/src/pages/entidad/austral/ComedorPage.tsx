import '../../../css/comedor_aus.css';

const ComedorPage = () => {
    return (
        <div className="comedor-page">

            <header className="comedor-header">
                <div className="comedor-topbar">
                    <button className="filtro-icon">⚙️</button>
                    <h2>Comedor - Universidad Austral</h2>
                    <div className="cart-icon">
                        🛒<span className="cart-count">4</span>
                    </div>
                </div>

                <div className="search-container">
                    <input type="text" placeholder="Buscar..." />
                    <button className="filter-btn">Filtros</button>
                </div>
            </header>

            <section className="promo-section">
                <div className="promo-text">
                    <h3>DESPERDICIO CERO</h3>
                    <h2>70% OFF</h2>
                    <button className="buy-btn">Comprar</button>
                </div>
                <img src="/img/plato-colorido.png" alt="promo" />
            </section>

            <section className="categorias">
                <h4>Categorías</h4>
                <div className="categoria-list">
                    <div className="categoria-card"><span>MENÚ</span></div>
                    <div className="categoria-card"><span>ENSALADA</span></div>
                    <div className="categoria-card"><span>EXTRAS</span></div>
                    <div className="categoria-card"><span>BEBIDAS</span></div>
                </div>
            </section>

            <section className="menu-section">
                <h3>MENÚ</h3>
                <div className="plato-card">
                    <img src="/img/milanesa.png" alt="milanesa" />
                    <div className="plato-info">
                        <h4>MILANESA CON PAPAS</h4>
                        <p>Milanesa de carne de ternera, acompañada de papas al vapor.</p>
                        <button className="ver-btn">Ver</button>
                    </div>
                </div>
            </section>

            <footer className="bottom-nav">
                <button></button>
                <button></button>
                <button></button>
                <button className="highlight"></button>
            </footer>
        </div>
    );
};

export default ComedorPage;
