const express = require('express');
const router = express.Router();
const enquiryController = require('../controller/Enquiry');
const authMiddleware = require('../Middleware/auth'); // You'll need to create this middleware

router.post('/', enquiryController.createEnquiry);
router.get('/get', enquiryController.getAllEnquiries); // New route for fetching all enquiries

module.exports = router;