const express = require('express');
const router = express.Router();
const { createOrder, getAllOrders, getOrderById, updateOrder, deleteOrder } = require('../controller/Order');
const authMiddleware = require('../Middleware/auth');

// POST route to create an order (for both authenticated and non-authenticated users)
router.post('/', createOrder);

// Other routes remain the same
router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id',  updateOrder);
router.delete('/:id',deleteOrder);

module.exports = router;