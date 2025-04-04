import { useState } from "react";

type FormDataType = {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    esAdmin: boolean;
    id_servicio?: string;
};

const RegisterPage = () => {
    const [formData, setFormData] = useState<FormDataType>({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        esAdmin: false,
        id_servicio: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSend = { ...formData };

        // Si no es administrador, eliminamos el campo id_servicio
        if (!formData.esAdmin) {
            delete dataToSend.id_servicio;
        }

        try {
            const response = await fetch("http://localhost:5000/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataToSend),
            });

            if (response.ok) {
                console.log("Usuario registrado con éxito");
            } else {
                console.error("Error en el registro");
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
        }
    };

    return (
        <div>
            <h2>Registro</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="nombre" placeholder="Nombre" onChange={handleChange} required />
                <input type="text" name="apellido" placeholder="Apellido" onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="password" name="password" placeholder="Contraseña" onChange={handleChange} required />

                <label>
                    <input type="checkbox" name="esAdmin" onChange={handleChange} />
                    Soy Administrador
                </label>

                {formData.esAdmin && (
                    <input type="text" name="id_servicio" placeholder="ID del servicio" onChange={handleChange} />
                )}

                <button type="submit">Registrarse</button>
            </form>
        </div>
    );
};

export default RegisterPage;
