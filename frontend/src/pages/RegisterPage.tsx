import { useState } from "react";

type FormDataType = {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    esAdmin: boolean;
    id_servicio?: string;
    dni?: string;
};


const RegisterPage = () => {

    const [formData, setFormData] = useState<FormDataType>({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        esAdmin: false,
        id_servicio: "",
        dni: "",
    });

    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage(null);
        setErrorMessage(null);

        const dataToSend = { ...formData };

        if (!formData.esAdmin) {
            delete dataToSend.id_servicio;
            delete dataToSend.dni;
        }

        try {
            const response = await fetch("/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataToSend),
            });

            const responseData = await response.json();

            if (response.ok) {
                setSuccessMessage(responseData.message || "Usuario registrado con éxito");
                setFormData({
                    nombre: "",
                    apellido: "",
                    email: "",
                    password: "",
                    esAdmin: false,
                    id_servicio: "",
                    dni: "",
                });
            } else {
                setErrorMessage(responseData.error || "Ocurrió un error en el registro");
            }
        } catch (error) {
            setErrorMessage("Error en la solicitud");
            console.error("Error en la solicitud:", error);
        }
    };

    return (
        <div>
            <h2>Registro</h2>

            <div style={{ color: "green", marginBottom: "1rem" }}>
                {successMessage !== null ? `✅ ${successMessage}` : "⏳ Esperando éxito..."}
            </div>
            <div style={{ color: "red", marginBottom: "1rem" }}>
                {errorMessage !== null ? `❌ ${errorMessage}` : "⏳ Sin errores aún..."}
            </div>


            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="apellido"
                    placeholder="Apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <label>
                    <input
                        type="checkbox"
                        name="esAdmin"
                        checked={formData.esAdmin}
                        onChange={handleChange}
                    />
                    Soy Administrador
                </label>

                {formData.esAdmin && (
                    <>
                        <input
                            type="text"
                            name="id_servicio"
                            placeholder="ID del servicio"
                            value={formData.id_servicio}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="text"
                            name="dni"
                            placeholder="DNI"
                            value={formData.dni}
                            onChange={handleChange}
                            required
                        />
                    </>
                )}

                <button type="submit">Registrarse</button>
            </form>
        </div>
    );
};

export default RegisterPage;
