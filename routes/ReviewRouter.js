import express from 'express';
import ReviewController from '../controllers/ReviewController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/get-all', ReviewController.getAllReviews);
router.post('/create', authMiddleware, ReviewController.createReview);
router.put('/update/:id', authMiddleware, ReviewController.updateReview);
router.delete('/delete/:id', authMiddleware, ReviewController.deleteReview);

export default router; 