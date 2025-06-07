import express from 'express';
import VNPayController from '../controllers/VNPayController.js';
import { authMiddleware } from '../middleware/AuthMiddleware.js';

const router = express.Router();

// Tạo URL thanh toán VNPay
router.post('/create', authMiddleware, VNPayController.createPayment);

// Xử lý callback từ VNPay
router.get('/callback', VNPayController.handleCallback);

// Xử lý IPN từ VNPay (Giữa VNPAY server và backend server)
router.post('/ipn', VNPayController.handleIPN);

export default router; 

/*
Luồng hoạt động:
1. Người dùng chọn thanh toán bằng VNPay trên frontend
2. Frontend gọi API '/api/vnpay/create' với orderId
3. Backend kiểm tra đơn hàng và tạo payment record với số tiền từ database
4. Backend trả về URL thanh toán VNPay
5. Frontend chuyển hướng người dùng đến URL thanh toán
6. Người dùng hoàn tất thanh toán trên VNPay
7. VNPay gọi callback đến '/api/vnpay/callback' và IPN đến '/api/vnpay/ipn' song song
8. Backend xác thực thông tin, kiểm tra số tiền, và cập nhật trạng thái thanh toán
9. Backend chuyển hướng người dùng về trang tạo đơn hàng thành công tương ứng
*/
