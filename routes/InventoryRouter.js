import express from 'express';
import InventoryController from '../controllers/InventoryController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/paginated', InventoryController.getInventoriesPaginated);
router.get('/get-all', InventoryController.getAllInventory);
router.get('/:id', InventoryController.getInventoryById);
router.post('/add', authMiddleware, InventoryController.addInventory);
router.put('/update/:id', authMiddleware, InventoryController.updateInventory);
router.delete('/delete/:id', authMiddleware, InventoryController.deleteInventory);

export default router;