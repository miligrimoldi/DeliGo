// components/AdminNavbar.tsx
import { useNavigate, useLocation } from "react-router-dom";
import { FaBox, FaClipboardList, FaUsersCog, FaLeaf, FaStar, FaUser } from "react-icons/fa";
import "../css/AdminNavbar.css";

type Props = {
    id_servicio: number;
    esAdmin: boolean;
};

const AdminNavbar = ({ id_servicio, esAdmin }: Props) => {
    const navigate = useNavigate();
    const location = useLocation();

    const secciones = [
        { label: "Productos", icon: <FaBox />, path: `/empleado/${id_servicio}` },
        { label: "Pedidos", icon: <FaClipboardList />, path: `/empleado/${id_servicio}/pedidos` },
        { label: "Stock", icon: <FaLeaf />, path: `/empleado/${id_servicio}/stock` },
        { label: "Mi Perfil", icon: <FaUser />, path: `/empleado-perfil` },
        ...(esAdmin
            ? [
                { label: "Empleados", icon: <FaUsersCog />, path: `/admin/${id_servicio}/empleados` },
                { label: "Opiniones", icon: <FaStar />, path: `/admin/${id_servicio}/opiniones` }
            ]
            : [])
    ];

    return (
        <div className="admin-navbar-container">
            {secciones.map((item) => (
                <div
                    key={item.label}
                    className={`admin-nav-item ${location.pathname === item.path ? "active" : ""}`}
                    onClick={() => navigate(item.path)}
                >
                    {item.icon}
                    <span>{item.label}</span>
                </div>
            ))}
        </div>
    );
};

export default AdminNavbar;
