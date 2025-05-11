import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CategoriasPanel from "./CategoriasPanel.tsx";
import { fetchServicioAdmin, ServicioInfor } from "../../api.ts";
import "../../css/HomeAdministrador.css";

const HomeAdministrador = () => {
    const { id_servicio } = useParams();
    const [info, setInfo] = useState<ServicioInfor | null>(null);
    const navigate = useNavigate();
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchServicioAdmin(Number(id_servicio));
                setInfo(data);
            } catch (error) {
                console.error("Error al obtener datos del servicio:", error);
            }
        };
        fetchData();
    }, [id_servicio]);

    return (
        <div className="home-admin">
            <div className="admin-navbar">
                <button className="admin-btn" onClick={() => navigate(`/empleado/${id_servicio}/pedidos`)}>
                    Pedidos
                </button>
                <button className="admin-btn" onClick={() => navigate("/empleado-perfil")}>
                    Mi perfil
                </button>
                {user.esAdmin && ( <button className="admin-btn" onClick={() => navigate(`/admin/${id_servicio}/empleados`)}>
                    Empleados
                </button>)}
            </div>
            {info ? (
                <>
                    <h1 className="admin-titulo">{info.nombre_servicio} - {info.nombre_entidad}</h1>
                    <CategoriasPanel id_servicio={Number(id_servicio)} />
                </>
            ) : (
                <p className="admin-loading">Cargando información del servicio...</p>
            )}
        </div>
    );
};

export default HomeAdministrador;
