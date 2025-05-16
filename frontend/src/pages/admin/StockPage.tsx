import {useParams, useNavigate } from "react-router-dom";
import {useEffect, useState} from "react";
import {getStockPorServicio, StockIngrediente, updateStockDisponibilidad} from "../../api.ts";


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
        <div className="stock-container">
            <h2>Gestión de Stock</h2>
            <ul className="stock-list">
                {ingredientes.map(ing => (
                    <li key={ing.id_ingrediente} className="stock-item">
                        <span className="nombre">{ing.nombre}</span>
                        <div className="cantidad-control">
                            <button
                                onClick={() =>
                                    cambiarCantidad(ing.id_ingrediente, Math.max(0, ing.cantidad - 1))
                                }
                            >
                                -
                            </button>
                            <span className="cantidad">{ing.cantidad}</span>
                            <button
                                onClick={() =>
                                    cambiarCantidad(ing.id_ingrediente, ing.cantidad + 1)
                                }
                            >
                                +
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
            <button className="inicio" onClick={() => navigate(`/empleado/${id_servicio}`)}>Home</button>
        </div>
    );

}
export default StockPage;