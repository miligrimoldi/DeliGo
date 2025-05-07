import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cambiarContrasena } from '../api';
import { FaArrowLeft} from 'react-icons/fa';

const EditarPerfil = () => {
    const navigate = useNavigate();
    const [actual, setActual] = useState('');
    const [nueva, setNueva] = useState('');
    const [confirmar, setConfirmar] = useState('');
    const [verNueva, setVerNueva] = useState(false);
    const [mensaje, setMensaje] = useState('');

    const handleGuardar = async () => {
        try {
            const res = await cambiarContrasena({ actual, nueva, confirmar });
            setMensaje(res.msg || 'Contraseña actualizada');
        } catch (err: any) {
            setMensaje(err.response?.data?.error || 'Error al cambiar contraseña');
        }
    };

    return (
        <div style={{ backgroundColor: '#F4F5F9', minHeight: '100vh'}}>
            {/* Header fijo */}
            <div style={{
                backgroundColor: 'white',
                paddingTop: 50, paddingBottom: 20,
                position: 'sticky', top: 0, zIndex: 10,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <div style={{
                    maxWidth: 768, margin: '0 auto', padding: '0 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
                }}>
                    <FaArrowLeft
                        onClick={() => navigate(-1)}
                        style={{ fontSize: 20, cursor: 'pointer', position: 'absolute', left: 20 }}
                    />
                    <h2 style={{
                        fontSize: 18, fontFamily: 'Poppins', fontWeight: 500,
                        letterSpacing: 0.54, margin: 0
                    }}>Editar Perfil</h2>
                </div>
            </div>

            {/* Contenido scrolleable */}
            <div style={{ maxWidth: "600px", margin: '0 auto', padding: '0 20px', minWidth:'500px'}}>
                <h3 style={{
                    fontFamily: 'Poppins', fontWeight: 600,
                    fontSize: 18, color: 'black', paddingTop: 15
                }}>Cambiar contraseña</h3>

                <input
                    type="password"
                    placeholder="Contraseña actual"
                    value={actual}
                    onChange={(e) => setActual(e.target.value)}
                    style={inputStyle}
                />

                <div style={{ position: 'relative' }}>
                    <input
                        type={verNueva ? 'text' : 'password'}
                        placeholder="Nueva contraseña"
                        value={nueva}
                        onChange={(e) => setNueva(e.target.value)}
                        style={{ ...inputStyle, paddingRight: 40 }}
                    />
                    <span
                        onClick={() => setVerNueva(!verNueva)}
                        style={{ position: 'absolute', right: 15, top: 18, cursor: 'pointer' }}
                    >
                    </span>
                </div>

                <input
                    type="password"
                    placeholder="Confirmar contraseña"
                    value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)}
                    style={inputStyle}
                />

                {mensaje && <p style={{ color: '#4B614C', fontFamily: 'Poppins', marginTop: 10 }}>{mensaje}</p>}

                <button
                    onClick={handleGuardar}
                    style={{
                        marginTop: 20, width: '100%', height: 60,
                        background: 'linear-gradient(138deg, #AEDC81 0%, #C7DDB1 100%)',
                        borderRadius: 5, border: 'none', color: 'white', fontSize: 15,
                        fontFamily: 'Poppins', fontWeight: 500, cursor: 'pointer'
                    }}
                >
                    Guardar cambios
                </button>
            </div>
        </div>
    );
};

const inputStyle = {
    width: '100%', height: 60,
    backgroundColor: 'white',
    borderRadius: 5,
    border: 'none',
    padding: '0 20px',
    fontSize: 15,
    fontFamily: 'Poppins',
    color: '#868889',
    marginTop: 16
};

export default EditarPerfil;
