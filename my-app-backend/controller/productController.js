const Product = require('../modals/Product');
const { postToSocialMedia } = require('./postToSocialMedia');

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
    const {
      name,
      description,
      price,
      quantity,
      imageUrl,
      category,
      tags,
      isEcommerce,
      metaTitle,
      metaDescription,
      warehouseQuantities
    } = req.body;

    const newProduct = new Product({
      name,
      description,
      price,
      quantity,
      imageUrl,
      category,
      tags: Array.isArray(tags) ? tags : [],
      isEcommerce: Boolean(isEcommerce),
      metaTitle,
      metaDescription,
      warehouseQuantities: Array.isArray(warehouseQuantities) ? warehouseQuantities : []
    });

    const savedProduct = await newProduct.save();
    await postToSocialMedia(savedProduct);
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ 
      error: 'Failed to create product', 
      details: error.message 
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      quantity,
      imageUrl,
      category,
      tags,
      isEcommerce,
      metaTitle,
      metaDescription,
      warehouseQuantities
    } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        price,
        quantity,
        imageUrl,
        category,
        tags: Array.isArray(tags) ? tags : [],
        isEcommerce: Boolean(isEcommerce),
        metaTitle,
        metaDescription,
        warehouseQuantities: Array.isArray(warehouseQuantities) ? warehouseQuantities : [],
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
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
    let query = { isEcommerce: true };
    const products = await Product.find(query);
  
    res.json(products);


    }
 catch (error) {
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
