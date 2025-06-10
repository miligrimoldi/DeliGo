import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    fetchEmpleados,
    crearEmpleado,
    eliminarEmpleado,
    Empleado
} from "../../api";
import "../../css/EmpleadosServicio.css";

const EmpleadosServicio = () => {
    const { id_servicio } = useParams<{ id_servicio: string }>();
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [form, setForm] = useState({
        nombre: "",
        apellido: "",
        email: "",
        dni: "",
        contrasena: "",
    });
    const [error, setError] = useState<string | null> (null);
    const user = JSON.parse(localStorage.getItem("user") || "null");

    useEffect(() => {
        if (id_servicio) {
            fetchEmpleados(Number(id_servicio)).then(setEmpleados).catch(console.error);
        }
    }, [id_servicio]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCrear = async () => {
        if (!id_servicio) return;
        try {
            setError(null);
            await crearEmpleado(Number(id_servicio), { ...form, esAdmin: false });
            const nuevos = await fetchEmpleados(Number(id_servicio));
            setEmpleados(nuevos);
            setForm({ nombre: "", apellido: "", email: "", dni: "", contrasena: "" });
        } catch (err: any) {
            console.error("Error al crear empleado:", err);
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError("Ocurrió un error al crear el empleado.");
            }
        }
    };

    const handleEliminar = async (id_empleado: number) => {
        if (!id_servicio) return;

        if (user && id_empleado === user.id_usuario) {
            alert("No podés eliminarte a vos mismo desde esta sección. Hacelo desde tu perfil si estás seguro.");
            return;
        }

        try {
            await eliminarEmpleado(Number(id_servicio), id_empleado);
            setEmpleados(empleados.filter(e => e.id !== id_empleado));
        } catch (err) {
            console.error("Error al eliminar empleado:", err);
        }
    };

    const navigate = useNavigate();

    return (
        <div className="empleados-servicio">
            <h2>Empleados del Servicio</h2>
            <ul>
                {empleados.map((e) => (
                    <li key={e.id}>
                        {e.nombre} {e.apellido} - {e.email} ({e.dni})
                        <button onClick={() => handleEliminar(e.id)}>Eliminar</button>
                    </li>
                ))}
            </ul>

            <h3>Agregar nuevo empleado</h3>
            {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}
            <div className="form-empleado">
                <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleInputChange} />
                <input name="apellido" placeholder="Apellido" value={form.apellido} onChange={handleInputChange} />
                <input name="email" placeholder="Email" value={form.email} onChange={handleInputChange} />
                <input name="dni" placeholder="DNI" value={form.dni} onChange={handleInputChange} />
                <input name="contrasena" placeholder="Contraseña" type="password" value={form.contrasena} onChange={handleInputChange} />
                <button onClick={handleCrear}>Crear empleado</button>
            </div>
            <button className="inicio" onClick={() => navigate(`/empleado/${id_servicio}`)}>Home</button>
        </div>
    );
};

export default EmpleadosServicio;
