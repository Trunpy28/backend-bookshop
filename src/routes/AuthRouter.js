const express = require('express');
const passport = require('passport');
const { googleAuthCallback } = require('../controllers/AuthController');

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

module.exports = router;
