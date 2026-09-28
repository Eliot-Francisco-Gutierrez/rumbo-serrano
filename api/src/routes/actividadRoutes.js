import { Router } from 'express';
import { Op } from 'sequelize';
import { Actividad, Categoria } from '../models/index.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

// --- RUTAS PÚBLICAS (Cliente) ---

// GET TODAS LAS ACTIVIDADES
router.get('/', async (req, res) => {
    try {
        const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 12, 1), 50);
        const offset = (page - 1) * limit;
        const where = {};

        if (req.query.categoria) {
            where.categoria_id = Number(req.query.categoria);
        }

        if (req.query.q?.trim()) {
            const termino = `%${req.query.q.trim()}%`;
            where[Op.or] = [
                { titulo: { [Op.like]: termino } },
                { descripcion: { [Op.like]: termino } },
                { ubicacion: { [Op.like]: termino } }
            ];
        }

        const { rows, count } = await Actividad.findAndCountAll({
            where,
            include: Categoria,
            order: [['createdAt', 'DESC']],
            limit,
            offset,
            distinct: true
        });
        res.json({
            data: rows,
            pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET ACTIVIDAD POR ID
router.get('/:id', async (req, res) => {
    try {
        const actividad = await Actividad.findByPk(req.params.id, {
            include: Categoria
        });
        if (!actividad) return res.status(404).json({ mensaje: 'Actividad no encontrada' });
        res.json(actividad);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- RUTAS PROTEGIDAS (Administrador u Operador) ---

// POST (Crear actividad)
router.post('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const datos = { ...req.body };
        // Si no llega categoria_id o llega vacío, le asignamos 1 por defecto
        if (!datos.categoria_id) {
            datos.categoria_id = 1;
        }
        const nuevaActividad = await Actividad.create(datos);
        res.status(201).json(nuevaActividad);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT (Editar actividad)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const actividad = await Actividad.findByPk(req.params.id);
        if (!actividad) return res.status(404).json({ mensaje: 'Actividad no encontrada' });

        await actividad.update(req.body);
        res.json(actividad);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE (Eliminar actividad)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const eliminados = await Actividad.destroy({
            where: { id: req.params.id }
        });
        if (!eliminados) return res.status(404).json({ mensaje: 'Actividad no encontrada' });

        res.json({ mensaje: 'Actividad eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;