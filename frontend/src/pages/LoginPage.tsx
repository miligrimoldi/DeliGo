import { useState } from "react";
import { Link } from "react-router-dom";
import "../css/login.css";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("user", JSON.stringify(data));

                if (data.esAdmin) {
                    window.location.href = `/admin/${data.id_servicio}`;
                } else {
                    window.location.href = "/entidades";
                }
            } else {
                setErrorMessage(data.error || "Error al iniciar sesión");
            }
        } catch (err) {
            setErrorMessage("Ocurrió un error en la solicitud");
            console.error("Login error:", err);
        }
    };

    return (
        <div className="login-container">
            <img src="/img/logo_con_deligo.png" alt="Logo Deligo" className="logo" />
            <h2 className="titulo">Iniciar sesión</h2>

            {errorMessage && <div className="error-message">❌ {errorMessage}</div>}

            <form className="formulario" onSubmit={handleSubmit}>
                <input
                    className="input"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    className="input"
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button className="btn-login" type="submit">
                    Ingresar
                </button>

                <p className="register-text">
                    ¿No tenés cuenta?{" "}
                    <Link to="/register">Regístrate</Link>
                </p>
            </form>
        </div>
    );
};

export default LoginPage;
