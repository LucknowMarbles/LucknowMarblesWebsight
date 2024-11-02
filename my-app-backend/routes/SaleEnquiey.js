const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const saleEnquiryController = require('../controller/uploadSaleEnquiries');

// ... other routes ...
router.get('/generate-invoice/:saleId', saleEnquiryController.generateSaleInvoice);
router.post('/upload', upload.single('file'), saleEnquiryController.uploadSaleEnquiries);
router.get('/all', saleEnquiryController.getAllSaleEnquiries);

module.exports = router;