import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const formatoPrecio = (valor) => Number(valor || 0).toLocaleString('es-AR');

export const Checkout = () => {
    const navigate = useNavigate();
    const { items, isLoading, totalPrice, clearCart } = useCart();
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const [telefono, setTelefono] = useState(usuario.telefono || '');
    const [email, setEmail] = useState(usuario.email || '');
    const [procesando, setProcesando] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [order, setOrder] = useState(null);

    useEffect(() => {
        if (!isLoading && items.length === 0 && !order) {
            navigate('/carrito', { replace: true });
        }
    }, [isLoading, items.length, navigate, order]);

    const confirmarCompra = async (event) => {
        event.preventDefault();
        setProcesando(true);
        setMensaje('');
        try {
            const response = await api.post('/orders', { telefono, email });
            setOrder(response.data.order);
            clearCart();
        } catch (error) {
            setMensaje(error.response?.data?.mensaje || 'No se pudo procesar la orden. Intentá nuevamente.');
        } finally {
            setProcesando(false);
        }
    };

    if (isLoading && items.length === 0 && !order) {
        return <div className="container py-5 text-center">Cargando checkout...</div>;
    }

    if (order) {
        return (
            <section className="container py-5">
                <div className="mx-auto text-center" style={{ maxWidth: '620px' }}>
                    <div className="display-4 text-success mb-3" aria-hidden="true">✓</div>
                    <h1 className="h2 fw-bold">Compra confirmada</h1>
                    <p className="text-secondary">Tu pedido #{order.id} quedó registrado con el email de contacto {order.email}.</p>
                    <p className="fs-5 fw-semibold">Total: ${formatoPrecio(order.total)} ARS</p>
                    <div className="d-flex justify-content-center gap-3 mt-4">
                        <Link className="btn btn-dark" to="/pedidos">Ver mis pedidos</Link>
                        <Link className="btn btn-outline-dark" to="/actividades">Seguir explorando</Link>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="container py-5">
            <h1 className="h2 fw-bold mb-4">Checkout</h1>
            <div className="row g-5">
                <form className="col-lg-7" onSubmit={confirmarCompra}>
                    <h2 className="h5 fw-bold mb-3">Datos de contacto</h2>
                    <label className="form-label" htmlFor="checkout-email">Email de confirmación</label>
                    <input id="checkout-email" className="form-control mb-3" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
                    <label className="form-label" htmlFor="checkout-telefono">Teléfono</label>
                    <input id="checkout-telefono" className="form-control mb-4" type="tel" required value={telefono} onChange={(event) => setTelefono(event.target.value)} />
                    {mensaje && <div className="alert alert-danger" role="alert">{mensaje}</div>}
                    <button className="btn btn-dark btn-lg" type="submit" disabled={procesando || items.length === 0}>
                        {procesando ? 'Procesando...' : 'Confirmar compra'}
                    </button>
                </form>
                <aside className="col-lg-5">
                    <h2 className="h5 fw-bold mb-3">Tu pedido</h2>
                    {items.map((item) => (
                        <div className="d-flex justify-content-between gap-3 border-bottom py-3" key={item.id}>
                            <span>{item.Actividad?.titulo} × {item.cantidad}</span>
                            <strong>${formatoPrecio(Number(item.Actividad?.precio || 0) * item.cantidad)}</strong>
                        </div>
                    ))}
                    <div className="d-flex justify-content-between fs-5 fw-bold pt-3">
                        <span>Total</span><span>${formatoPrecio(totalPrice)} ARS</span>
                    </div>
                </aside>
            </div>
        </section>
    );
};