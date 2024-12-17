const express = require('express');
const { payment, callback } = require('../controllers/MomoController');

const router = express.Router();

router.post('/payment', payment);
router.post('/call-back', callback);


module.exports = router;