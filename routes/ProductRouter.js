import express from 'express';
import multer from 'multer';
import ProductController from '../controllers/ProductController.js';
import { adminAuthMiddleware, authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
// Cấu hình multer để lưu trữ file trong bộ nhớ
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/create', authMiddleware, adminAuthMiddleware, upload.array('images'), ProductController.createProduct);
router.put('/update/:id', authMiddleware, adminAuthMiddleware, upload.array('images'), ProductController.updateProduct);
router.get('/get-details/:id', ProductController.getDetailProduct);
router.delete('/delete/:id', authMiddleware, adminAuthMiddleware, ProductController.deleteProduct);
router.get('/get-all', ProductController.getAllProduct);
router.get('/get-products-paginated', ProductController.getProductsPaginated);
router.get('/product-names', ProductController.getAllProductsName);
router.get('/products-for-select', ProductController.getProductsForSelect);
router.get('/by-genre/:genreId', ProductController.getProductsByGenre);

export default router;