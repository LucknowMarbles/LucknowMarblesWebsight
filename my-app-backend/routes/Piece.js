const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { uploadPurchase, uploadSale, generateInvoice, DisplayPieces } = require('../controller/uploadPurchase');

router.post('/upload-purchase', upload.single('file'), uploadPurchase);
router.post('/upload-sale', upload.single('file'), uploadSale);
router.get('/generate-invoice/:purchaseId', generateInvoice);
router.get('/', DisplayPieces);

module.exports = router;