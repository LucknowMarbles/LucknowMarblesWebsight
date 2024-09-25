import React, { useState } from 'react';
import axios from 'axios';

const ShoppingCart = ({ cart, setCart }) => {
  const [userInfo, setUserInfo] = useState({
    email: '',
    phoneNumber: '',
    address: ''
  });

  const deliveryCharge = 50; // Fixed delivery charge for Lucknow

  const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalAmount = subtotal + deliveryCharge;

  const handleInputChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    try {
      const orderData = {
        cart,
        userInfo,
        subtotal,
        deliveryCharge,
        totalAmount
      };
      const response = await axios.post('http://localhost:5001/api/orders', orderData);
      alert('Order placed successfully!');
      setCart([]);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred during checkout. Please try again.');
    }
  };

  return (
    <div className="shopping-cart">
      <h2>Shopping Cart</h2>
      {cart.map(item => (
        <div key={item._id} className="cart-item">
          <span>{item.name}</span>
          <span>Quantity: {item.quantity}</span>
          <span>${item.price * item.quantity}</span>
        </div>
      ))}
      <div className="cart-summary">
        <p>Total Quantity: {totalQuantity}</p>
        <p>Subtotal: ${subtotal}</p>
        <p>Delivery Charge: ${deliveryCharge}</p>
        <p>Total Amount: ${totalAmount}</p>
      </div>
      <form onSubmit={handleCheckout}>
        <input
          type="email"
          name="email"
          value={userInfo.email}
          onChange={handleInputChange}
          placeholder="Email"
          required
        />
        <input
          type="tel"
          name="phoneNumber"
          value={userInfo.phoneNumber}
          onChange={handleInputChange}
          placeholder="Phone Number"
          required
        />
        <textarea
          name="address"
          value={userInfo.address}
          onChange={handleInputChange}
          placeholder="Delivery Address"
          required
        />
        <button type="submit">Checkout</button>
      </form>
    </div>
  );
};

export default ShoppingCart;