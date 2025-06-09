import express from 'express';
import StatisticsController from '../controllers/StatisticsController.js';
import { authMiddleware, adminAuthMiddleware } from '../middleware/AuthMiddleware.js';

const router = express.Router();

router.get('/general', authMiddleware, adminAuthMiddleware, StatisticsController.getGeneralStatistics);
router.get('/rating', authMiddleware, adminAuthMiddleware, StatisticsController.getRatingStatistics);
router.get('/order-status', authMiddleware, adminAuthMiddleware, StatisticsController.getOrderStatusStatistics);
router.get('/payment', authMiddleware, adminAuthMiddleware, StatisticsController.getPaymentStatistics);

router.get('/revenue/by-month', authMiddleware, adminAuthMiddleware, StatisticsController.getRevenueByMonth);
router.get('/revenue/by-year', authMiddleware, adminAuthMiddleware, StatisticsController.getRevenueByYear);

export default router; 