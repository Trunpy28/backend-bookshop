const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const { authUserMiddleware } = require('../middleware/authMiddleware');

router.post('/create/:id',authUserMiddleware,OrderController.createOrder);
router.get('/get-all-orders-details/:id',authUserMiddleware,OrderController.getAllOrdersDetails)
router.get('/get-details-order/:id',OrderController.getDetailsOrder)
router.delete('/cancel-order/:id',OrderController.cancelOrder)

module.exports = router;