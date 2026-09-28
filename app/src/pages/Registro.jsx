import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export const Registro = () => {
    const [formData, setFormData] = useState({
        nombre_usuario: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const dataToSend = {
                ...formData,
                nombre: formData.nombre_usuario
            };

            await api.post('/usuarios/registro', dataToSend);

            alert('¡Usuario registrado con éxito!');
            navigate('/login');
        } catch (err) {
            setError(
                err.response?.data?.mensaje || 
                err.response?.data?.error || 
                'Ocurrió un error al intentar registrar el usuario'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="d-flex justify-content-center align-items-center min-vh-100 px-3 py-5" 
            style={{ 
                background: 'linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url("https://viajandoarg.com/wp-content/uploads/2024/07/cumbrecita-1-scaled-e1721437610954.jpg") center/cover no-repeat fixed',
                fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
        >
            <div 
                className="card p-4 p-md-5 border-0 shadow-lg" 
                style={{ 
                    maxWidth: '440px', 
                    width: '100%', 
                    borderRadius: '24px', 
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #EAEAEA'
                }}
            >
                {/* Branding / Header */}
                <div className="text-center mb-4">
                    <Link to="/home" className="d-inline-block mb-2">
                        <img 
                            src="/logo.png" 
                            alt="Logo Rumbo Serrano" 
                            style={{ width: '52px', height: '52px', objectFit: 'contain' }} 
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    </Link>
                    <h3 className="fw-bold text-dark m-0 fs-4" style={{ letterSpacing: '-0.5px' }}>
                        Crear una cuenta
                    </h3>
                    <p className="text-muted small mt-1 mb-0">
                        Ingresá tus datos para empezar a explorar
                    </p>
                </div>

                {/* Mensaje de Error */}
                {error && (
                    <div 
                        className="alert alert-danger py-2 px-3 small border-0 mb-4" 
                        style={{ borderRadius: '12px', backgroundColor: '#FEE2E2', color: '#991B1B' }}
                    >
                        ⚠️ {error}
                    </div>
                )}

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label 
                            className="form-label text-dark fw-semibold mb-1" 
                            style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}
                        >
                            NOMBRE DE USUARIO
                        </label>
                        <input
                            type="text"
                            name="nombre_usuario"
                            className="form-control px-3 py-2.5"
                            style={{ 
                                borderRadius: '12px', 
                                border: '1px solid #E2E8F0', 
                                fontSize: '0.9rem',
                                backgroundColor: '#F8FAFC'
                            }}
                            placeholder="Ej: alex123"
                            value={formData.nombre_usuario}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label 
                            className="form-label text-dark fw-semibold mb-1" 
                            style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}
                        >
                            CORREO ELECTRÓNICO
                        </label>
                        <input
                            type="email"
                            name="email"
                            className="form-control px-3 py-2.5"
                            style={{ 
                                borderRadius: '12px', 
                                border: '1px solid #E2E8F0', 
                                fontSize: '0.9rem',
                                backgroundColor: '#F8FAFC'
                            }}
                            placeholder="tu@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label 
                            className="form-label text-dark fw-semibold mb-1" 
                            style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}
                        >
                            CONTRASEÑA
                        </label>
                        <input
                            type="password"
                            name="password"
                            className="form-control px-3 py-2.5"
                            style={{ 
                                borderRadius: '12px', 
                                border: '1px solid #E2E8F0', 
                                fontSize: '0.9rem',
                                backgroundColor: '#F8FAFC'
                            }}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-dark w-100 py-2.5 fw-bold shadow-sm"
                        style={{ 
                            borderRadius: '12px', 
                            fontSize: '0.9rem',
                            backgroundColor: '#111111',
                            borderColor: '#111111'
                        }}
                    >
                        {loading ? 'Creando cuenta...' : 'Registrarse'}
                    </button>
                </form>

                {/* Footer de la Card */}
                <p className="text-center mt-4 mb-0 small text-muted">
                    ¿Ya tenés una cuenta?{' '}
                    <Link to="/login" className="fw-bold text-dark text-decoration-underline ms-1">
                        Iniciá sesión acá
                    </Link>
                </p>
            </div>
        </div>
    );
};