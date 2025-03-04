import express from 'express';
import UserController from '../controllers/UserController.js';
import { authMiddleware, authUserMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/sign-up', UserController.createUser)
router.post('/sign-in', UserController.loginUser)
router.post('/log-out', UserController.logoutUser)
router.put('/update-user/:id',authUserMiddleware, UserController.updateUser)
router.delete('/delete-user/:id',authMiddleware, UserController.deleteUser)
router.get('/get-all',authMiddleware,UserController.getAllUser)
router.get('/get-details/:id',authUserMiddleware,UserController.getDetailUser)
router.post('/refresh-token',UserController.refreshToken)
router.post('/delete-many',authMiddleware,UserController.deleteMany)
router.post('/forgot-password/:email',UserController.forgotPassword)
router.post('/verify-reset-password-token/:email', UserController.verifyResetPasswordToken)
router.patch('/reset-password', UserController.resetPassword)

export default router;