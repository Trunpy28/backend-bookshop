import express from 'express';
import multer from 'multer';
import VoucherController from '../controllers/VoucherController.js';
import { adminAuthMiddleware, authMiddleware } from '../middleware/AuthMiddleware.js';

const router = express.Router();

// Cấu hình multer để lưu trữ file trong bộ nhớ
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//client
router.get('/active', VoucherController.getActiveVouchers);
router.post('/apply', authMiddleware, VoucherController.applyVoucher);
router.get('/getByCode/:code', VoucherController.getVoucherByCode);
router.get('/get/:id', VoucherController.getVoucherById);

//admin
router.post('/create', authMiddleware, adminAuthMiddleware, upload.single('image'), VoucherController.createVoucher);
router.get('/getAll', authMiddleware, adminAuthMiddleware, VoucherController.getAllVouchers);
router.put('/update/:id', authMiddleware, adminAuthMiddleware, upload.single('image'), VoucherController.updateVoucher);
router.delete('/delete/:id', authMiddleware, adminAuthMiddleware, VoucherController.deleteVoucher);

export default router; 