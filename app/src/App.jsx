import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Login } from './pages/Login';
import { Registro } from './pages/Registro';
import { Home } from './pages/Home';
import { AdminDashboard } from './pages/AdminDashboard';
import { RutaProtegida } from './components/RutaProtegida';
import { Actividades } from './pages/Actividades';
import { ActividadDetalle } from './pages/ActividadDetalle.jsx';
import { Carrito } from './pages/Carrito';
import Reservas from './pages/Reservas';
import { CartProvider } from './context/CartContext';
import { Checkout } from './pages/Checkout';
import { Pedidos } from './pages/Pedidos';

export default function App() {
    return (
        <BrowserRouter>
        <CartProvider>
        <div className="d-flex flex-column min-vh-100">
            <Navbar />
            <main className="flex-grow-1">
            <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/actividades" element={<Actividades />} />
                <Route path="/actividades/:id" element={<ActividadDetalle />} />
                <Route path="/Reservas" element={<Reservas />} />
                <Route path="/carrito" element={<RutaProtegida><Carrito /></RutaProtegida>} />
                <Route path="/checkout" element={<RutaProtegida><Checkout /></RutaProtegida>} />
                <Route path="/pedidos" element={<RutaProtegida><Pedidos /></RutaProtegida>} />

                {/* Permitimos el ingreso tanto a 'admin' como a 'operador' */}
                <Route
                path="/admin"
                element={
                        <RutaProtegida requiereAdmin>
                        <AdminDashboard />
                    </RutaProtegida>
                }
                />
            </Routes>
            </main>
            <Footer />
        </div>
        </CartProvider>
        </BrowserRouter>
    );
}