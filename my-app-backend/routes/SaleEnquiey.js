const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const saleEnquiryController = require('../controllers/SaleEnquiry');

// ... other routes ...

router.post('/upload', upload.single('file'), saleEnquiryController.uploadSaleEnquiries);

module.exports = router;