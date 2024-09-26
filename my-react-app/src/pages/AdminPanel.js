import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const navigate = useNavigate();

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
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAdminStatus();
    if (isAdmin) {
      fetchUsers();
      fetchOrders();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get('http://localhost:5001/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsAdmin(response.data.isAdmin);
      setLoading(false);
      if (!response.data.isAdmin) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setLoading(false);
      navigate('/login');
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const updateUserPermissions = async (userId, permission, value) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5001/api/users/${userId}/permissions`, { [permission]: value }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error('Error updating user permissions:', error);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5001/api/orders/${orderId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchOrders(); // Refresh order list
    } catch (error) {
      console.error('Error updating order status:', error);
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

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/enquiries/get', {
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>
      
      <div className="admin-tabs">
        <button onClick={() => setActiveTab('users')}>Users</button>
        <button onClick={() => setActiveTab('products')}>Products</button>
        <button onClick={() => setActiveTab('orders')}>Orders</button>
        <button onClick={() => setActiveTab('enquiries')}>Enquiries</button>
      </div>

      {activeTab === 'users' && (
        <div className="users-section">
          <h2>Registered Users</h2>
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Admin</th>
                <th>View Users</th>
                <th>Edit Users</th>
                <th>Delete Users</th>
                <th>Change User Roles</th>
                <th>View Products</th>
                <th>Add Products</th>
                <th>Edit Products</th>
                <th>Delete Products</th>
                <th>Manage Categories</th>
                <th>View Orders</th>
                <th>Update Order Status</th>
                <th>Cancel Orders</th>
                <th>Refund Orders</th>
                <th>View Enquiries</th>
                <th>Respond to Enquiries</th>
                <th>Delete Enquiries</th>
                <th>Edit Website Content</th>
                <th>Manage Blog Posts</th>
                <th>View Sales Reports</th>
                <th>View User Analytics</th>
                <th>Export Data</th>
                <th>Manage Payment Gateways</th>
                <th>Manage Shipping Options</th>
                <th>Set System Preferences</th>
                <th>View Security Logs</th>
                <th>Manage User Permissions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={user.isAdmin} 
                      onChange={() => updateUserPermissions(user._id, 'isAdmin', !user.isAdmin)}
                    />
                  </td>
                  {Object.keys(user.permissions).map(permission => (
                    <td key={permission}>
                      <input 
                        type="checkbox" 
                        checked={user.isAdmin || user.permissions[permission]}
                        onChange={() => updateUserPermissions(user._id, permission, !user.permissions[permission])}
                        disabled={user.isAdmin}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="products-section">
          <h2>Product Management</h2>
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
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="orders-section">
          <h2>Order Management</h2>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.user ? order.user.username : 'Guest'}</td>
                  <td>${order.totalAmount}</td>
                  <td>{order.status}</td>
                  <td>
                    <select 
                      value={order.status} 
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'enquiries' && (
        <div className="enquiries-section">
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
      )}
    </div>
  );
};

export default AdminPanel;
