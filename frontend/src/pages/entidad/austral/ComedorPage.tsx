import '../../../css/comedor_aus.css';

const ComedorPage = () => {
    return (
        <div className="home">
            <img className="background-icon" alt="" src="/img/background.svg" />

            <div className="titlebar">
                <img className="titlebar-child" alt="" src="/img/Rectangle 14.svg" />
                <img className="searchfield-icon" alt="" src="/img/searchField.svg" />
            </div>

            <div className="actionbar">
                <div className="right-side">
                    <img className="battery-icon" alt="" src="/img/Battery.svg" />
                    <img className="wifi-icon" alt="" src="/img/Wifi.svg" />
                    <img className="mobile-signal-icon" alt="" src="/img/Mobile Signal.svg" />
                </div>
                <div className="left-side">
                    <div className="time">
                        <div className="div">9:41</div>
                    </div>
                </div>
            </div>

            <div className="home-inner">
                <div className="group-wrapper">
                    <div className="desperdicio-cero-parent">
                        <div className="desperdicio-cero">DESPERDICIO CERO</div>
                        <div className="off">70% OFF</div>
                    </div>
                </div>
            </div>

            <div className="home-child">
                <div className="frame-container">
                    <div className="group-child" />
                </div>
            </div>

            <b className="comprar">Comprar</b>

            <div className="categoras-parent">
                <b className="categoras">Categorías</b>
                <img className="frame-child" alt="" src="/img/Frame 13.svg" />
                <img className="frame-item" alt="" src="/img/Frame 14.svg" />
                <img className="frame-inner" alt="" src="/img/Frame 13.svg" />

                <div className="ellipse-parent">
                    <div className="ellipse-div" />
                    <img className="image-15-icon" alt="" src="/img/image 15.png" />
                </div>

                <div className="men">MENÚ</div>
                <div className="ensalada">ENSALADA</div>
                <div className="extras">EXTRAS</div>
                <div className="bebidas">BEBIDAS</div>

                <img className="image-13-icon" alt="" src="/img/image 13.png" />
                <img className="image-14-icon" alt="" src="/img/image 14.png" />
                <img className="image-16-icon" alt="" src="/img/image 16.png" id="image16" />
            </div>

            <div className="men1">MENÚ</div>

            <div className="frame-parent" id="frameContainer2">
                <div className="milangaaaa-removebg-preview-1-wrapper" data-scroll-to="frameContainer">
                    <img className="milangaaaa-removebg-preview-1-icon" alt="" src="/img/milangaaaa-removebg-preview 1.png" />
                </div>
                <div className="frame-div" />
                <b className="ver">Ver</b>
                <div className="milanesa-de-carne">Milanesa de carne de ternera, acompañada de papas al vapor.</div>
                <div className="milanesa-con-papas">MILANESA CON PAPAS</div>
            </div>

            <div className="navigation">
                <div className="union-parent">
                    <img className="union-icon" alt="" src="/img/Union.svg" />
                    <div className="group-parent">
                        <img className="group-icon" alt="" src="/img/Group.svg" />
                        <img className="user-1-icon" alt="" src="/img/user (1).svg" />
                        <img className="vector-icon" alt="" src="/img/Vector.svg" />
                    </div>
                    <img className="group-item" alt="" src="/img/Group 67.svg" />
                </div>
            </div>

            <img className="home-child1" alt="" src="/img/Group 235.png" />
            <img className="group-icon1" alt="" src="/img/Group.svg" id="groupIcon" />
            <img className="image-17-icon" alt="" src="/img/image 17.png" id="image17Icon" />

            <div className="rectangle-div" />
            <div className="filtros" id="filtrosText">Filtros</div>
            <div className="comedor-universidad">Comedor - Universidad Austral</div>
            <div className="home-child2" />
            <div className="div1">4</div>
        </div>
    );
};

export default ComedorPage;
