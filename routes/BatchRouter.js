import express from 'express';
import BatchController from '../controllers/BatchController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route lấy danh sách lô hàng phân trang
router.get('/paginated', BatchController.getBatchesPaginated);

// Route lấy tất cả lô hàng
router.get('/get-all', BatchController.getAllBatches);

// Route lấy chi tiết lô hàng theo ID
router.get('/:id', BatchController.getBatchById);

// Route tạo lô hàng mới (yêu cầu đăng nhập)
router.post('/create', authMiddleware, BatchController.createBatch);

// Route cập nhật lô hàng (yêu cầu đăng nhập)
router.put('/update/:id', authMiddleware, BatchController.updateBatch);

// Route xóa lô hàng (yêu cầu đăng nhập)
router.delete('/delete/:id', authMiddleware, BatchController.deleteBatch);

export default router; 