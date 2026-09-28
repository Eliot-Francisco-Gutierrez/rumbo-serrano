import { Router } from 'express';
import { 
    registrarUsuario, 
    loginUsuario, 
    obtenerUsuarios, 
    cambiarRol, 
    eliminarUsuario 
} from '../controllers/usuarioController.js';
import { Usuario } from '../models/index.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

// --- RUTAS PÚBLICAS ---
router.post('/registro', registrarUsuario);
router.post('/login', loginUsuario);

// --- RUTAS PROTEGIDAS (Solo Administrador) ---

// GET TODOS LOS USUARIOS
router.get('/', verifyToken, isAdmin, obtenerUsuarios);

// GET POR ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const esPropietario = req.usuario.id === Number(req.params.id);
        if (!esPropietario && req.usuario.rol !== 'admin') {
            return res.status(403).json({ mensaje: 'No tienes permisos para consultar este usuario' });
        }

        const usuario = await Usuario.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });
        if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT (Editar datos generales de un usuario)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const esPropietario = req.usuario.id === Number(req.params.id);
        if (!esPropietario && req.usuario.rol !== 'admin') {
            return res.status(403).json({ mensaje: 'No tienes permisos para editar este usuario' });
        }

        const usuario = await Usuario.findByPk(req.params.id);
        if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

        const camposPermitidos = ['nombre_usuario', 'nombre', 'apellido', 'telefono', 'email'];
        const datosActualizados = Object.fromEntries(
            camposPermitidos
                .filter((campo) => req.body[campo] !== undefined)
                .map((campo) => [campo, req.body[campo]])
        );

        await usuario.update(datosActualizados);
        res.json({ mensaje: 'Usuario actualizado', usuario });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT (Cambiar ROL de usuario - Solo Administrador)
router.put('/:id/rol', verifyToken, isAdmin, cambiarRol);

// DELETE (Eliminar usuario - Solo Administrador)
router.delete('/:id', verifyToken, isAdmin, eliminarUsuario);

export default router;