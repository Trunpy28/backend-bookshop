import express from 'express';
import VoucherController from '../controllers/VoucherController.js';
import { adminAuthMiddleware, authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route cho người dùng không cần đăng nhập
router.get('/active', VoucherController.getActiveVouchers);

// Route cho người dùng đã đăng nhập
router.post('/apply', authMiddleware, VoucherController.applyVoucher);

// Route cho admin
router.post('/create', authMiddleware, adminAuthMiddleware, VoucherController.createVoucher);
router.get('/getAll', authMiddleware, adminAuthMiddleware, VoucherController.getAllVouchers);
router.get('/get/:id', VoucherController.getVoucherById);
router.put('/update/:id', authMiddleware, adminAuthMiddleware, VoucherController.updateVoucher);
router.delete('/delete/:id', authMiddleware, adminAuthMiddleware, VoucherController.deleteVoucher);

export default router; 