    import { Router } from 'express';
    import { Categoria, Actividad } from '../models/index.js';
    import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

    const router = Router();

    // --- RUTAS PÚBLICAS (Cliente) ---

    // GET TODAS LAS CATEGORÍAS
    router.get('/', async (req, res) => {
    try {
        const categorias = await Categoria.findAll();
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    });

    // GET CATEGORÍA POR ID (con sus actividades)
    router.get('/:id', async (req, res) => {
    try {
        const categoria = await Categoria.findByPk(req.params.id, {
        include: Actividad
        });
        if (!categoria) return res.status(404).json({ mensaje: 'Categoría no encontrada' });
        res.json(categoria);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    });

    // --- RUTAS PROTEGIDAS (Solo Administrador) ---

    // POST (Crear categoría)
    router.post('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const nuevaCategoria = await Categoria.create(req.body);
        res.status(201).json(nuevaCategoria);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
    });

    // PUT (Editar categoría)
    router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const categoria = await Categoria.findByPk(req.params.id);
        if (!categoria) return res.status(404).json({ mensaje: 'Categoría no encontrada' });

        await categoria.update(req.body);
        res.json(categoria);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
    });

    // DELETE (Eliminar categoría)
    router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const eliminados = await Categoria.destroy({
        where: { id: req.params.id }
        });
        if (!eliminados) return res.status(404).json({ mensaje: 'Categoría no encontrada' });

        res.json({ mensaje: 'Categoría eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    });

    export default router;