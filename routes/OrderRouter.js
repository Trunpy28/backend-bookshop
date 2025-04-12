import express from 'express';
import OrderController from '../controllers/OrderController.js';
import { authUserMiddleware, authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', authUserMiddleware, OrderController.createOrder);
router.get('/get-all-orders-details/:id',authUserMiddleware,OrderController.getAllOrdersDetails)
router.get('/get-details-order/:id',OrderController.getDetailsOrder)
router.delete('/cancel-order/:id',OrderController.cancelOrder)
router.get('/get-all',authMiddleware,OrderController.getAllOrder)
router.put('/update-order/:id',authMiddleware, OrderController.updateOrder)
router.delete('/delete-order/:id',authMiddleware, OrderController.deleteOrder)
router.post('/delete-many',authMiddleware,OrderController.deleteMany)

export default router;