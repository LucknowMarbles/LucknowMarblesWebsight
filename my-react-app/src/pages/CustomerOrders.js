import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CustomerOrders() {
  const [contact, setContact] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [userType, setUserType] = useState('customer');


  useEffect(() => {
    const token = localStorage.getItem('customerToken');
    if (token) {
      fetchOrders(token);
    }
  }, []);

  const sendOTP = async () => {
    try {
      await axios.post('http://localhost:5001/api/otp/send-otp', { contact });
      setOtpSent(true);
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
    }
  };

  const verifyOTP = async () => {
    try {
      const response = await axios.post('http://localhost:5001/api/otp/verify-otp', { contact, otp, type: userType });
      localStorage.setItem('customerToken', response.data.token);
      localStorage.setItem('userType', response.data.type);
      fetchOrders(response.data.token);
    } catch (error) {
      setError('Invalid OTP. Please try again.');
    }
  };

  const fetchOrders = async (token) => {
    try {
      const response = await axios.get('http://localhost:5001/api/otp/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (error) {
      setError('Failed to fetch orders. Please try again.');
    }
  };

  return (
    <div className="customer-orders">
      <h1>Your Orders</h1>
      {!localStorage.getItem('customerToken') && (
        <div className="auth-section">
          {!otpSent ? (
            <>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Enter phone number or email"
              />
              <select value={userType} onChange={(e) => setUserType(e.target.value)}>
                <option value="customer">Customer</option>
                <option value="vendor">Vendor</option>
              </select>
              <button onClick={sendOTP}>Send OTP</button>
            </>
          ) : (
            <>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
              />
              <button onClick={verifyOTP}>Verify OTP</button>
            </>
          )}
        </div>
      )}
      {error && <p className="error">{error}</p>}
      <div className="orders-list">
        {orders.map((order) => (
          <div key={order._id} className="order-item">
            <h2>Order #{order._id}</h2>
            <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            <p>Status: {order.status}</p>
            <h3>Items:</h3>
            <ul>
              {order.items.map((item) => (
                <li key={item._id}>
                  {item.product.name} - Quantity: {item.quantity}, Price: ${item.price}
                </li>
              ))}
            </ul>
            <p>Total: ${order.total}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CustomerOrders;
