import express from 'express';
import paypalController from '../controllers/PaypalController.js';
import { authMiddleware, authUserMiddleware } from '../middleware/AuthMiddleware.js';

const router = express.Router();

// Route tạo thanh toán trên hệ thống Paypal
router.post("/create-payment", authMiddleware, paypalController.createPayment);

// Route xác nhận đã thanh toán trên hệ thống Paypal
router.post("/capture-order/user/:userId/order/:orderId", authUserMiddleware, paypalController.captureOrder);

export default router;