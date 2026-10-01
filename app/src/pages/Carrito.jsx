import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const formatoPrecio = (valor) => Number(valor || 0).toLocaleString('es-AR');

export const Carrito = () => {
    const { items, isLoading, totalPrice, updateQuantity, removeItem } = useCart();

    if (isLoading && items.length === 0) {
        return <div className="container py-5 text-center">Cargando tu carrito...</div>;
    }

    if (items.length === 0) {
        return (
            <section className="container py-5 text-center">
                <h1 className="h2 fw-bold">Tu carrito está vacío</h1>
                <p className="text-secondary">Explorá las actividades disponibles y elegí tu próxima salida.</p>
                <Link to="/actividades" className="btn btn-dark mt-2">Ver actividades</Link>
            </section>
        );
    }

    return (
        <section className="container py-5">
            <h1 className="h2 fw-bold mb-4">Carrito de compras</h1>
            <div className="row g-4">
                <div className="col-lg-8">
                    {items.map((item) => {
                        const actividad = item.Actividad || {};
                        const disponible = Number(actividad.cupo_disponible ?? item.cantidad);
                        return (
                            <article className="d-flex flex-column flex-md-row align-items-md-center gap-3 border-bottom py-3" key={item.id}>
                                <img
                                    src={actividad.imagen || 'https://via.placeholder.com/150'}
                                    alt={actividad.titulo || 'Actividad'}
                                    className="rounded object-fit-cover"
                                    style={{ width: '112px', height: '84px' }}
                                />
                                <div className="flex-grow-1">
                                    <h2 className="h5 fw-bold mb-1">{actividad.titulo}</h2>
                                    <p className="small text-secondary mb-1">
                                        {item.fecha_reserva || 'Fecha a confirmar'}{item.turno ? ` · ${item.turno}` : ''}
                                    </p>
                                    <span className="fw-semibold">${formatoPrecio(actividad.precio)} c/u</span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-sm"
                                        aria-label={`Reducir cantidad de ${actividad.titulo}`}
                                        disabled={item.cantidad <= 1}
                                        onClick={() => updateQuantity(item.id, Number(item.cantidad) - 1).catch(() => {})}
                                    >−</button>
                                    <span className="text-center" style={{ minWidth: '2rem' }}>{item.cantidad}</span>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-sm"
                                        aria-label={`Aumentar cantidad de ${actividad.titulo}`}
                                        disabled={item.cantidad >= disponible}
                                        onClick={() => updateQuantity(item.id, Number(item.cantidad) + 1).catch(() => {})}
                                    >+</button>
                                </div>
                                <strong className="text-md-end" style={{ minWidth: '112px' }}>
                                    ${formatoPrecio(Number(actividad.precio) * Number(item.cantidad))}
                                </strong>
                                <button
                                    type="button"
                                    className="btn btn-link text-danger text-decoration-none p-0"
                                    onClick={() => removeItem(item.id).catch(() => {})}
                                >
                                    Quitar
                                </button>
                            </article>
                        );
                    })}
                </div>
                <aside className="col-lg-4">
                    <div className="border rounded p-4">
                        <h2 className="h5 fw-bold mb-3">Resumen</h2>
                        <div className="d-flex justify-content-between border-bottom pb-3 mb-3">
                            <span>Subtotal ({items.reduce((sum, item) => sum + Number(item.cantidad), 0)} personas)</span>
                            <strong>${formatoPrecio(totalPrice)}</strong>
                        </div>
                        <div className="d-flex justify-content-between fs-5 fw-bold mb-4">
                            <span>Total</span><span>${formatoPrecio(totalPrice)} ARS</span>
                        </div>
                        <Link to="/checkout" className="btn btn-dark w-100">Continuar al checkout</Link>
                    </div>
                </aside>
            </div>
        </section>
    );
};