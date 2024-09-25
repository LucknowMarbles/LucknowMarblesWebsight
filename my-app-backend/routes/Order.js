const express = require('express');
const router = express.Router();
const { createOrder, createGuestOrder } = require('../controller/Order');
const authMiddleware = require('../Middleware/auth'); // Assuming you have an auth middleware

// POST route to create an order for authenticated users
router.post('/',createOrder);

// POST route to create an order for guests
router.post('/guest', createGuestOrder);

// You can add more routes here as needed, such as:
// GET route to fetch all orders
// GET route to fetch a specific order
// PUT route to update an order
// DELETE route to cancel an order

module.exports = router;