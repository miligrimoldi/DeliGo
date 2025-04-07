import { useState } from "react";
import { Link } from "react-router-dom";

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
        <div>
            <h2>Iniciar sesión</h2>
            {errorMessage && <div style={{ color: "red" }}>❌ {errorMessage}</div>}
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Ingresar</button>
            </form>

            {/* Cartel de registro */}
            <p style={{ marginTop: "20px" }}>
                ¿No tienes cuenta?{" "}
                <Link to="/register" style={{ color: "blue", textDecoration: "underline" }}>
                    Regístrate
                </Link>
            </p>
        </div>
    );
};

export default LoginPage;
