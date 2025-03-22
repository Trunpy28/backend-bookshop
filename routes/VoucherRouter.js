import express from 'express';
import VoucherController from '../controllers/VoucherController.js';
import { adminAuthMiddleware, authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route cho người dùng
router.post('/apply', authMiddleware, VoucherController.applyVoucher);

// Route cho admin
router.post('/create', authMiddleware, adminAuthMiddleware, VoucherController.createVoucher);
router.get('/getAll', authMiddleware, adminAuthMiddleware, VoucherController.getAllVouchers);
router.get('/get/:id', authMiddleware, adminAuthMiddleware, VoucherController.getVoucherById);
router.put('/update/:id', authMiddleware, adminAuthMiddleware, VoucherController.updateVoucher);
router.delete('/delete/:id', authMiddleware, adminAuthMiddleware, VoucherController.deleteVoucher);

export default router; 