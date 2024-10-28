const express = require('express');
const router = express.Router();
const multer = require('multer');
const pieceController = require('../controller/uploadPurchase');
const upload = multer({ storage: multer.memoryStorage() });
const { uploadPurchase, generateInvoice, DisplayPieces, getUniqueBatchesForProduct, getPiecesByBatch, getPieceById, getAllPurchases } = require('../controller/uploadPurchase');
const adminMiddleware = require('../Middleware/admin');

router.post('/upload-purchase', uploadPurchase);
router.get('/generate-invoice/:purchaseId', generateInvoice);
router.get('/unique-batches/:productId', getUniqueBatchesForProduct);
router.get('/batch/:batchNo', getPiecesByBatch);
router.get('/piece/:pieceId', getPieceById);

// Route to get all purchases
router.get('/purchases', getAllPurchases);

router.get('/', DisplayPieces);

module.exports = router;
