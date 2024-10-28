const express = require('express');
const router = express.Router();
const transferController = require('../controller/transferController');

router.post('/bulk', transferController.createBulkTransfer);
router.post('/piece', transferController.createPieceTransfer);
router.get('/', transferController.getTransfers);
router.get('/:id', transferController.getTransferById);
router.patch('/:id/status', transferController.updateTransferStatus);

module.exports = router;
