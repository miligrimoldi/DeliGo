import {useParams, useNavigate } from "react-router-dom";
import {useEffect, useState} from "react";
import {getStock, updateStockDisponibilidad} from "../../api.ts";

interface IngredienteStock {
    idIngrediente: number;
    nombre: string;
    disponible: boolean;
}


const StockPage = () => {

    const { id_servicio } = useParams();
    const [ingredientes, setIngredientes] = useState<IngredienteStock[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStock = async () => {
            try {
                const data = await getStock(Number(id_servicio));
                setIngredientes(data);
            } catch (error) {
                console.error("Error al obtener stock:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStock();
    }, [id_servicio]);

    const cambiarDisponibilidad = async (id_ingrediente: number, disponible: boolean) => {
        try {
            await updateStockDisponibilidad(Number(id_servicio), id_ingrediente, !disponible);
            setIngredientes(prev =>
                prev.map(ing =>
                    ing.idIngrediente === id_ingrediente ? { ...ing, disponible: !disponible } : ing
                )
            );
        } catch (error) {
            console.error("Error al actualizar disponibilidad:", error);
        }
    };

    if (loading) return <p>Cargando stock...</p>;

    return (
        <div className="stock-container">
            <h2>Gestión de Stock</h2>
            <ul className="stock-list">
                {ingredientes.map(ing => (
                    <li key={ing.idIngrediente} className={`stock-item ${ing.disponible ? "disponible" : "no-disponible"}`}>
                        {ing.nombre}
                        <button onClick={() => cambiarDisponibilidad(ing.idIngrediente, ing.disponible)}>
                            {ing.disponible ? "Marcar como NO disponible" : "Marcar como disponible"}
                        </button>
                    </li>
                ))}
            </ul>
            <button className="inicio" onClick={() => navigate(`/empleado/${id_servicio}`)}>Home</button>
        </div>
    );

}
export default StockPage;