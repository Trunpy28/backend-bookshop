import express from 'express';
import UserController from '../controllers/UserController.js';
import { adminAuthMiddleware, authMiddleware, authUserMiddleware } from '../middleware/AuthMiddleware.js';

const router = express.Router();

router.post('/sign-up', UserController.createUser)
router.post('/sign-in', UserController.loginUser)
router.post('/log-out', UserController.logoutUser)
router.put('/update-user/:userId',authUserMiddleware, UserController.updateUser)
router.delete('/delete-user/:id',authMiddleware, adminAuthMiddleware, UserController.deleteUser)
router.get('/get-all',authMiddleware, adminAuthMiddleware, UserController.getAllUser)
router.get('/get-details/:userId', authUserMiddleware, UserController.getDetailUser)
router.post('/refresh-token', UserController.refreshToken)
router.post('/forgot-password/:email', UserController.forgotPassword)
router.post('/verify-reset-password-token/:email', UserController.verifyResetPasswordToken)
router.patch('/reset-password', UserController.resetPassword)
router.patch('/change-password/:userId', authMiddleware, UserController.changePassword)
router.get('/paginated', authMiddleware, adminAuthMiddleware, UserController.getUsersPaginated)

export default router;