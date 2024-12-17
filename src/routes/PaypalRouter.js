const express = require("express");
const router = express.Router();
const paypalController = require("../controllers/PaypalController");
const { authUserMiddleware } = require("../middleware/authMiddleware");

// Route tạo order
router.post("/create-order", authUserMiddleware, paypalController.createOrder);

// Route xác nhận order
router.post("/capture-order/:orderId", authUserMiddleware, paypalController.captureOrder);

module.exports = router;