const express = require('express');
const router = express.Router();
const { createTransaction, getTransactionReport } = require('../controller/Transactions');
const adminMiddleware = require('../Middleware/admin');

router.post('/', adminMiddleware, createTransaction);
router.get('/report', adminMiddleware, getTransactionReport);
//router.get('/invoices', adminMiddleware, getInvoices);

module.exports = router;
