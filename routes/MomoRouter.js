import express from 'express';
import { payment, callback } from '../controllers/MomoController.js';

const router = express.Router();

router.post('/payment', payment);
router.post('/call-back', callback);

export default router;