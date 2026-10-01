import { useEffect, useState } from 'react';
import api from '../services/api';

const formatoPrecio = (valor) => Number(valor || 0).toLocaleString('es-AR');

export const Pedidos = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/orders/my-orders')
            .then((response) => setOrders(response.data))
            .catch(() => setError('No se pudo cargar tu historial de pedidos.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="container py-5 text-center">Cargando pedidos...</div>;

    return (
        <section className="container py-5">
            <h1 className="h2 fw-bold mb-4">Mis pedidos</h1>
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            {!error && orders.length === 0 && <p className="text-secondary">Todavía no tenés pedidos.</p>}
            <div className="d-grid gap-3">
                {orders.map((order) => (
                    <article className="border rounded p-3 p-md-4" key={order.id}>
                        <header className="d-flex flex-wrap justify-content-between gap-2 border-bottom pb-3 mb-2">
                            <div><span className="text-secondary">Pedido</span><h2 className="h5 fw-bold mb-0">#{order.id}</h2></div>
                            <div className="text-md-end"><span className="badge text-bg-success">{order.estado}</span><div className="small text-secondary mt-1">{new Date(order.createdAt).toLocaleDateString('es-AR')}</div></div>
                        </header>
                        {(order.OrderItems || []).map((item) => (
                            <div className="d-flex justify-content-between gap-3 py-2" key={item.id}>
                                <span>{item.Actividad?.titulo || 'Actividad'} × {item.cantidad}</span>
                                <span>${formatoPrecio(Number(item.precio_unitario) * item.cantidad)}</span>
                            </div>
                        ))}
                        <div className="d-flex justify-content-between border-top pt-3 mt-2 fw-bold">
                            <span>Total</span><span>${formatoPrecio(order.total)} ARS</span>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
};