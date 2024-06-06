const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const { authUserMiddleware, authMiddleware } = require('../middleware/authMiddleware');

router.post('/create/:id',authUserMiddleware,OrderController.createOrder);
router.get('/get-all-orders-details/:id',authUserMiddleware,OrderController.getAllOrdersDetails)
router.get('/get-details-order/:id',OrderController.getDetailsOrder)
router.delete('/cancel-order/:id',OrderController.cancelOrder)
router.get('/get-all',authMiddleware,OrderController.getAllOrder)
router.put('/update-order/:id',authMiddleware, OrderController.updateOrder)
router.delete('/delete-order/:id',authMiddleware, OrderController.deleteOrder)
router.post('/delete-many',authMiddleware,OrderController.deleteMany)


module.exports = router;