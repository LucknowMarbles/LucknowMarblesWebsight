const { SendOTP, VerifyOTP, GetOrders } = require('../controller/Otp');
const express = require('express');
const router = express.Router();

router.post('/send-otp', SendOTP);
router.post('/verify-otp', VerifyOTP);
router.get('/orders', GetOrders);

module.exports = router;