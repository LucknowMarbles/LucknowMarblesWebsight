import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    imageUrl: '',
    category: '',
    tags: '',
    isEcommerce: false,
    longitude: '',
    latitude: '',
  });
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/enquiries', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEnquiries(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      setError('Failed to fetch enquiries. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct((prevProduct) => ({
      ...prevProduct,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const productData = {
        ...product,
        tags: product.tags.split(',').map(tag => tag.trim()),
        longitude: parseFloat(product.longitude),
        latitude: parseFloat(product.latitude),
      };
      await axios.post('http://localhost:5001/api/products', productData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Product created successfully');
      // Clear the form after successful submission
      setProduct({
        name: '',
        description: '',
        price: '',
        quantity: '',
        imageUrl: '',
        category: '',
        tags: '',
        isEcommerce: false,
        longitude: '',
        latitude: '',
      });
    } catch (err) {
      console.error('Error creating product:', err);
      alert('Failed to create product');
    }
  };

  if (loading) {
    return <div>Loading enquiries...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>
      
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label htmlFor="name">Product Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={product.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={product.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input
            type="number"
            id="price"
            name="price"
            value={product.price}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="quantity">Quantity</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={product.quantity}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="imageUrl">Product Image URL</label>
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            value={product.imageUrl}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <input
            type="text"
            id="category"
            name="category"
            value={product.category}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={product.tags}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="isEcommerce">
            <input
              type="checkbox"
              id="isEcommerce"
              name="isEcommerce"
              checked={product.isEcommerce}
              onChange={handleChange}
            />
            E-commerce Product
          </label>
        </div>
        <div className="form-group">
          <label htmlFor="longitude">Longitude</label>
          <input
            type="number"
            id="longitude"
            name="longitude"
            value={product.longitude}
            onChange={handleChange}
            step="any"
          />
        </div>
        <div className="form-group">
          <label htmlFor="latitude">Latitude</label>
          <input
            type="number"
            id="latitude"
            name="latitude"
            value={product.latitude}
            onChange={handleChange}
            step="any"
          />
        </div>
        <button type="submit">Create Product</button>
      </form>

      <h2>Customer Enquiries</h2>
      {enquiries.length === 0 ? (
        <p>No enquiries found.</p>
      ) : (
        <table className="enquiries-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Message</th>
              <th>Products</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.map((enquiry) => (
              <tr key={enquiry._id}>
                <td>{enquiry.username}</td>
                <td>{enquiry.email}</td>
                <td>{enquiry.phoneNumber}</td>
                <td>{enquiry.message}</td>
                <td>
                  <ul>
                    {enquiry.products.map((product, index) => (
                      <li key={index}>
                        {product.product.name} - Quantity: {product.quantity}
                        <br />
                        Purpose: {product.purposeOfUse}
                        <br />
                        Dimensions: {JSON.stringify(product.dimensions)}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>{new Date(enquiry.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminPanel;
