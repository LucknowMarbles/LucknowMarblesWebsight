import React, { useState } from 'react';
import axios from 'axios';
import '../ShoppingCart.css';

const ShoppingCart = ({ cart, setCart }) => {
  const [userInfo, setUserInfo] = useState({
    email: '',
    phoneNumber: '',
    address: ''
  });

  const deliveryCharge = 50;
  const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalAmount = subtotal + deliveryCharge;

  const handleInputChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    setCart(cart.map(item => 
      item._id === itemId ? { ...item, quantity: Math.max(1, newQuantity) } : item
    ));
  };

  const handleRemoveItem = (itemId) => {
    setCart(cart.filter(item => item._id !== itemId));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    try {
      const orderData = {
        items: cart,
        userInfo,
        subtotal,
        deliveryCharge,
        totalAmount
      };

      const token = localStorage.getItem('token');
      const config = {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      };

      const response = await axios.post('http://localhost:5001/api/orders', orderData, config);
      console.log('Order placed successfully:', response.data);
      alert('Order placed successfully!');
      setCart([]);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred during checkout. Please try again.');
    }
  };

  return (
    <div className="shopping-cart-container">
      <h2>Your Shopping Cart</h2>
      {cart.length === 0 ? (
        <p className="empty-cart-message">Your cart is empty</p>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cart.map(item => (
              <div key={item._id} className="cart-item">
                <img src={item.imageUrl} alt={item.name} className="item-image" />
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-price">${item.price.toFixed(2)}</p>
                  <div className="quantity-control">
                    <button onClick={() => handleQuantityChange(item._id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(item._id, item.quantity + 1)}>+</button>
                  </div>
                </div>
                <p className="item-total">${(item.price * item.quantity).toFixed(2)}</p>
                <button className="remove-item" onClick={() => handleRemoveItem(item._id)}>&times;</button>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal ({totalQuantity} items)</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Charge</span>
              <span>${deliveryCharge.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
      {cart.length > 0 && (
        <form onSubmit={handleCheckout} className="checkout-form">
          <h3>Shipping Information</h3>
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
          <button type="submit" className="checkout-button">Proceed to Checkout</button>
        </form>
      )}
    </div>
  );
};

export default ShoppingCart;