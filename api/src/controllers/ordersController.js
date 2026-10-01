import { Actividad, Carrito, ItemCarrito, Order, OrderItem, sequelize } from '../models/index.js';

export const crearOrder = async (req, res) => {
    try {
        const { telefono, email } = req.body;
        if (!telefono || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ mensaje: 'Ingresá un teléfono y un email válidos' });
        }

        const order = await sequelize.transaction(async (transaction) => {
            const carrito = await Carrito.findOne({
                where: { usuario_id: req.usuario.id },
                include: [{ model: ItemCarrito }],
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (!carrito || !carrito.ItemCarritos?.length) {
                const error = new Error('El carrito está vacío');
                error.status = 400;
                throw error;
            }

            const lineas = [];
            const cantidadesPorActividad = new Map();
            let totalCentavos = 0;

            for (const item of carrito.ItemCarritos) {
                const cantidad = Number(item.cantidad);
                const actividad = await Actividad.findByPk(item.actividad_id, {
                    transaction,
                    lock: transaction.LOCK.UPDATE
                });

                if (!actividad) {
                    const error = new Error(`La actividad ${item.actividad_id} ya no está disponible`);
                    error.status = 409;
                    throw error;
                }

                if (!Number.isInteger(cantidad) || cantidad < 1) {
                    const error = new Error('El carrito contiene una cantidad inválida');
                    error.status = 400;
                    throw error;
                }

                const precioUnitario = Number(actividad.precio);
                totalCentavos += Math.round(precioUnitario * 100) * cantidad;
                cantidadesPorActividad.set(
                    actividad.id,
                    (cantidadesPorActividad.get(actividad.id) || 0) + cantidad
                );
                lineas.push({ item, actividad, cantidad, precioUnitario });
            }

            for (const [actividadId, cantidad] of cantidadesPorActividad) {
                const actividad = lineas.find((linea) => linea.actividad.id === actividadId).actividad;
                if (actividad.cupo_disponible < cantidad) {
                    const error = new Error(`Cupo insuficiente para ${actividad.titulo}. Disponible: ${actividad.cupo_disponible}`);
                    error.status = 409;
                    throw error;
                }
            }

            const nuevaOrder = await Order.create({
                usuario_id: req.usuario.id,
                telefono,
                email,
                total: (totalCentavos / 100).toFixed(2),
                estado: 'confirmada'
            }, { transaction });

            await OrderItem.bulkCreate(lineas.map(({ item, actividad, cantidad, precioUnitario }) => ({
                order_id: nuevaOrder.id,
                actividad_id: actividad.id,
                precio_unitario: precioUnitario.toFixed(2),
                cantidad,
                fecha_reserva: item.fecha_reserva,
                turno: item.turno
            })), { transaction });

            for (const [actividadId, cantidad] of cantidadesPorActividad) {
                const actividad = lineas.find((linea) => linea.actividad.id === actividadId).actividad;
                actividad.cupo_disponible -= cantidad;
                await actividad.save({ transaction });
            }

            await ItemCarrito.destroy({ where: { carrito_id: carrito.id }, transaction });

            return Order.findByPk(nuevaOrder.id, {
                include: [{ model: OrderItem, include: [Actividad] }],
                transaction
            });
        });

        return res.status(201).json({ mensaje: 'Orden creada con éxito', order });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ mensaje: error.message });
        }

        console.error('Error al crear la orden:', error);
        return res.status(500).json({ mensaje: 'No se pudo procesar la orden' });
    }
};

export const obtenerMisOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { usuario_id: req.usuario.id },
            include: [{ model: OrderItem, include: [Actividad] }],
            order: [['createdAt', 'DESC']]
        });

        return res.json(orders);
    } catch (error) {
        console.error('Error al obtener las órdenes:', error);
        return res.status(500).json({ mensaje: 'No se pudo recuperar el historial de órdenes' });
    }
};