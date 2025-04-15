import { useEffect, useState } from react;
import { useParams } from 'react-router-dom';
import CategoriasPanel from './CategoriasPanel';

const HomeAdministrador = () => {

    const { id_servicio } = useParams();
    const [info, setInfo ] = useState<{nombre_servicio: "", nombre_entidad: ""};



    useEffect(() => {



    }, [id_servicio]);

};
export default HomeAdministrador;