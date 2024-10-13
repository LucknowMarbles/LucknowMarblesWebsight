const express = require('express');
const router = express.Router();
const productController = require('../controller/productController');

// GET all products
router.get('/', productController.getProducts); // Changed from '/products' to '/'

// GET a single product
router.get('/product/:id', productController.getProductById);

// POST a new product
router.post('/', productController.createProduct); // Removed upload.single('image')

// PUT update a product
router.put('/:id', productController.updateProduct);

// DELETE a product
router.delete('/:id', productController.deleteProduct);

// GET e-commerce products
router.get('/ecommerce', productController.getEcommerceProducts);



module.exports = router;

