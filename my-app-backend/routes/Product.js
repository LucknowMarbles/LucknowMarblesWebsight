const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('./controller/User');


// GET all products
router.get('/products', getProducts);

// GET a single product
router.get('/:id', getProductById);


// POST a new product
router.post('/', createProduct);

// PUT update a product
router.put('/:id', updateProduct);

// DELETE a product
router.delete('/:id', deleteProduct);

module.exports = router;