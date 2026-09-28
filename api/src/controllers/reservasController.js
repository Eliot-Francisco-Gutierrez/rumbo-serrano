import { Reserva, DetalleReserva, Carrito, ItemCarrito, Actividad } from '../models/index.js';
import { enviarEmailConfirmacion } from '../services/emailService.js';

// 1. CHECKOUT (Carrito a Reserva)
export const checkout = async (req, res) => {
    try {
        const { telefono, email } = req.body;

        if (!telefono || !email) {
            return res.status(400).json({ mensaje: 'El teléfono y el email son obligatorios para completar la reserva.' });
        }

        const carrito = await Carrito.findOne({
            where: { usuario_id: req.usuario.id },
            include: [{ model: ItemCarrito, include: [Actividad] }]
        });

        if (!carrito || !carrito.ItemCarritos || carrito.ItemCarritos.length === 0) {
            return res.status(400).json({ mensaje: 'El carrito está vacío' });
        }

        let total = 0;
        carrito.ItemCarritos.forEach(item => {
            total += Number(item.Actividad.precio) * item.cantidad;
        });

        const nuevaReserva = await Reserva.create({
            usuario_id: req.usuario.id,
            telefono,
            email,
            total,
            estado: 'confirmada'
        });

        const detalles = carrito.ItemCarritos.map(item => ({
            reserva_id: nuevaReserva.id,
            actividad_id: item.actividad_id,
            precio_unitario: item.Actividad.precio,
            cantidad: item.cantidad,
            cantidad_adultos: item.cantidad_adultos,
            cantidad_menores: item.cantidad_menores,
            fecha_reserva: item.fecha_reserva,
            turno: item.turno
        }));

        await DetalleReserva.bulkCreate(detalles);

        await ItemCarrito.destroy({ where: { carrito_id: carrito.id } });

        try {
            const primerItem = carrito.ItemCarritos[0];
            const cantidadTotalAdultos = carrito.ItemCarritos.reduce((acc, item) => acc + (item.cantidad_adultos || item.cantidad), 0);
            const cantidadTotalMenores = carrito.ItemCarritos.reduce((acc, item) => acc + (item.cantidad_menores || 0), 0);

            await enviarEmailConfirmacion(email, {
                id: nuevaReserva.id,
                total,
                telefono,
                fecha: new Date().toLocaleDateString('es-AR'),
                cantidad_adultos: cantidadTotalAdultos,
                cantidad_menores: cantidadTotalMenores,
                actividad_nombre: carrito.ItemCarritos.length > 1 
                    ? `${primerItem.Actividad.titulo} y otros ítems` 
                    : primerItem.Actividad.titulo
            });
        } catch (emailError) {
            console.error('Error al enviar el email de confirmación:', emailError);
        }

        res.status(201).json({
            mensaje: 'Reserva generada con éxito y confirmación enviada por email',
            reservaId: nuevaReserva.id,
            total
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. OBTENER MIS RESERVAS
export const obtenerMisReservas = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;

        const reservas = await Reserva.findAll({
            where: { usuario_id },
            include: [{
                model: DetalleReserva,
                include: [{ model: Actividad }]
            }],
            order: [['createdAt', 'DESC']]
        });

        return res.json(reservas);
    } catch (error) {
        console.error("Error al obtener mis reservas:", error);
        return res.status(500).json({ mensaje: 'Error al recuperar tus reservas.' });
    }
};

// 3. EDITAR RESERVA
export const editarReserva = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario_id = req.usuario.id;
        const { fecha_reserva, turno, cantidad_adultos, cantidad_menores } = req.body;

        const reserva = await Reserva.findOne({ where: { id, usuario_id } });
        if (!reserva) {
            return res.status(404).json({ mensaje: 'Reserva no encontrada.' });
        }

        await DetalleReserva.update(
            {
                fecha_reserva,
                turno,
                cantidad_adultos: Number(cantidad_adultos),
                cantidad_menores: Number(cantidad_menores)
            },
            { where: { reserva_id: id } }
        );

        return res.json({ mensaje: 'Reserva actualizada correctamente.' });
    } catch (error) {
        console.error("Error al editar reserva:", error);
        return res.status(500).json({ mensaje: 'Error al actualizar la reserva.' });
    }
};

// 4. CANCELAR RESERVA
export const cancelarReserva = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario_id = req.usuario.id;

        const reserva = await Reserva.findOne({ where: { id, usuario_id } });
        if (!reserva) {
            return res.status(404).json({ mensaje: 'Reserva no encontrada.' });
        }

        await DetalleReserva.destroy({ where: { reserva_id: id } });
        await Reserva.destroy({ where: { id } });

        return res.json({ mensaje: 'Reserva cancelada con éxito.' });
    } catch (error) {
        console.error("Error al cancelar reserva:", error);
        return res.status(500).json({ mensaje: 'Error al cancelar la reserva.' });
    }
};