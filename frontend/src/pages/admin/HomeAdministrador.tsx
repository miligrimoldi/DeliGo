import { useEffect, useState } from "react";
import {useNavigate, useParams} from 'react-router-dom';
import CategoriasPanel from './CategoriasPanel.tsx';
import {fetchServicioAdmin, ServicioInfor} from "../../api.ts";

const HomeAdministrador = () => {

    const { id_servicio } = useParams();
    const [info, setInfo ] = useState<ServicioInfor | null>(null);
    const navigate = useNavigate();


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
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem' }}>
                <button
                    onClick={() => navigate("/admin-perfil")}
                    style={{ background: 'none', border: '1px solid #ccc', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Mi perfil
                </button>
                <button onClick={() => navigate(`/admin/${id_servicio}/pedidos`)}
                        style={{ marginRight: '1rem', background: 'none', border: '1px solid #ccc', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                    Pedidos
                </button>
            </div>
            {info ? (
                <>
                    <h1>{info.nombre_servicio} - {info.nombre_entidad}</h1>
                    <CategoriasPanel id_servicio={Number(id_servicio)} />
                </>
            ) : (
                <p>Cargando información del servicio...</p>
            )}
        </div>
    );

};
export default HomeAdministrador;