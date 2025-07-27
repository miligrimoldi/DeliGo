import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CategoriasPanel from "./CategoriasPanel.tsx";
import { fetchServicioAdmin, ServicioInfor } from "../../api.ts";
import AdminNavbar from "../../components/AdminNavbar";
import "../../css/HomeEmpleado.css";

const HomeEmpleado = () => {
    const { id_servicio } = useParams();
    const [info, setInfo] = useState<ServicioInfor | null>(null);
    const userData = localStorage.getItem("user");
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

    if (!info) {
        return <p className="admin-loading">Cargando información del servicio...</p>;
    }

    return (
        <div className="home-admin">
            <div className="admin-scrollable">
                <div className="admin-header-internal">
                    <div className="admin-header-content">
                        <h2 className="admin-header-title">
                            {info.nombre_servicio} - {info.nombre_entidad}
                        </h2>
                    </div>
                </div>

                <CategoriasPanel id_servicio={Number(id_servicio)} />
            </div>

            {user && (
                <AdminNavbar id_servicio={Number(id_servicio)} esAdmin={user.esAdmin} />
            )}
        </div>
    );

};

export default HomeEmpleado;
