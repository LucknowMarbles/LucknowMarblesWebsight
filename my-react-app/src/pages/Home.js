import React, { useEffect, useState } from 'react';
import axios from 'axios';
//import Search from '../components/Search';

const HomePage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('http://localhost:5001/api/products');
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <h1>Products</h1>
      
      <ul>
        {products.map(product => (
          <li key={product._id}>
            <img src={product.image} alt={product.name} />
            <h2>{product.name}</h2>
            <p>Quantity: {product.quantity}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HomePage;