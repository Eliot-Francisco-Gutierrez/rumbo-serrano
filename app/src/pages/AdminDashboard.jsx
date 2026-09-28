import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export const AdminDashboard = () => {
    const navigate = useNavigate();

    const [seccionActual, setSeccionActual] = useState('actividades');

    const [actividades, setActividades] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

    // Modales y Edición - Actividades
    const [modoEdicion, setModoEdicion] = useState(false);
    const [actividadIdEdit, setActividadIdEdit] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);

    // Modales y Edición - Categorías
    const [modalCategoria, setModalCategoria] = useState(false);
    const [modoEdicionCategoria, setModoEdicionCategoria] = useState(false);
    const [categoriaIdEdit, setCategoriaIdEdit] = useState(null);
    const [formCategoria, setFormCategoria] = useState({
        nombre: '',
        descripcion: '',
        imagen_url: ''
    });

    // Estados para la gestión de usuarios
    const [busquedaUsuario, setBusquedaUsuario] = useState('');
    const [filtroRol, setFiltroRol] = useState('todos');
    const [paginaActual, setPaginaActual] = useState(1);
    const [usuariosPorPagina, setUsuariosPorPagina] = useState(5);
    const [modalEditarUsuario, setModalEditarUsuario] = useState(false);
    const [usuarioEdit, setUsuarioEdit] = useState(null);
    const [nuevoRolSeleccionado, setNuevoRolSeleccionado] = useState('cliente');

    // Formulario de Actividades
    const [formData, setFormData] = useState({
        titulo: '',
        duracion: '',
        ubicacion: '',
        precio: '',
        imagen: '',
        descripcion: '',
        categoria_id: '',
        fecha_inicio: '',
        fecha_fin: '',
        cupo_maximo: 10,
        cupo_disponible: 10
    });

    useEffect(() => {
        cargarActividades();
        cargarUsuarios();
        cargarCategorias();
    }, []);

    const cargarActividades = async () => {
        setLoading(true);
        try {
            const res = await api.get('/actividades', { params: { limit: 50 } });
            setActividades(res.data.data || res.data);
        } catch (err) {
            console.error("Error al obtener actividades:", err);
        } finally {
            setLoading(false);
        }
    };

    const cargarUsuarios = async () => {
        try {
            const res = await api.get('/usuarios');
            setUsuarios(res.data);
        } catch (err) {
            console.error("Error al obtener usuarios:", err);
        }
    };

    const cargarCategorias = async () => {
        try {
            const res = await api.get('/categorias');
            setCategorias(res.data);
        } catch (err) {
            console.error("Error al obtener categorías:", err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        navigate('/login');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    // --- FUNCIONES ACTIVIDADES ---
    const abrirModalCrear = () => {
        setModoEdicion(false);
        setActividadIdEdit(null);
        setFormData({
            titulo: '',
            duracion: '',
            ubicacion: '',
            precio: '',
            imagen: '',
            descripcion: '',
            categoria_id: categorias[0]?.id || '',
            fecha_inicio: '',
            fecha_fin: '',
            cupo_maximo: 10,
            cupo_disponible: 10
        });
        setMostrarModal(true);
    };

    const abrirModalEditar = (act) => {
        setModoEdicion(true);
        setActividadIdEdit(act.id);
        setFormData({
            titulo: act.titulo || '',
            duracion: act.duracion || '',
            ubicacion: act.ubicacion || '',
            precio: act.precio || '',
            imagen: act.imagen || '',
            descripcion: act.descripcion || '',
            categoria_id: act.categoria_id || '',
            fecha_inicio: act.fecha_inicio ? new Date(act.fecha_inicio).toISOString().slice(0, 16) : '',
            fecha_fin: act.fecha_fin ? new Date(act.fecha_fin).toISOString().slice(0, 16) : '',
            cupo_maximo: act.cupo_maximo ?? 10,
            cupo_disponible: act.cupo_disponible ?? 10
        });
        setMostrarModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modoEdicion) {
                await api.put(`/actividades/${actividadIdEdit}`, formData);
                setMensaje({ tipo: 'success', texto: '¡Actividad actualizada correctamente!' });
            } else {
                await api.post('/actividades', formData);
                setMensaje({ tipo: 'success', texto: '¡Actividad creada con éxito!' });
            }
            setMostrarModal(false);
            cargarActividades();
        } catch (err) {
            setMensaje({ 
                tipo: 'danger', 
                texto: err.response?.data?.error || err.response?.data?.mensaje || 'Error al procesar la solicitud' 
            });
        }
    };

    const handleEliminar = async (id) => {
        if (window.confirm('¿Deseas eliminar esta actividad?')) {
            try {
                await api.delete(`/actividades/${id}`);
                setMensaje({ tipo: 'warning', texto: 'Actividad eliminada.' });
                cargarActividades();
            } catch (err) {
                setMensaje({ tipo: 'danger', texto: 'Error al eliminar la actividad.' });
            }
        }
    };

// --- FUNCIONES CATEGORÍAS ---
    const abrirModalCrearCategoria = () => {
        setModoEdicionCategoria(false);
        setCategoriaIdEdit(null);
        setFormCategoria({ nombre: '', descripcion: '', imagen_url: '' });
        setModalCategoria(true);
    };

    const abrirModalEditarCategoria = (cat) => {
        setModoEdicionCategoria(true);
        setCategoriaIdEdit(cat.id);
        setFormCategoria({
            nombre: cat.nombre || '',
            descripcion: cat.descripcion || '',
            imagen_url: cat.imagen_url || cat.imagen || ''
        });
        setModalCategoria(true);
    };

    const guardarCategoria = async (e) => {
        e.preventDefault();
        try {
            // Se envían 'imagen_url' e 'imagen' por compatibilidad con la DB
            const payload = {
                nombre: formCategoria.nombre,
                descripcion: formCategoria.descripcion,
                imagen_url: formCategoria.imagen_url,
                imagen: formCategoria.imagen_url
            };

            if (modoEdicionCategoria) {
                await api.put(`/categorias/${categoriaIdEdit}`, payload);
                setMensaje({ tipo: 'success', texto: '¡Categoría actualizada correctamente!' });
            } else {
                await api.post('/categorias', payload);
                setMensaje({ tipo: 'success', texto: '¡Categoría creada con éxito!' });
            }
            setModalCategoria(false);
            cargarCategorias();
        } catch (err) {
            setMensaje({
                tipo: 'danger',
                texto: err.response?.data?.error || 'Error al procesar la categoría.'
            });
        }
    };
    const eliminarCategoria = async (id) => {
        if (window.confirm('¿Deseas eliminar esta categoría?')) {
            try {
                await api.delete(`/categorias/${id}`);
                setMensaje({ tipo: 'warning', texto: 'Categoría eliminada.' });
                cargarCategorias();
            } catch (err) {
                setMensaje({ tipo: 'danger', texto: 'Error al eliminar la categoría.' });
            }
        }
    };

    // --- FUNCIONES USUARIOS ---
    const abrirModalEditarRol = (usr) => {
        setUsuarioEdit(usr);
        setNuevoRolSeleccionado(usr.rol || 'cliente');
        setModalEditarUsuario(true);
    };

    const guardarNuevoRol = async (e) => {
        e.preventDefault();
        if (!usuarioEdit) return;

        if (usuarioEdit.rol === 'admin' && nuevoRolSeleccionado !== 'admin') {
            const cantidadAdmins = usuarios.filter(u => u.rol === 'admin').length;
            if (cantidadAdmins <= 1) {
                setMensaje({ 
                    tipo: 'danger', 
                    texto: 'Acción denegada: Debe haber al menos un administrador en el sistema.' 
                });
                setModalEditarUsuario(false);
                return;
            }
        }

        try {
            await api.put(`/usuarios/${usuarioEdit.id}/rol`, { rol: nuevoRolSeleccionado });
            setMensaje({ tipo: 'success', texto: '¡Rol de usuario actualizado correctamente!' });
            setModalEditarUsuario(false);
            cargarUsuarios();
        } catch (err) {
            setMensaje({ 
                tipo: 'danger', 
                texto: err.response?.data?.error || 'Error al cambiar el rol del usuario.' 
            });
        }
    };

    const handleEliminarUsuario = async (usr) => {
        if (usr.rol === 'admin') {
            const cantidadAdmins = usuarios.filter(u => u.rol === 'admin').length;
            if (cantidadAdmins <= 1) {
                setMensaje({ 
                    tipo: 'danger', 
                    texto: 'Acción denegada: No se puede eliminar al único administrador del sistema.' 
                });
                return;
            }
        }

        if (window.confirm(`¿Deseas eliminar al usuario "${usr.nombre || usr.nombre_usuario || usr.email}"?`)) {
            try {
                await api.delete(`/usuarios/${usr.id}`);
                setMensaje({ tipo: 'warning', texto: 'Usuario eliminado.' });
                cargarUsuarios();
            } catch (err) {
                setMensaje({ tipo: 'danger', texto: 'Error al eliminar el usuario.' });
            }
        }
    };

    // Filtros y paginación de usuarios
    const usuariosFiltrados = usuarios.filter((usr) => {
        const termino = busquedaUsuario.toLowerCase();
        const coincideNombre = (usr.nombre || '').toLowerCase().includes(termino);
        const coincideApellido = (usr.apellido || '').toLowerCase().includes(termino);
        const coincideEmail = (usr.email || '').toLowerCase().includes(termino);
        const coincideUsuario = (usr.nombre_usuario || '').toLowerCase().includes(termino);

        const coincideBusqueda = coincideNombre || coincideApellido || coincideEmail || coincideUsuario;
        const coincideRol = filtroRol === 'todos' ? true : usr.rol === filtroRol;

        return coincideBusqueda && coincideRol;
    });

    const indiceUltimo = paginaActual * usuariosPorPagina;
    const indicePrimer = indiceUltimo - usuariosPorPagina;
    const usuariosPaginados = usuariosFiltrados.slice(indicePrimer, indiceUltimo);
    const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina) || 1;

    const resetFiltrosUsuarios = () => {
        setBusquedaUsuario('');
        setFiltroRol('todos');
        setPaginaActual(1);
    };

    const formatearFechas = (inicio, fin) => {
        if (!inicio) return 'A convenir';
        const dInicio = new Date(inicio).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
        if (!fin) return dInicio;
        const dFin = new Date(fin).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
        return `${dInicio} HS ➔ ${dFin} HS`;
    };

    const getBadgeRol = (rol) => {
        switch (rol) {
            case 'admin':
                return <span className="badge rounded-pill px-3 py-2 bg-danger text-white">ADMINISTRADOR</span>;
            case 'operador':
                return <span className="badge rounded-pill px-3 py-2 bg-warning text-dark">OPERADOR</span>;
            default:
                return <span className="badge rounded-pill px-3 py-2 bg-secondary text-white">CLIENTE</span>;
        }
    };

    return (
        <div className="d-flex min-vh-100" style={{ backgroundColor: '#2B2B2B' }}>
        
        {/* Sidebar Lateral Conservado */}
        <div className="p-4 d-flex flex-column justify-content-between" style={{ width: '280px', backgroundColor: '#F0EBE1', borderRight: '1px solid #D6CEC2' }}>
            <div>
            <div className="text-center mb-4 cursor-pointer" onClick={() => setSeccionActual('inicio')}>
                <img src="/logo.png" alt="Logo" style={{ width: '50px', height: '50px', objectFit: 'contain' }} className="mb-2" />
                <h5 className="fw-black mb-0 tracking-wider" style={{ letterSpacing: '2px', color: '#3A3935' }}>RUMBO</h5>
                <p className="fst-italic small text-muted mb-0">Serrano</p>
            </div>

            <div className="p-2 mb-4 text-center rounded-pill fw-bold text-uppercase" style={{ backgroundColor: '#D1C7B7', color: '#555', fontSize: '0.78rem', letterSpacing: '1px' }}>
                PANEL ADMINISTRADOR
            </div>

            <div className="d-flex flex-column gap-2 text-uppercase fw-bold" style={{ fontSize: '0.82rem', color: '#4A463D' }}>
                <button 
                onClick={() => setSeccionActual('inicio')}
                className={`btn text-start text-uppercase fw-bold border-0 p-2 d-flex justify-content-between align-items-center ${seccionActual === 'inicio' ? 'bg-white shadow-sm rounded-3' : ''}`}
                style={{ color: '#4A463D', fontSize: '0.82rem' }}
                >
                <span>INICIO / ESTADÍSTICAS</span> <span>❯</span>
                </button>

                <button 
                onClick={() => setSeccionActual('actividades')}
                className={`btn text-start text-uppercase fw-bold border-0 p-2 d-flex justify-content-between align-items-center ${seccionActual === 'actividades' ? 'bg-white shadow-sm rounded-3' : ''}`}
                style={{ color: '#4A463D', fontSize: '0.82rem' }}
                >
                <span>ACTIVIDADES ({actividades.length})</span> <span>❯</span>
                </button>

                <button 
                onClick={() => setSeccionActual('categorias')}
                className={`btn text-start text-uppercase fw-bold border-0 p-2 d-flex justify-content-between align-items-center ${seccionActual === 'categorias' ? 'bg-white shadow-sm rounded-3' : ''}`}
                style={{ color: '#4A463D', fontSize: '0.82rem' }}
                >
                <span>CATEGORÍAS ({categorias.length})</span> <span>❯</span>
                </button>

                <button 
                onClick={() => setSeccionActual('usuarios')}
                className={`btn text-start text-uppercase fw-bold border-0 p-2 d-flex justify-content-between align-items-center ${seccionActual === 'usuarios' ? 'bg-white shadow-sm rounded-3' : ''}`}
                style={{ color: '#4A463D', fontSize: '0.82rem' }}
                >
                <span>USUARIOS ({usuarios.length})</span> <span>❯</span>
                </button>
            </div>
            </div>

            <button onClick={handleLogout} className="btn text-white fw-bold w-100 py-2 rounded-pill shadow-sm" style={{ backgroundColor: '#72C253', fontSize: '0.85rem' }}>
            CERRAR SESIÓN
            </button>
        </div>

        {/* ÁREA PRINCIPAL */}
        <div className="flex-grow-1 p-4 p-md-5 overflow-auto" style={{ maxHeight: '100vh' }}>
            
            {mensaje.texto && (
            <div className={`alert alert-${mensaje.tipo} alert-dismissible fade show mb-4`} role="alert">
                {mensaje.texto}
                <button type="button" className="btn-close" onClick={() => setMensaje({ tipo: '', texto: '' })}></button>
            </div>
            )}

            {/* SECCIÓN ACTIVIDADES */}
            {seccionActual === 'actividades' && (
            <div className="p-4 shadow-lg" style={{ backgroundColor: '#F0EBE1', borderRadius: '25px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold mb-0" style={{ color: '#3A3935' }}>Gestión de Actividades</h3>
                    <p className="text-muted small mb-0">Administrá las experiencias, itinerarios y cupos disponibles</p>
                </div>

                <button 
                    onClick={abrirModalCrear}
                    className="btn text-white fw-bold d-flex align-items-center gap-2 shadow-sm px-3 py-2"
                    style={{ backgroundColor: '#72C253', borderRadius: '15px' }}
                >
                    <span style={{ fontSize: '1.2rem', lineHeight: '0' }}>+</span> NUEVA ACTIVIDAD
                </button>
                </div>

                {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-success" role="status"></div>
                    <p className="mt-2 text-muted">Cargando...</p>
                </div>
                ) : (
                <div className="table-responsive rounded-4 bg-white p-3 shadow-sm">
                    <table className="table table-hover align-middle mb-0">
                    <thead className="table-light text-uppercase small">
                        <tr>
                        <th>Imagen</th>
                        <th>Título</th>
                        <th>Categoría</th>
                        <th>Fechas de Salida / Regreso</th>
                        <th>Cupos</th>
                        <th>Precio</th>
                        <th className="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {actividades.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="text-center py-4 text-muted">
                            No hay actividades registradas.
                            </td>
                        </tr>
                        ) : (
                        actividades.map((act) => {
                            const cat = categorias.find(c => String(c.id) === String(act.categoria_id));
                            return (
                            <tr key={act.id}>
                            <td>
                                <img 
                                src={act.imagen || '/logo.png'} 
                                alt={act.titulo} 
                                className="rounded-3" 
                                style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                                />
                            </td>
                            <td className="fw-bold" style={{ color: '#3A3935' }}>{act.titulo}</td>
                            <td>
                                <span className="badge bg-secondary">{cat ? cat.nombre : 'Sin Categoría'}</span>
                            </td>
                            <td className="small text-muted fw-semibold">
                                {formatearFechas(act.fecha_inicio, act.fecha_fin)}
                            </td>
                            <td>
                                <span className={`badge rounded-pill ${act.cupo_disponible > 0 ? 'bg-success' : 'bg-danger'}`}>
                                    {act.cupo_disponible} / {act.cupo_maximo} libres
                                </span>
                            </td>
                            <td className="fw-bold text-success">${Number(act.precio).toLocaleString()}</td>
                            <td className="text-end">
                                <button 
                                onClick={() => abrirModalEditar(act)}
                                className="btn btn-sm btn-outline-dark me-2 rounded-pill px-3"
                                >
                                Editar
                                </button>
                                <button 
                                onClick={() => handleEliminar(act.id)}
                                className="btn btn-sm btn-outline-danger rounded-pill px-3"
                                >
                                Borrar
                                </button>
                            </td>
                            </tr>
                            );
                        })
                        )}
                    </tbody>
                    </table>
                </div>
                )}
            </div>
            )}

            {/* SECCIÓN CATEGORÍAS */}
            {seccionActual === 'categorias' && (
            <div className="p-4 shadow-lg" style={{ backgroundColor: '#F0EBE1', borderRadius: '25px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h3 className="fw-bold mb-0" style={{ color: '#3A3935' }}>Gestión de Categorías</h3>
                        <p className="text-muted small mb-0">Administrá las categorías visibles en la pantalla principal</p>
                    </div>

                    <button 
                        onClick={abrirModalCrearCategoria}
                        className="btn text-white fw-bold d-flex align-items-center gap-2 shadow-sm px-3 py-2"
                        style={{ backgroundColor: '#FF8A00', borderRadius: '15px' }}
                    >
                        <span style={{ fontSize: '1.2rem', lineHeight: '0' }}>+</span> NUEVA CATEGORÍA
                    </button>
                </div>

                <div className="table-responsive rounded-4 bg-white p-3 shadow-sm">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light text-uppercase small">
                            <tr>
                                <th>Imagen Header</th>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th className="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categorias.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-4 text-muted">
                                        No hay categorías registradas.
                                    </td>
                                </tr>
                            ) : (
                                categorias.map((cat) => (
                                    <tr key={cat.id}>
                                        <td>
                                            <img 
                                                src={cat.imagen_url || '/logo.png'} 
                                                alt={cat.nombre} 
                                                className="rounded-3" 
                                                style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                                            />
                                        </td>
                                        <td className="fw-bold" style={{ color: '#3A3935' }}>{cat.nombre}</td>
                                        <td className="small text-muted">{cat.descripcion || 'Sin descripción'}</td>
                                        <td className="text-end">
                                            <button 
                                                onClick={() => abrirModalEditarCategoria(cat)}
                                                className="btn btn-sm btn-outline-dark me-2 rounded-pill px-3"
                                            >
                                                Editar
                                            </button>
                                            <button 
                                                onClick={() => eliminarCategoria(cat.id)}
                                                className="btn btn-sm btn-outline-danger rounded-pill px-3"
                                            >
                                                Borrar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            )}

            {/* SECCIÓN USUARIOS */}
            {seccionActual === 'usuarios' && (
            <div className="p-4 shadow-lg" style={{ backgroundColor: '#F0EBE1', borderRadius: '25px' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h3 className="fw-bold mb-0" style={{ color: '#3A3935' }}>Panel de Gestión</h3>
                        <p className="text-muted small mb-0">Acceso total: podés gestionar usuarios y roles.</p>
                    </div>
                </div>

                {/* Barra de Filtros y Búsqueda */}
                <div className="bg-white p-3 rounded-4 shadow-sm mb-4">
                    <div className="row g-2 align-items-center">
                        <div className="col-md-5">
                            <input 
                                type="text"
                                className="form-control rounded-3 border-secondary-subtle"
                                placeholder="Buscar por nombre, apellido o email..."
                                value={busquedaUsuario}
                                onChange={(e) => {
                                    setBusquedaUsuario(e.target.value);
                                    setPaginaActual(1);
                                }}
                            />
                        </div>

                        <div className="col-md-3">
                            <select 
                                className="form-select rounded-3 border-secondary-subtle"
                                value={filtroRol}
                                onChange={(e) => {
                                    setFiltroRol(e.target.value);
                                    setPaginaActual(1);
                                }}
                            >
                                <option value="todos">Todos los roles</option>
                                <option value="admin">Administrador</option>
                                <option value="operador">Operador</option>
                                <option value="cliente">Cliente</option>
                            </select>
                        </div>

                        <div className="col-md-2">
                            <select 
                                className="form-select rounded-3 border-secondary-subtle"
                                value={usuariosPorPagina}
                                onChange={(e) => {
                                    setUsuariosPorPagina(Number(e.target.value));
                                    setPaginaActual(1);
                                }}
                            >
                                <option value={5}>Mostrar: 5 por pág.</option>
                                <option value={10}>Mostrar: 10 por pág.</option>
                                <option value={20}>Mostrar: 20 por pág.</option>
                            </select>
                        </div>

                        <div className="col-md-2 text-end">
                            <button 
                                onClick={resetFiltrosUsuarios}
                                className="btn btn-outline-secondary w-100 rounded-3 text-nowrap"
                            >
                                Restablecer
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabla de Usuarios */}
                <div className="table-responsive rounded-4 bg-white p-3 shadow-sm">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light text-uppercase small">
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Apellido</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th className="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuariosPaginados.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-4 text-muted">
                                        No se encontraron usuarios coincidentes.
                                    </td>
                                </tr>
                            ) : (
                                usuariosPaginados.map((usr) => (
                                    <tr key={usr.id}>
                                        <td className="fw-bold text-muted">#{usr.id}</td>
                                        <td className="fw-semibold" style={{ color: '#3A3935' }}>
                                            {usr.nombre || usr.nombre_usuario || '-'}
                                        </td>
                                        <td className="text-muted">
                                            {usr.apellido || '-'}
                                        </td>
                                        <td className="small text-muted">{usr.email}</td>
                                        <td>
                                            {getBadgeRol(usr.rol)}
                                        </td>
                                        <td className="text-end">
                                            <button 
                                                onClick={() => abrirModalEditarRol(usr)}
                                                className="btn btn-sm btn-outline-dark rounded-pill px-3 me-2"
                                            >
                                                Editar Rol
                                            </button>
                                            <button 
                                                onClick={() => handleEliminarUsuario(usr)}
                                                className="btn btn-sm btn-outline-danger rounded-pill px-3"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Footer con Información y Paginación */}
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 pt-3 border-top gap-2">
                        <span className="small text-muted">
                            Mostrando {usuariosFiltrados.length === 0 ? 0 : indicePrimer + 1} a {Math.min(indiceUltimo, usuariosFiltrados.length)} de {usuariosFiltrados.length} registros (Página {paginaActual} de {totalPaginas})
                        </span>

                        <div className="d-flex align-items-center gap-1">
                            <button 
                                className="btn btn-sm btn-outline-secondary rounded-2"
                                disabled={paginaActual === 1}
                                onClick={() => setPaginaActual(prev => prev - 1)}
                            >
                                Anterior
                            </button>

                            {Array.from({ length: totalPaginas }, (_, index) => (
                                <button
                                    key={index + 1}
                                    className={`btn btn-sm rounded-2 ${paginaActual === index + 1 ? 'btn-primary text-white' : 'btn-outline-secondary'}`}
                                    onClick={() => setPaginaActual(index + 1)}
                                >
                                    {index + 1}
                                </button>
                            ))}

                            <button 
                                className="btn btn-sm btn-outline-secondary rounded-2"
                                disabled={paginaActual === totalPaginas}
                                onClick={() => setPaginaActual(prev => prev + 1)}
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            )}

            {seccionActual === 'inicio' && (
            <div className="p-4 shadow-lg text-center" style={{ backgroundColor: '#F0EBE1', borderRadius: '25px' }}>
                <h3 className="fw-bold">Panel Principal & Estadísticas</h3>
                <p className="text-muted">Próximamente: Resumen de ventas, reservas e ingresos.</p>
            </div>
            )}

        </div>

        {/* MODAL CREAR / EDITAR ACTIVIDAD */}
        {mostrarModal && (
            <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg" style={{ backgroundColor: '#F0EBE1', borderRadius: '20px' }}>
                
                <div className="modal-header border-0 pb-0">
                    <h5 className="modal-title fw-bold" style={{ color: '#3A3935' }}>
                    {modoEdicion ? 'Editar Actividad' : 'Nueva Actividad'}
                    </h5>
                    <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body p-4">
                    <div className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label fw-bold small text-muted">TÍTULO *</label>
                        <input 
                        type="text" 
                        name="titulo" 
                        className="form-control rounded-3 border-secondary" 
                        placeholder="Ej: Trekking Champaquí" 
                        value={formData.titulo} 
                        onChange={handleChange} 
                        required 
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-bold small text-muted">CATEGORÍA *</label>
                        <select 
                        name="categoria_id" 
                        className="form-select rounded-3 border-secondary" 
                        value={formData.categoria_id} 
                        onChange={handleChange} 
                        required
                        >
                        <option value="">Seleccionar Categoría...</option>
                        {categorias.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                        ))}
                        </select>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-bold small text-muted">PRECIO ($) *</label>
                        <input 
                        type="number" 
                        step="0.01" 
                        name="precio" 
                        className="form-control rounded-3 border-secondary" 
                        placeholder="Ej: 25000" 
                        value={formData.precio} 
                        onChange={handleChange} 
                        required 
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-bold small text-muted">DURACIÓN</label>
                        <input 
                        type="text" 
                        name="duracion" 
                        className="form-control rounded-3 border-secondary" 
                        placeholder="Ej: 2 Días / 1 Noche" 
                        value={formData.duracion} 
                        onChange={handleChange} 
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-bold small text-muted">FECHA Y HORA DE INICIO / SALIDA</label>
                        <input 
                        type="datetime-local" 
                        name="fecha_inicio" 
                        className="form-control rounded-3 border-secondary" 
                        value={formData.fecha_inicio} 
                        onChange={handleChange} 
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-bold small text-muted">FECHA Y HORA DE REGRESO</label>
                        <input 
                        type="datetime-local" 
                        name="fecha_fin" 
                        className="form-control rounded-3 border-secondary" 
                        value={formData.fecha_fin} 
                        onChange={handleChange} 
                        />
                    </div>

                    <div className="col-md-4">
                        <label className="form-label fw-bold small text-muted">CUPO MÁXIMO</label>
                        <input 
                        type="number" 
                        name="cupo_maximo" 
                        className="form-control rounded-3 border-secondary" 
                        min="1"
                        value={formData.cupo_maximo} 
                        onChange={handleChange} 
                        required 
                        />
                    </div>

                    <div className="col-md-4">
                        <label className="form-label fw-bold small text-muted">CUPOS DISPONIBLES</label>
                        <input 
                        type="number" 
                        name="cupo_disponible" 
                        className="form-control rounded-3 border-secondary" 
                        min="0"
                        max={formData.cupo_maximo}
                        value={formData.cupo_disponible} 
                        onChange={handleChange} 
                        required 
                        />
                    </div>

                    <div className="col-md-4">
                        <label className="form-label fw-bold small text-muted">UBICACIÓN</label>
                        <input 
                        type="text" 
                        name="ubicacion" 
                        className="form-control rounded-3 border-secondary" 
                        placeholder="Ej: La Cumbrecita" 
                        value={formData.ubicacion} 
                        onChange={handleChange} 
                        />
                    </div>

                    <div className="col-12">
                        <label className="form-label fw-bold small text-muted">URL DE LA IMAGEN</label>
                        <input 
                        type="url" 
                        name="imagen" 
                        className="form-control rounded-3 border-secondary" 
                        placeholder="https://images.unsplash.com/foto.jpg" 
                        value={formData.imagen} 
                        onChange={handleChange} 
                        />
                    </div>

                    <div className="col-12">
                        <label className="form-label fw-bold small text-muted">DESCRIPCIÓN</label>
                        <textarea 
                        name="descripcion" 
                        className="form-control rounded-3 border-secondary" 
                        rows="3" 
                        placeholder="Detalles sobre el recorrido..." 
                        value={formData.descripcion} 
                        onChange={handleChange}
                        ></textarea>
                    </div>
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-4">
                    <button 
                        type="button" 
                        className="btn btn-secondary rounded-pill px-4" 
                        onClick={() => setMostrarModal(false)}
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        className="btn text-white fw-bold rounded-pill px-4" 
                        style={{ backgroundColor: '#72C253' }}
                    >
                        {modoEdicion ? 'ACTUALIZAR' : 'GUARDAR'}
                    </button>
                    </div>
                </form>

                </div>
            </div>
            </div>
        )}

        {/* MODAL CREAR / EDITAR CATEGORÍA */}
        {modalCategoria && (
            <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg" style={{ backgroundColor: '#F0EBE1', borderRadius: '20px' }}>
                        <div className="modal-header border-0 pb-0">
                            <h5 className="modal-title fw-bold" style={{ color: '#3A3935' }}>
                                {modoEdicionCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
                            </h5>
                            <button type="button" className="btn-close" onClick={() => setModalCategoria(false)}></button>
                        </div>
                        <form onSubmit={guardarCategoria} className="modal-body p-4">
                            <div className="mb-3">
                                <label className="form-label fw-bold small text-muted">NOMBRE *</label>
                                <input 
                                    type="text" 
                                    className="form-control rounded-3 border-secondary" 
                                    value={formCategoria.nombre} 
                                    onChange={(e) => setFormCategoria({ ...formCategoria, nombre: e.target.value })} 
                                    required 
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold small text-muted">URL DE IMAGEN DE HEADER</label>
                                <input 
                                    type="url" 
                                    className="form-control rounded-3 border-secondary" 
                                    placeholder="https://..." 
                                    value={formCategoria.imagen_url} 
                                    onChange={(e) => setFormCategoria({ ...formCategoria, imagen_url: e.target.value })} 
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold small text-muted">DESCRIPCIÓN</label>
                                <textarea 
                                    className="form-control rounded-3 border-secondary" 
                                    rows="3" 
                                    value={formCategoria.descripcion} 
                                    onChange={(e) => setFormCategoria({ ...formCategoria, descripcion: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary rounded-pill px-4" 
                                    onClick={() => setModalCategoria(false)}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn text-white fw-bold rounded-pill px-4" 
                                    style={{ backgroundColor: '#FF8A00' }}
                                >
                                    {modoEdicionCategoria ? 'ACTUALIZAR' : 'GUARDAR'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )}

        {/* MODAL EDITAR ROL DE USUARIO */}
        {modalEditarUsuario && usuarioEdit && (
            <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg" style={{ backgroundColor: '#F0EBE1', borderRadius: '20px' }}>
                        <div className="modal-header border-0 pb-0">
                            <h5 className="modal-title fw-bold" style={{ color: '#3A3935' }}>
                                Modificar Rol de Usuario
                            </h5>
                            <button type="button" className="btn-close" onClick={() => setModalEditarUsuario(false)}></button>
                        </div>
                        <form onSubmit={guardarNuevoRol} className="modal-body p-4">
                            <p className="mb-3 text-muted">
                                Modificando el rol para: <strong>{usuarioEdit.nombre ? `${usuarioEdit.nombre} ${usuarioEdit.apellido || ''}` : usuarioEdit.email}</strong>
                            </p>
                            <div className="mb-3">
                                <label className="form-label fw-bold small text-muted">SELECCIONAR ROL</label>
                                <select 
                                    className="form-select rounded-3 border-secondary"
                                    value={nuevoRolSeleccionado}
                                    onChange={(e) => setNuevoRolSeleccionado(e.target.value)}
                                >
                                    <option value="admin">Administrador</option>
                                    <option value="operador">Operador</option>
                                    <option value="cliente">Cliente</option>
                                </select>
                            </div>
                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary rounded-pill px-4" 
                                    onClick={() => setModalEditarUsuario(false)}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn text-white fw-bold rounded-pill px-4" 
                                    style={{ backgroundColor: '#72C253' }}
                                >
                                    Guardar Rol
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )}

        </div>
    );
};