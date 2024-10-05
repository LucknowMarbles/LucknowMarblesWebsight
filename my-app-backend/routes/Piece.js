const express = require('express');
const router = express.Router();
const multer = require('multer');
const pieceController = require('../controller/uploadPurchase');
const upload = multer({ storage: multer.memoryStorage() });
const { uploadPurchase, uploadSale, generateInvoice, DisplayPieces, getUniqueBatchesForProduct, getPiecesByBatch, getPieceById } = require('../controller/uploadPurchase');

router.post('/upload-purchase', upload.single('file'), uploadPurchase);
router.post('/upload-sale', upload.single('file'), uploadSale);
router.get('/generate-invoice/:purchaseId', generateInvoice);
router.get('/unique-batches/:productId', getUniqueBatchesForProduct);
router.get('/batch/:batchNo', getPiecesByBatch);
router.get('/piece/:pieceId', getPieceById);


router.get('/', DisplayPieces);

module.exports = router;