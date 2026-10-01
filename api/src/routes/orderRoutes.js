import { Router } from 'express';
import { crearOrder, obtenerMisOrders } from '../controllers/ordersController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/', verificarToken, crearOrder);
router.get('/my-orders', verificarToken, obtenerMisOrders);
router.get('/my', verificarToken, obtenerMisOrders);

export default router;