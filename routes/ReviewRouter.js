import express from 'express';
import ReviewController from '../controllers/ReviewController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create/:productId', authMiddleware, ReviewController.createReview);
router.delete('/delete/:reviewId', authMiddleware, ReviewController.deleteReview);
router.get('/product/:productId', ReviewController.getReviewsByProductId);

export default router; 