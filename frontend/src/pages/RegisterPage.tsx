import { useState } from "react";
import { FaEnvelope, FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import '../css/registro.css';


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
    const [repeatPassword, setRepeatPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);


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

        if (formData.password !== repeatPassword) {
            setErrorMessage("Las contraseñas no coinciden");
            return;
        }

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
        <div className="register-container">
            <img src="/img/logo_con_deligo.png" alt="Logo Deligo" className="logo"/>

            <h2 className="titulo">Registrarse</h2>

            {successMessage && (
                <div className="success-message">✅ {successMessage}</div>
            )}
            {errorMessage && (
                <div className="error-message">❌ {errorMessage}</div>
            )}

            {!successMessage && (
                <form className="formulario" onSubmit={handleSubmit}>
                    <div className="input-container">
                        <FaEnvelope className="icon"/>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-container">
                        <FaUser className="icon"/>
                        <input
                            type="text"
                            name="nombre"
                            placeholder="Nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-container">
                        <FaUser className="icon"/>
                        <input
                            type="text"
                            name="apellido"
                            placeholder="Apellido"
                            value={formData.apellido}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-container">
                        <FaLock className="icon"/>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Contraseña"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
        {showPassword ? <FaEyeSlash/> : <FaEye/>}
    </span>
                    </div>

                    <div className="input-container">
                        <FaLock className="icon"/>
                        <input
                            type={showRepeatPassword ? "text" : "password"}
                            placeholder="Repetir contraseña"
                            value={repeatPassword}
                            onChange={(e) => setRepeatPassword(e.target.value)}
                            required
                        />
                        <span className="eye-icon" onClick={() => setShowRepeatPassword(!showRepeatPassword)}>
        {showRepeatPassword ? <FaEyeSlash/> : <FaEye/>}
    </span>
                    </div>

                    <label className="checkbox-label">
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
                                className="input"
                                type="text"
                                name="id_servicio"
                                placeholder="ID del servicio"
                                value={formData.id_servicio}
                                onChange={handleChange}
                                required
                            />
                            <input
                                className="input"
                                type="text"
                                name="dni"
                                placeholder="DNI"
                                value={formData.dni}
                                onChange={handleChange}
                                required
                            />
                        </>
                    )}

                    <button className="btn-registrarme" type="submit">Registrarme</button>

                    <p className="login-text">
                        Ya tenés una cuenta? <a href="/login">Login</a>
                    </p>
                </form>
            )}
        </div>
    );
};

export default RegisterPage;