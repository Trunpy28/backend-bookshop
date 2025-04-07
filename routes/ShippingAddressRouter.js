import express from 'express';
import ShippingAddressController from '../controllers/ShippingAddressController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/get/user', authMiddleware, ShippingAddressController.getUserAddresses);
router.post('/add', authMiddleware, ShippingAddressController.addAddress);
router.put('/update/:addressId', authMiddleware, ShippingAddressController.updateAddress);
router.delete('/delete/:addressId', authMiddleware, ShippingAddressController.deleteAddress);
router.patch('/set-default/:addressId', authMiddleware, ShippingAddressController.setDefaultAddress);

export default router; 