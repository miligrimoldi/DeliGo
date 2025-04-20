import { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import CategoriasPanel from './CategoriasPanel.tsx';
import {fetchServicioAdmin, ServicioInfor} from "../../api.ts";

const HomeAdministrador = () => {

    const { id_servicio } = useParams();
    const [info, setInfo ] = useState<ServicioInfor | null>(null);


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