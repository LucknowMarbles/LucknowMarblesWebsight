import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Home.css';
import EnquiryForm from '../services/EnquiryForm';

const HomePage = ({ cart, setCart }) => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showEcommerceOnly, setShowEcommerceOnly] = useState(false);

  useEffect(() => {

    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('http://localhost:5001/api/products');
        setProducts(data);
        setCategories([...new Set(data.map(product => product.category))]);
        setError(null);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to fetch products. Please try again later.');
      }
    };
    fetchProducts();
  }, []);

  const handleGetQuote = (product) => {
    setSelectedProducts(prevSelected => {
      if (prevSelected.find(p => p._id === product._id)) {
        return prevSelected;
      }
      return [...prevSelected, { ...product, purposes: [] }];
    });
  };

  const handleAddToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item._id === product._id);
      if (existingItem) {
        return prevCart.map(item =>
          item._id === product._id ? { 
            ...item,
            quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { 
      _id: product._id,
      name: product.name,
      price: product.price,
      quantity: 1 }];
    });
  };

  const filteredProducts = products
    .filter(product => !selectedCategory || product.category === selectedCategory)
    .filter(product => !showEcommerceOnly || product.isEcommerce);

  return (
    <div className="home-page">
      <h1>Products</h1>
      
      <div className="filters">
        <select onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <label>
          <input
            type="checkbox"
            checked={showEcommerceOnly}
            onChange={(e) => setShowEcommerceOnly(e.target.checked)}
          />
          Show E-commerce Products Only
        </label>
      </div>

      {error ? (
        <div className="error-message">Error: {error}</div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map(product => (
            <div key={product._id} className="product-card">
              <img src={product.imageUrl} alt={product.name} className="product-image" />
              <h2 className="product-name">{product.name}</h2>
              <p className="product-id">Product ID: {product._id}</p> {/* Add this line */}
              <p className="product-description">{product.description}</p>
              <p className="product-quantity">Quantity: {product.quantity}</p>
              <p className="product-price">Price: ${product.price}</p>
              <p className="product-category">Category: {product.category}</p>
              <div className="product-tags">
                {product.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
              {product.isEcommerce ? (
                <button onClick={() => handleAddToCart(product)} className="add-to-cart-btn">Add to Cart</button>
              ) : (
                <button onClick={() => handleGetQuote(product)} className="get-quote-btn">Get Quote</button>
              )}
            </div>
          ))}
        </div>
      )}
      <EnquiryForm selectedProducts={selectedProducts} setSelectedProducts={setSelectedProducts} />
    </div>
  );
};

export default HomePage;