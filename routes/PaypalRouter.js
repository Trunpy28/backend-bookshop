import express from 'express';
import paypalController from '../controllers/PaypalController.js';
import { authUserMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route tạo order
router.post("/create-order/:id", authUserMiddleware, paypalController.createOrder);

// Route xác nhận order
router.post("/capture-order/user/:id/order/:orderId", authUserMiddleware, paypalController.captureOrder);

export default router;