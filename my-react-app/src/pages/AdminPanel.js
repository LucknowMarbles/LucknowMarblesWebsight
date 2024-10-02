import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../AdminPanal.css';
import UploadExcel from '../components/UploadExcel';
import GenerateInvoice from '../components/GenerateInvoice';
import { Table, Button, Form, Input, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

function AdminPanel() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const navigate = useNavigate();
  const [pieces, setPieces] = useState([]);
  const [batchNoFilter, setBatchNoFilter] = useState('');
  const [productNameFilter, setproductNameFilter] = useState('');
  const [autoPost, setAutoPost] = useState(false);
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

  const [expandedPermissions, setExpandedPermissions] = useState({});

  const permissionCategories = {
    'User Management': ['viewUsers', 'editUsers', 'deleteUsers', 'changeUserRoles'],
    'Product Management': ['viewProducts', 'addProducts', 'editProducts', 'deleteProducts', 'manageCategories'],
    'Order Management': ['viewOrders', 'updateOrderStatus', 'cancelOrders', 'refundOrders'],
    'Enquiry Management': ['viewEnquiries', 'respondToEnquiries', 'deleteEnquiries'],
    'Content Management': ['editWebsiteContent', 'manageBlogPosts'],
    'Analytics & Reporting': ['viewSalesReports', 'viewUserAnalytics', 'exportData'],
    'System Configuration': ['managePaymentGateways', 'manageShippingOptions', 'setSystemPreferences', 'viewSecurityLogs', 'manageUserPermissions']
  };
  const togglePermissionCategory = (userId, category) => {
    setExpandedPermissions(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [category]: !prev[userId]?.[category]
      }
    }));
  };

  // ... rest of the component ...

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

  const updateUserType = async (userId, isCustomer) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5001/api/users/${userId}/type`, { isCustomer }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error('Error updating user type:', error);
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
  const fetchPieces = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/pieces', {
        params: {
          batchNo: batchNoFilter,
          productName: productNameFilter
        }
      });
      setPieces(response.data.data);
    } catch (error) {
      console.error('Error fetching pieces:', error);
      message.error('Failed to fetch pieces');
    }
  }, [batchNoFilter, productNameFilter]);

  useEffect(() => {
    fetchPieces();
  }, [batchNoFilter, productNameFilter, fetchPieces]);


  const updateEnquiryProductNo = async (pieceId, enquiryProductNo) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5001/api/pieces/${pieceId}`, 
        { enquiryProductNo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPieces(); // Refresh the pieces list
    } catch (error) {
      console.error('Error updating enquiry product number:', error);
    }
  };
  useEffect(() => {
    if (activeTab === 'pieces') {
      fetchPieces();
    }
  }, [activeTab, batchNoFilter, productNameFilter]);

  useEffect(() => {
    if (activeTab === 'enquiries') {
      fetchEnquiries();
    }
  }, [activeTab])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>
      
      <div className="admin-tabs">
        <button onClick={() => setActiveTab('pieces')}>Pieces Balance Enquiry Products</button>
        <button onClick={() => setActiveTab('users')}>Users</button>
        <button onClick={() => setActiveTab('products')}>Products</button>
        <button onClick={() => setActiveTab('orders')}>Orders</button>
        <button onClick={() => setActiveTab('enquiries')}>Enquiries</button>
        <button onClick={() => setActiveTab('uploadPurchase')}>Upload Purchase Data</button>
        <button onClick={() => setActiveTab('uploadSale')}>Upload Sale Data</button>
        <button onClick={() => setActiveTab('generateInvoice')}>Generate Invoice</button>
      </div>
      {activeTab === 'pieces' && (
        <div className="pieces-section">
          <h2>Pieces</h2>
          <div className="filter-inputs">
            <input
              type="text"
              placeholder="Batch No"
              value={batchNoFilter}
              onChange={(e) => setBatchNoFilter(e.target.value)}
            />
            <input
              type="text"
              placeholder="Product ID"
              value={productNameFilter}
              onChange={(e) => setproductNameFilter(e.target.value)}
            />
            <button onClick={fetchPieces}>Filter</button>
          </div>
          {pieces.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Batch No</th>
                  <th>Piece No</th>
                  <th>Product</th>
                  <th>Customer Length</th>
                  <th>Customer Width</th>
                  <th>Trader Length</th>
                  <th>Trader Width</th>
                  <th>Thickness</th>
                  <th>Is Defective</th>
                  <th>Purchase Id</th>
                </tr>
              </thead>
              <tbody>
                {pieces.map((piece) => (
                  <tr key={piece._id}>
                    <td>{piece.batchNo}</td>
                    <td>{piece.pieceNo}</td>
                    <td>{piece.productName}</td>
                    <td>{piece.customerLength}</td>
                    <td>{piece.customerWidth}</td>
                    <td>{piece.traderLength}</td>
                    <td>{piece.traderWidth}</td>
                    <td>{piece.thickness}</td>
                    <td>{piece.isDefective ? 'Yes' : 'No'}</td>
                    <td>{piece.purchaseId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No pieces found. Try adjusting your filter criteria.</p>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="users-section">
          <h2>Registered Users</h2>
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Admin</th>
                <th>Customer</th>
                {Object.keys(permissionCategories).map(category => (
                  <th key={category}>{category}</th>
                ))}
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
                  <td>
                    <input 
                      type="checkbox" 
                      checked={user.isCustomer} 
                      onChange={() => updateUserType(user._id, !user.isCustomer)}
                    />
                  </td>
                  {Object.entries(permissionCategories).map(([category, permissions]) => (
                    <td key={category}>
                      <button onClick={() => togglePermissionCategory(user._id, category)} className="permission-dropdown">
                        {expandedPermissions[user._id]?.[category] ? '▼' : '▶'} {category}
                      </button>
                      {expandedPermissions[user._id]?.[category] && (
                        <div className="permission-list">
                          {permissions.map(permission => (
                            <label key={permission}>
                              <input 
                                type="checkbox" 
                                checked={user.isAdmin || user.permissions[permission]}
                                onChange={() => updateUserPermissions(user._id, permission, !user.permissions[permission])}
                                disabled={user.isAdmin}
                              />
                              {permission}
                            </label>
                          ))}
                        </div>
                      )}
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
            <div className="form-group">
            <label htmlFor="autoPost">
              <input
                type="checkbox"
                id="autoPost"
                name="autoPost"
                checked={autoPost}
                onChange={(e) => setAutoPost(e.target.checked)}
              />
                Automatically post to social media
              </label>
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
                  <th>Customer Name</th>
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
                    <td>{enquiry.customer.username}</td>
                    <td>{enquiry.customer.email}</td>
                    <td>{enquiry.customer.phoneNumber}</td>
                    <td>{enquiry.message}</td>
                    <td>
                      <ul className="product-list">
                        {enquiry.products.map((product, index) => (
                          <li key={index} className="product-item">
                            <strong>{product.product.name}</strong> - Quantity: {product.quantity}
                            <br />
                            Selected Batch: {product.selectedBatch}
                            <br />
                            Purposes:
                            <ul className="purpose-list">
                              {product.purposes.map((purpose, purposeIndex) => (
                                <li key={purposeIndex} className="purpose-item">
                                  <strong>{purpose.purposeOfUse}</strong>
                                  <br />
                                  Dimensions:
                                  <ul className="dimension-list">
                                    {purpose.dimension && Object.entries(purpose.dimension).map(([key, value]) => (
                                      <li key={key} className="dimension-item">
                                        {key}: {value}
                                      </li>
                                    ))}
                                  </ul>
                                </li>
                              ))}
                            </ul>
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

      {activeTab === 'uploadPurchase' && (
        <div className="upload-purchase-section">
          <h2>Upload Purchase Data</h2>
          <UploadExcel 
            url="http://localhost:5001/api/pieces/upload-purchase"
            onSuccess={() => alert('Purchase data uploaded successfully')}
          />
        </div>
      )}

      {activeTab === 'uploadSale' && (
        <div className="upload-sale-section">
          <h2>Upload Sale Data</h2>
          <UploadExcel 
            url="http://localhost:5001/api/pieces/upload-sale"
            onSuccess={() => alert('Sale data uploaded successfully')}
          />
        </div>
      )}

      {activeTab === 'generateInvoice' && (
        <div className="generate-invoice-section">
          <h2>Generate Invoice</h2>
          <GenerateInvoice />
        </div>
      )}
    </div>
  );
};

export default AdminPanel;