import express from 'express';
import OrderController from '../controllers/OrderController.js';
import { adminAuthMiddleware, authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', authMiddleware, OrderController.createOrder);
router.get('/my-orders', authMiddleware, OrderController.getMyOrders)
router.get('/get-orders', authMiddleware, adminAuthMiddleware, OrderController.getPaginatedOrders)
router.get('/get-details-order/:id',authMiddleware, OrderController.getDetailsOrder)
router.patch('/cancel-order/:id', authMiddleware, OrderController.cancelOrder)
router.delete('/delete-order/:id',authMiddleware, OrderController.deleteOrder)
router.patch('/update-status/:id', authMiddleware, adminAuthMiddleware, OrderController.updateOrderStatus); 

export default router;