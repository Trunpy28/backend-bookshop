import express from 'express';
import ProductController from '../controllers/ProductController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create',ProductController.createProduct)
router.put('/update/:id',authMiddleware,ProductController.updateProduct)
router.get('/get-details/:id',ProductController.getDetailProduct)
router.delete('/delete/:id',authMiddleware,ProductController.deleteProduct)
router.get('/get-all',ProductController.getAllProduct)
router.post('/delete-many',authMiddleware,ProductController.deleteManyProduct)
router.get('/get-all-type',ProductController.getAllType)

export default router;