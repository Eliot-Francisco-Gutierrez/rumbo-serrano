import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export const Home = () => {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const esAdmin = usuario.rol === 'admin';
    const [categorias, setCategorias] = useState([]);
    const [actividades, setActividades] = useState([]);
    const [slideActivo, setSlideActivo] = useState(0);
    const navigate = useNavigate();

    // Datos de los Banners / Carrusel
    const banners = [
        {
            id: 1,
            badge: "Promoción de temporada",
            titulo: "Experiencias guiadas en las sierras",
            descripcion: "Reservá hoy con cancelación flexible y asegurá tu cupo para los circuitos más destacados del valle.",
            botonTexto: "Explorar actividades",
            imagen: "https://upload.wikimedia.org/wikipedia/commons/8/89/Sierras_de_la_Provincia_de_C%C3%B3rdoba_%28Argentina%29_2008-09-20.jpg?utm_source=es.wikipedia.org&utm_campaign=index&utm_content=original"
        },
        {
            id: 2,
            badge: "Especial Gastronomía",
            titulo: "Rutas del vino y sabores locales",
            descripcion: "Degustaciones exclusivas, visitas a bodegas y experiencias gourmet en entornos naturales únicos.",
            botonTexto: "Ver bodegas y tours",
            imagen: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1600&q=80"
        },
        {
            id: 3,
            badge: "Aventura en grupo",
            titulo: "Tours acuáticos y de montaña",
            descripcion: "Descuentos especiales para familias y grupos en paseos náuticos, trekking y deportes al aire libre.",
            botonTexto: "Consultar opciones",
            imagen: "https://barilochetours.com.ar/wp-content/uploads/2024/08/Paseo-en-velero-Nahuel-Huapi-_-Velero-_-Lauke-Tours-_.jpg"
        }
    ];

    // Cargar Datos de API
    useEffect(() => {
        Promise.all([
            api.get('/categorias'),
            api.get('/actividades', { params: { limit: 4 } })
        ])
        .then(([resCat, resAct]) => {
            setCategorias(resCat.data);
            setActividades(resAct.data.data || resAct.data);
        })
        .catch(err => console.error('Error al cargar datos en Home:', err));
    }, []);

    // Temporizador para cambio automático de slides cada 5 segundos
    useEffect(() => {
        const intervalo = setInterval(() => {
            setSlideActivo((prevIndex) => (prevIndex + 1) % banners.length);
        }, 5000);

        return () => clearInterval(intervalo);
    }, [banners.length]);

    // Funciones de navegación manual del carrusel
    const siguienteSlide = () => {
        setSlideActivo((prevIndex) => (prevIndex + 1) % banners.length);
    };

    const anteriorSlide = () => {
        setSlideActivo((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
    };

    const actividadesDestacadas = actividades.slice(0, 4);

    return (
        <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', color: '#222222', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

            {/* Saludo / Header de Sesión */}
            <div className="container pt-4 pb-2">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-3">
                    <div>
                        <h5 className="fw-bold m-0" style={{ color: '#222222' }}>
                            Hola, {usuario.nombre_usuario || 'Viajero'}
                        </h5>
                        <p className="text-muted small m-0">Explorá las mejores aventuras y recorridos en Calamuchita</p>
                    </div>
                    {esAdmin && (
                        <Link 
                            to="/admin" 
                            className="btn btn-outline-dark btn-sm fw-semibold px-3 py-2"
                            style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                        >
                            Panel de Administración
                        </Link>
                    )}
                </div>
            </div>

            {/* Banner Carrusel Funcional Controlado por React */}
            <div className="container my-4">
                <div className="position-relative rounded-4 overflow-hidden shadow-sm" style={{ minHeight: '380px', backgroundColor: '#111' }}>
                    
                    {/* Renderizado del Slide Activo */}
                    <div 
                        className="p-4 p-md-5 d-flex align-items-center w-100 h-100"
                        style={{
                            backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.65)), url("${banners[slideActivo].imagen}")`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            minHeight: '380px',
                            transition: 'background-image 0.5s ease-in-out'
                        }}
                    >
                        <div className="text-white" style={{ maxWidth: '580px', zIndex: 2 }}>
                            <span className="badge bg-white text-dark rounded-pill px-3 py-2 fw-semibold mb-3" style={{ fontSize: '0.75rem' }}>
                                {banners[slideActivo].badge}
                            </span>
                            <h1 className="fw-bold mb-2 display-6">{banners[slideActivo].titulo}</h1>
                            <p className="fs-6 opacity-90 mb-4 fw-normal">
                                {banners[slideActivo].descripcion}
                            </p>
                            <button 
                                onClick={() => navigate('/actividades')} 
                                className="btn btn-light rounded-3 fw-bold px-4 py-2"
                                style={{ fontSize: '0.9rem' }}
                            >
                                {banners[slideActivo].botonTexto}
                            </button>
                        </div>
                    </div>

                    {/* Indicadores / Puntitos abajo */}
                    <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 d-flex gap-2" style={{ zIndex: 3 }}>
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setSlideActivo(index)}
                                className={`border-0 rounded-pill ${slideActivo === index ? 'bg-white w-4' : 'bg-white opacity-50'}`}
                                style={{ 
                                    width: slideActivo === index ? '28px' : '10px', 
                                    height: '8px', 
                                    transition: 'all 0.3s ease' 
                                }}
                                aria-label={`Slide ${index + 1}`}
                            />
                        ))}
                    </div>

                    {/* Flecha Anterior */}
                    <button 
                        onClick={anteriorSlide}
                        className="btn btn-link text-white position-absolute top-50 start-0 translate-middle-y ms-2 p-2 border-0 text-decoration-none opacity-75 hover-opacity-100"
                        style={{ zIndex: 3 }}
                        aria-label="Anterior"
                    >
                        <span className="fs-2 fw-bold">‹</span>
                    </button>

                    {/* Flecha Siguiente */}
                    <button 
                        onClick={siguienteSlide}
                        className="btn btn-link text-white position-absolute top-50 end-0 translate-middle-y me-2 p-2 border-0 text-decoration-none opacity-75 hover-opacity-100"
                        style={{ zIndex: 3 }}
                        aria-label="Siguiente"
                    >
                        <span className="fs-2 fw-bold">›</span>
                    </button>
                </div>
            </div>

            {/* Sección de Confianza / Prestaciones Minimalistas */}
            <div className="container py-5">
                <div className="row g-4">
                    <div className="col-12 col-md-4">
                        <div className="mb-2">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#222222" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                        </div>
                        <h6 className="fw-bold mb-2 text-dark fs-5">Reservá con total confianza</h6>
                        <p className="text-muted small m-0" style={{ lineHeight: '1.6' }}>
                            Atención al cliente personalizada antes, durante y después de tu salida. Consultá las reseñas reales de nuestra comunidad.
                        </p>
                    </div>

                    <div className="col-12 col-md-4">
                        <div className="mb-2">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#222222" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                        </div>
                        <h6 className="fw-bold mb-2 text-dark fs-5">Guías y prestadores verificados</h6>
                        <p className="text-muted small m-0" style={{ lineHeight: '1.6' }}>
                            Elegí actividades auditadas con equipos homologados, seguro de excursión y profesionales locales experimentados.
                        </p>
                    </div>

                    <div className="col-12 col-md-4">
                        <div className="mb-2">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#222222" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                        </div>
                        <h6 className="fw-bold mb-2 text-dark fs-5">Apostá por la flexibilidad</h6>
                        <p className="text-muted small m-0" style={{ lineHeight: '1.6' }}>
                            Reprogramaciones ágiles y opciones con cancelación gratuita para que planifiques tu viaje sin preocupaciones.
                        </p>
                    </div>
                </div>
            </div>

            {/* Grilla de Actividades Destacadas */}
            <div className="container py-4">
                <div className="mb-4">
                    <h3 className="fw-bold text-dark mb-1 fs-3">Experiencias destacadas con todo lo que buscás</h3>
                    <p className="text-muted small m-0">Descubrí recorridos con guías, traslados, degustaciones y mucho más.</p>
                </div>

                <div className="row g-4">
                    {actividadesDestacadas.length === 0 ? (
                        <div className="col-12 text-center text-muted py-5">
                            <p>Cargando experiencias...</p>
                        </div>
                    ) : (
                        actividadesDestacadas.map((act) => {
                            const imagenUrl = act.imagen_url || act.imagen || 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=600&q=80';

                            return (
                                <div key={act.id} className="col-12 col-sm-6 col-lg-3">
                                    <div 
                                        className="h-100 d-flex flex-column text-decoration-none"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => navigate(`/actividades/${act.id}`)}
                                    >
                                        <div 
                                            className="position-relative overflow-hidden mb-3"
                                            style={{ borderRadius: '16px', height: '240px', backgroundColor: '#F1F5F9' }}
                                        >
                                            <img 
                                                src={imagenUrl} 
                                                alt={act.titulo} 
                                                className="w-100 h-100"
                                                style={{ objectFit: 'cover' }}
                                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=600&q=80'; }}
                                            />
                                            <span 
                                                className="position-absolute top-0 start-0 m-3 bg-white text-dark fw-semibold px-3 py-1 shadow-sm"
                                                style={{ borderRadius: '20px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.08)' }}
                                            >
                                                Recomendado
                                            </span>
                                        </div>

                                        <div className="d-flex justify-content-between align-items-start mb-1">
                                            <h6 className="fw-bold text-dark text-truncate mb-0" style={{ fontSize: '0.95rem' }}>
                                                {act.titulo}
                                            </h6>
                                            <div className="d-flex align-items-center gap-1 ms-2" style={{ fontSize: '0.85rem' }}>
                                                <span>★</span>
                                                <span className="fw-semibold">4.95</span>
                                            </div>
                                        </div>

                                        <p className="text-muted small mb-1 text-truncate" style={{ fontSize: '0.85rem' }}>
                                            {act.ubicacion || 'Calamuchita, Córdoba'}
                                        </p>

                                        <p className="text-muted small mb-1" style={{ fontSize: '0.825rem' }}>
                                            {act.duracion ? `Duración: ${act.duracion}` : 'Salidas programadas'}
                                        </p>

                                        <p className="text-muted small mb-2" style={{ fontSize: '0.825rem' }}>
                                            Cupos disponibles: {act.cupo_disponible || 'Consultar'}
                                        </p>

                                        <div className="mt-auto pt-1">
                                            <span className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
                                                ${Number(act.precio || 0).toLocaleString()} ARS
                                            </span>
                                            <span className="text-muted small"> / persona</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="mt-4 pt-2">
                    <button 
                        onClick={() => navigate('/actividades')} 
                        className="btn btn-outline-dark fw-bold px-4 py-2"
                        style={{ borderRadius: '10px', fontSize: '0.9rem' }}
                    >
                        Descubrí más
                    </button>
                </div>
            </div>

            {/* Categorías Principales */}
            <div className="container py-5 my-3 border-top">
                <div className="mb-4">
                    <h4 className="fw-bold text-dark mb-1">Explorá por categorías</h4>
                    <p className="text-muted small m-0">Encontrá actividades según tus preferencias de viaje.</p>
                </div>

                <div className="d-flex flex-column gap-4">
                    {categorias.length === 0 ? (
                        <div className="text-center text-muted py-4">
                            <p>Cargando categorías...</p>
                        </div>
                    ) : (
                        categorias.map((cat) => {
                            const listaActividades = (cat.Actividads || cat.actividades || []).length > 0 
                                ? (cat.Actividads || cat.actividades)
                                : actividades.filter(act => String(act.categoria_id) === String(cat.id));

                            const urlImagen = cat.imagen_url || cat.imagen || 'https://upload.wikimedia.org/wikipedia/commons/8/89/Sierras_de_la_Provincia_de_C%C3%B3rdoba_%28Argentina%29_2008-09-20.jpg?utm_source=es.wikipedia.org&utm_campaign=index&utm_content=original';

                            return (
                                <div 
                                    key={cat.id} 
                                    className="w-100 rounded-4 overflow-hidden shadow-sm text-white position-relative"
                                    style={{
                                        minHeight: '260px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        backgroundColor: '#1a1a1a'
                                    }}
                                >
                                    <img 
                                        src={urlImagen} 
                                        alt={cat.nombre}
                                        className="position-absolute top-0 start-0 w-100 h-100"
                                        style={{ objectFit: 'cover', zIndex: 1 }}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=1200&q=80';
                                        }}
                                    />

                                    <div 
                                        className="position-absolute top-0 start-0 w-100 h-100"
                                        style={{ 
                                            background: 'linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.3) 100%)', 
                                            zIndex: 2 
                                        }}
                                    />

                                    <div 
                                        className="p-4 p-md-5 w-100 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 position-relative"
                                        style={{ zIndex: 3 }}
                                    >
                                        <div style={{ maxWidth: '650px' }}>
                                            <span className="badge bg-white text-dark rounded-pill px-3 py-1 fw-bold mb-2" style={{ fontSize: '0.75rem' }}>
                                                Categoría
                                            </span>
                                            <h3 className="fw-bold mb-2 text-white display-6">
                                                {cat.nombre}
                                            </h3>

                                            <div className="mt-3">
                                                <ul className="list-unstyled d-flex flex-wrap gap-2 gap-md-3 mb-0" style={{ fontSize: '0.875rem' }}>
                                                    {listaActividades.length > 0 ? (
                                                        listaActividades.slice(0, 4).map((act) => (
                                                            <li key={act.id} className="bg-dark bg-opacity-60 px-3 py-1 rounded-pill text-white border border-secondary border-opacity-50">
                                                                • <span className="text-white">{act.titulo}</span>
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <li className="fst-italic text-white-50">Sin actividades programadas actualmente.</li>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => navigate(`/actividades?categoria=${cat.id}`)}
                                            className="btn btn-light fw-bold px-4 py-2.5 text-nowrap mt-2 mt-md-0 shadow-sm"
                                            style={{ borderRadius: '10px', fontSize: '0.9rem' }}
                                        >
                                            Ver catálogo →
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

        </div>
    );
};