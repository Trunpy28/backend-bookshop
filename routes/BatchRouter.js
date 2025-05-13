import express from 'express';
import BatchController from '../controllers/BatchController.js';
import { adminAuthMiddleware, authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/paginated', authMiddleware, adminAuthMiddleware, BatchController.getBatchesPaginated);
router.get('/get-all', authMiddleware, adminAuthMiddleware, BatchController.getAllBatches);
router.get('/detail/:id', authMiddleware, adminAuthMiddleware, BatchController.getBatchById);
router.post('/create', authMiddleware, adminAuthMiddleware, BatchController.createBatch);
router.put('/update/:id', authMiddleware, adminAuthMiddleware, BatchController.updateBatch);
router.delete('/delete/:id', authMiddleware, adminAuthMiddleware, BatchController.deleteBatch);

// Route cho quản lý items trong batch
router.post('/:batchId/items', authMiddleware, adminAuthMiddleware, BatchController.addItemToBatch);
router.delete('/:batchId/items/:itemId', authMiddleware, adminAuthMiddleware, BatchController.removeItemFromBatch);

export default router; 