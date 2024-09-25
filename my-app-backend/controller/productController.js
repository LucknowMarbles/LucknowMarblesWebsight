const Product = require('../modals/Product'); // Note: Changed 'modals' to 'models'

const getProducts = async (req, res) => {
  console.log('getProducts function called');
  try {
    const products = await Product.find();
    console.log('Products found:', products);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, quantity, imageUrl, category, tags, isEcommerce, longitude, latitude } = req.body;

    const newProduct = new Product({
      name,
      description,
      price,
      quantity,
      imageUrl,
      category,
      tags,
      isEcommerce,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      }
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ message: 'Failed to create product', error: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getEcommerceProducts = async (req, res) => {
  try {
    const { longitude, latitude } = req.query;
    const products = await Product.find({
      isEcommerce: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: 100000 // 100km in meters
        }
      }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { 
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getEcommerceProducts
};