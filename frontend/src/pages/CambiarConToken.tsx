import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cambiarContrasenaConToken } from "../api";

const CambiarConToken = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    const [nueva, setNueva] = useState("");
    const [confirmar, setConfirmar] = useState("");
    const [mensaje, setMensaje] = useState("");

    const handleGuardar = async () => {
        if (!token) {
            setMensaje("Token inválido.");
            return;
        }

        if (nueva !== confirmar) {
            setMensaje("Las contraseñas no coinciden.");
            return;
        }

        try {
            const res = await cambiarContrasenaConToken({ token, nueva });
            setMensaje(res.msg || "Contraseña actualizada correctamente.");
            setTimeout(() => navigate("/login"), 2000);
        } catch (error) {
            const err = error as { response?: { data?: { msg?: string } } };
            setMensaje(err.response?.data?.msg || "Error al cambiar contraseña.");
        }
    };

    return (
        <div style={{ backgroundColor: '#F4F5F9', minHeight: '100vh', padding: 30 }}>
            <h2 style={{ fontFamily: 'Poppins', marginBottom: 20 }}>Restablecer contraseña</h2>

            <input
                type="password"
                id="nueva-password"
                name="nueva"
                autoComplete="new-password"
                placeholder="Nueva contraseña"
                value={nueva}
                onChange={(e) => setNueva(e.target.value)}
                style={inputStyle}
                required
            />
            <input
                type="password"
                id="confirmar-password"
                name="confirmar"
                autoComplete="new-password"
                placeholder="Confirmar contraseña"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                style={inputStyle}
                required
            />

            {mensaje && <p style={{ fontFamily: 'Poppins', color: "#4B614C", marginTop: 10 }}>{mensaje}</p>}

            <button onClick={handleGuardar} style={buttonStyle}>
                Guardar nueva contraseña
            </button>

            <button onClick={() => navigate("/login")} style={linkButtonStyle}>
                Volver al inicio de sesión
            </button>
        </div>
    );
};

const inputStyle = {
    width: '100%',
    height: 50,
    marginBottom: 16,
    padding: '0 20px',
    borderRadius: 5,
    border: 'none',
    fontSize: 15,
    fontFamily: 'Poppins',
} as React.CSSProperties;

const buttonStyle = {
    width: '100%',
    height: 50,
    background: 'linear-gradient(138deg, #AEDC81 0%, #C7DDB1 100%)',
    borderRadius: 5,
    border: 'none',
    color: 'white',
    fontSize: 15,
    fontFamily: 'Poppins',
    fontWeight: 500,
    cursor: 'pointer',
    marginBottom: 10,
} as React.CSSProperties;

const linkButtonStyle = {
    width: '100%',
    height: 50,
    backgroundColor: 'transparent',
    color: '#666',
    fontSize: 15,
    fontFamily: 'Poppins',
    border: 'none',
    textDecoration: 'underline',
    cursor: 'pointer',
} as React.CSSProperties;

export default CambiarConToken;
