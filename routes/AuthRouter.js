import express from 'express';
import passport from 'passport';
import { googleAuthCallback } from '../controllers/AuthController.js';

const router = express.Router();

// Route bắt đầu xác thực với Google
router.get(
  '/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
);

// Route callback sau khi xác thực
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  googleAuthCallback
);

export default router;
