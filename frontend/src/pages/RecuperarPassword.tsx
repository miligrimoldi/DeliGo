import { useState } from "react";
import { enviarMailRecuperacion } from "../api";
import { useNavigate } from "react-router-dom";

const RecuperarPassword = () => {
    const [email, setEmail] = useState("");
    const [mensaje, setMensaje] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await enviarMailRecuperacion(email);
            setMensaje("Si el email existe, se enviará un link para restablecer la contraseña.");
        } catch (error) {
            const err = error as { response?: { data?: { msg?: string } } };
            setMensaje(err.response?.data?.msg || "Error al enviar el correo.");
        }
    };

    return (
        <div className="login-container">
            <img src="/img/logo_con_deligo.png" alt="Logo Deligo" className="logo" />
            <h2 className="titulo">Recuperar contraseña</h2>

            {mensaje && <div className="mensaje-ok">{mensaje}</div>}

            <form className="formulario" onSubmit={handleSubmit}>
                <input
                    className="input"
                    type="email"
                    id="recuperar-email"
                    name="email"
                    autoComplete="email"
                    placeholder="Ingresá tu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button className="btn-login" type="submit">
                    Enviar link de recuperación
                </button>

                <p className="register-text" style={{marginTop: 10}}>
          <span
              style={{textDecoration: "underline", color: "#555", cursor: "pointer"}}
              onClick={() => navigate("/login")}
          >
            Volver al inicio de sesión
          </span>
                </p>
            </form>
        </div>
    );
};

export default RecuperarPassword;
