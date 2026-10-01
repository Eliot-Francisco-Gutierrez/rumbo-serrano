import { Carrito, ItemCarrito, Actividad } from '../models/index.js';

// GET: Obtener el carrito del usuario autenticado (se crea si no existe)
export const obtenerCarrito = async (req, res) => {
    try {
        const [carrito] = await Carrito.findOrCreate({
            where: { usuario_id: req.usuario.id },
            include: [{
                model: ItemCarrito,
                include: [Actividad]
            }]
        });
        res.json(carrito);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST: Agregar actividad al carrito
export const agregarItem = async (req, res) => {
    try {
        const { 
            actividad_id, 
            cantidad, 
            cantidad_adultos, 
            cantidad_menores, 
            fecha_reserva, 
            turno 
        } = req.body;

        const [carrito] = await Carrito.findOrCreate({
            where: { usuario_id: req.usuario.id }
        });

        // Buscamos si ya existe el item exactamente con la misma actividad, fecha y turno
        let item = await ItemCarrito.findOne({
            where: { 
                carrito_id: carrito.id, 
                actividad_id,
                fecha_reserva: fecha_reserva || null,
                turno: turno || null
            }
        });

        const numAdultos = Number(cantidad_adultos) || Number(cantidad) || 1;
        const numMenores = Number(cantidad_menores) || 0;
        const totalCantidad = Number(cantidad) || (numAdultos + numMenores);

        if (item) {
            // Si ya existe, acumulamos las cantidades
            item.cantidad += totalCantidad;
            item.cantidad_adultos = (item.cantidad_adultos || 0) + numAdultos;
            item.cantidad_menores = (item.cantidad_menores || 0) + numMenores;
            await item.save();
        } else {
            // Si es nuevo, lo creamos con todos los detalles
            item = await ItemCarrito.create({
                carrito_id: carrito.id,
                actividad_id,
                cantidad: totalCantidad,
                cantidad_adultos: numAdultos,
                cantidad_menores: numMenores,
                fecha_reserva,
                turno
            });
        }

        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// DELETE: Eliminar un ítem del carrito por su id
export const eliminarItem = async (req, res) => {
    try {
        const eliminados = await ItemCarrito.destroy({
            where: { id: req.params.id }
        });

        if (!eliminados) {
            return res.status(404).json({ mensaje: 'Ítem no encontrado' });
        }

        res.json({ mensaje: 'Ítem eliminado del carrito' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const actualizarCantidad = async (req, res) => {
    try {
        const cantidad = Number(req.body.cantidad);
        if (!Number.isInteger(cantidad) || cantidad < 1) {
            return res.status(400).json({ mensaje: 'La cantidad debe ser un entero mayor a cero' });
        }

        const carrito = await Carrito.findOne({ where: { usuario_id: req.usuario.id } });
        const item = carrito && await ItemCarrito.findOne({
            where: { id: req.params.id, carrito_id: carrito.id },
            include: [Actividad]
        });

        if (!item) {
            return res.status(404).json({ mensaje: 'Ítem no encontrado' });
        }

        await item.update({ cantidad });
        return res.json(item);
    } catch (error) {
        return res.status(500).json({ mensaje: 'No se pudo actualizar la cantidad' });
    }
};