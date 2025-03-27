import express from 'express';
import InventoryController from '../controllers/InventoryController.js';
import { adminAuthMiddleware, authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/paginated', authMiddleware, adminAuthMiddleware, InventoryController.getInventoriesPaginated);
router.get('/get-all', authMiddleware, adminAuthMiddleware, InventoryController.getAllInventory);
router.get('/detail/:id', authMiddleware, adminAuthMiddleware, InventoryController.getInventoryById);
router.post('/add', authMiddleware, adminAuthMiddleware, InventoryController.addInventory);
router.delete('/delete/:id', authMiddleware, adminAuthMiddleware, InventoryController.deleteInventory);

export default router;