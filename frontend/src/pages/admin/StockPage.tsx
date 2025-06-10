import {useParams, useNavigate } from "react-router-dom";
import {useEffect, useState} from "react";
import {getStockPorServicio, StockIngrediente, updateStockDisponibilidad} from "../../api.ts";
import "../../css/StockPage.css";


const StockPage = () => {

    const { id_servicio } = useParams();
    const [ingredientes, setIngredientes] = useState<StockIngrediente[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStock = async () => {
            try {
                const data = await getStockPorServicio(Number(id_servicio));
                setIngredientes(data);
            } catch (error) {
                console.error("Error al obtener stock:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStock();
    }, [id_servicio]);

    const cambiarCantidad = async (id_ingrediente: number, nuevaCantidad: number) => {
        try {
            await updateStockDisponibilidad(Number(id_servicio), id_ingrediente, nuevaCantidad);
            setIngredientes(prev =>
                prev.map(ing =>
                    ing.id_ingrediente === id_ingrediente ? { ...ing, cantidad: nuevaCantidad } : ing
                )
            );
        } catch (error) {
            console.error("Error al actualizar disponibilidad:", error);
        }
    };

    if (loading) return <p>Cargando stock...</p>;

    return (
        <div className="page-container">
            <div className="panel-box">
                <h2>Gestión de Stock</h2>
                <ul className="lista-items">
                    {ingredientes.map(ing => (
                        <li key={ing.id_ingrediente} className="item">
                            <span>{ing.nombre}</span>
                            <div className="controls">
                                <button onClick={() => cambiarCantidad(ing.id_ingrediente, Math.max(0, ing.cantidad - 1))}>-</button>
                                <span>{ing.cantidad}</span>
                                <button onClick={() => cambiarCantidad(ing.id_ingrediente, ing.cantidad + 1)}>+</button>
                            </div>
                        </li>
                    ))}
                </ul>
                <button className="btn-home" onClick={() => navigate(`/empleado/${id_servicio}`)}>Volver al Home</button>
            </div>
        </div>
    );


}
export default StockPage;