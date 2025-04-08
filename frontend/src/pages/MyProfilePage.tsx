import '../css/perfil.css';


const MyProfilePage = () => {


    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (

        <div className="perfil-container">

        <div className="perfil-opciones">
            <div className="perfil-item" onClick={() => console.log("Editar perfil")}>
                Editar perfil
            </div>
            <div className="perfil-item" onClick={() => console.log("Ir a mis pedidos")}>
                Mis pedidos
            </div>
            <div className="perfil-item" onClick={() => console.log("Ir a mis favoritos")}>
                Mis favoritos
            </div>
            <div className="perfil-item" onClick={() => console.log("Ir a mis entidades")}>
                Mis entidades
            </div>
        </div>
        <button className="cerrar-sesion-btn" onClick={handleLogout}>
            Cerrar sesión
        </button>

        </div>

    );


};

export default MyProfilePage;