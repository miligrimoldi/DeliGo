import { useState } from "react";

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
                // Guardar datos en localStorage o en contexto (más adelante)
                localStorage.setItem("user", JSON.stringify(data));

                // Redirigir dependiendo del tipo de usuario
                if (data.esAdmin) {
                    window.location.href = `/admin/${data.id_servicio}`; // ej: /admin/1
                } else {
                    window.location.href = "/home"; // para usuarios consumidores
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
        </div>
    );
};

export default LoginPage;
