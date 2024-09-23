const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://localhost/lucknow_marbles', { useNewUrlParser: true, useUnifiedTopology: true });

const ProductSchema = new mongoose.Schema({
    name: String,
    price: Number,
    image: String,
    quantity: Number
});

const QuoteSchema = new mongoose.Schema({
    name: String,
    address: String,
    phone: String,
    company: String,
    gst: String,
    products: [
        {
            product_id: mongoose.Schema.Types.ObjectId,
            quantity: Number
        }
    ]
});

const Product = mongoose.model('Product', ProductSchema);
const Quote = mongoose.model('Quote', QuoteSchema);

// Get all products
app.get('/api/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// Get a single product by ID
app.get('/api/products/:id', async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.json(product);
});

// Create a new product
app.post('/api/products', async (req, res) => {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
});

// Update a product
app.put('/api/products/:id', async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
});

// Delete a product
app.delete('/api/products/:id', async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.status(204).send();
});

// Get all quotes
app.get('/api/quotes', async (req, res) => {
    const quotes = await Quote.find().populate('products.product_id');
    res.json(quotes);
});

// Create a new quote
app.post('/api/quotes', async (req, res) => {
    try {
        const quote = new Quote(req.body);
        await quote.save();
        res.status(201).json(quote);
    } catch (error) {
        console.error('Error creating quote:', error);
        res.status(500).json({ error: 'Failed to create quote' });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
