const express = require('express');
const { registerUser, loginUser, getUserProfile, checkUser, checkPhoneNumber } = require('../controller/user'); // Corrected path to the controller
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', getUserProfile);
router.get('/check/:email', checkUser);
router.post('/check-phone', checkPhoneNumber);

module.exports = router;