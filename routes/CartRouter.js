import express from 'express';
import CartController from '../controllers/CartController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my-cart', authMiddleware, CartController.getCartByUser);
router.post('/add-item', authMiddleware, CartController.addToCart);
router.put('/update-item', authMiddleware, CartController.updateCartItem);
router.delete('/remove-item/:productId', authMiddleware, CartController.removeFromCart);
router.delete('/clear', authMiddleware, CartController.clearCart);

export default router; 