import React, { useState } from 'react';
import axios from 'axios';
import { GooglePayButton } from '@google-pay/button-react';
import { QRCodeSVG } from 'qrcode.react';
import { Form, Input, Button, message } from 'antd';
import CreateCustomerForm from '../components/CreateCustomerForm';
import '../ShoppingCart.css';

const ShoppingCart = ({ cart, setCart }) => {
  const [userInfo, setUserInfo] = useState({
    email: '',
    phoneNumber: '',
    address: '',
    _id: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [utrCode, setUtrCode] = useState('');
  const [showUTRInput, setShowUTRInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showCreateCustomer, setShowCreateCustomer] = useState(true);
  const [customerVerified, setCustomerVerified] = useState(false);

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

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    try {
      const orderData = {
        items: cart,
        userInfo,
        subtotal,
        deliveryCharge,
        totalAmount,
        paymentMethod
      };

      const token = localStorage.getItem('token');
      const config = {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      };

      console.log(orderData);
      const response = await axios.post('http://localhost:5001/api/orders', orderData, config);
      setOrderId(response.data._id);

      if (paymentMethod === 'upi') {
        setShowQR(true);
      } else if (paymentMethod === 'cod') {
        setOrderComplete(true);
      } else if (paymentMethod === 'neft_rtgs') {
        setShowUTRInput(true);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred during checkout. Please try again.');
    }
  };

  const handleUPIPaymentComplete = async () => {
    try {
      await axios.put(`http://localhost:5001/api/orders/${orderId}/payment-complete`);
      setOrderComplete(true);
    } catch (error) {
      console.error('Error completing UPI payment:', error);
      alert('Failed to complete payment. Please try again.');
    }
  };

  const handleUTRSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5001/api/orders/${orderId}/update-utr`, { utrCode });
      setOrderComplete(true);
    } catch (error) {
      console.error('Error updating UTR code:', error);
      alert('Failed to update UTR code. Please try again.');
    }
  };

  const renderOrderSummary = (isConfirmationPage = false) => (
    <div className={`cart-summary ${isConfirmationPage ? 'confirmation-summary' : ''}`}>
      <h3>Order Summary</h3>
      {cart.map(item => (
        <div key={item._id} className="summary-item">
          <span>{item.name} x {item.quantity}</span>
          <span>${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      ))}
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
  );

  const renderCartItems = () => (
    <div className="cart-items">
      {cart.map(item => (
        <div key={item._id} className="cart-item">
          <img src={item.imageUrl} alt={item.name} className="item-image" />
          <div className="item-details">
            <h3>{item.name}</h3>
            <p className="item-price">${item.price}</p>
            <div className="quantity-control">
              <button onClick={() => handleQuantityChange(item._id, item.quantity - 1)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => handleQuantityChange(item._id, item.quantity + 1)}>+</button>
            </div>
          </div>
          <p className="item-total">${item.price * item.quantity}</p>
          <button className="remove-item" onClick={() => handleRemoveItem(item._id)}>&times;</button>
        </div>
      ))}
    </div>
  );

  const renderCheckoutForm = () => (
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
      <textarea
        name="_id"
        value={userInfo._id}
        onChange={handleInputChange}
        placeholder="Customer ID"
        required
      />
      <h3>Payment Method</h3>
      <div className="payment-methods">
        <label>
          <input
            type="radio"
            name="paymentMethod"
            value="upi"
            checked={paymentMethod === 'upi'}
            onChange={handlePaymentMethodChange}
          />
          UPI
        </label>
        <label>
          <input
            type="radio"
            name="paymentMethod"
            value="cod"
            checked={paymentMethod === 'cod'}
            onChange={handlePaymentMethodChange}
          />
          Cash on Delivery
        </label>
        <label>
          <input
            type="radio"
            name="paymentMethod"
            value="neft_rtgs"
            checked={paymentMethod === 'neft_rtgs'}
            onChange={handlePaymentMethodChange}
          />
          NEFT/RTGS
        </label>
      </div>
      {paymentMethod === 'neft_rtgs' && (
        <div className="neft-rtgs-details">
          <h4>Bank Details for NEFT/RTGS</h4>
          <p>Account Name: Your Company Name</p>
          <p>Account Number: 1234567890</p>
          <p>IFSC Code: ABCD0001234</p>
          <p>Bank Name: Your Bank Name</p>
          <p>Branch: Your Branch Name</p>
        </div>
      )}
      <button type="submit" className="checkout-button">Place Order</button>
    </form>
  );

  const renderUPIPayment = () => (
    <div className="upi-payment">
      <h3>UPI Payment</h3>
      {renderOrderSummary(true)}
      <QRCodeSVG value={`upi://pay?pa=merchant@upi&pn=YourStore&am=${totalAmount}&cu=INR&tn=Order%20Payment`} />
      <GooglePayButton
        environment="TEST"
        paymentRequest={{
          apiVersion: 2,
          apiVersionMinor: 0,
          allowedPaymentMethods: [
            {
              type: 'UPI',
              parameters: {
                payeeVpa: 'merchant@upi',
                payeeName: 'Your Store Name',
                mcc: '5411',
                transactionReferenceId: orderId
              },
              tokenizationSpecification: {
                type: 'DIRECT'
              }
            }
          ],
          merchantInfo: {
            merchantId: 'your-merchant-id',
            merchantName: 'Your Store Name'
          },
          transactionInfo: {
            totalPriceStatus: 'FINAL',
            totalPrice: totalAmount.toString(),
            currencyCode: 'INR'
          }
        }}
        onLoadPaymentData={paymentRequest => {
          console.log('Success', paymentRequest);
          handleUPIPaymentComplete();
        }}
      />
      <button onClick={handleUPIPaymentComplete}>Confirm Payment</button>
    </div>
  );

  const renderUTRInput = () => (
    <div className="utr-input">
      <h3>NEFT/RTGS Payment</h3>
      {renderOrderSummary(true)}
      <p>Your order has been placed successfully. Please complete the NEFT/RTGS transfer using the following details:</p>
      <div className="bank-details">
        <p>Account Name: Your Company Name</p>
        <p>Account Number: 1234567890</p>
        <p>IFSC Code: ABCD0001234</p>
        <p>Bank Name: Your Bank Name</p>
        <p>Branch: Your Branch Name</p>
      </div>
      <form onSubmit={handleUTRSubmit}>
        <input
          type="text"
          value={utrCode}
          onChange={(e) => setUtrCode(e.target.value)}
          placeholder="Enter UTR Code"
          required
        />
        <button type="submit">Confirm Payment</button>
      </form>
    </div>
  );

  const renderOrderComplete = () => (
    <div className="order-complete">
      <h2>Order Complete!</h2>
      <p>Your order has been successfully placed.</p>
      <p>Order ID: {orderId}</p>
      {renderOrderSummary(true)}
      {paymentMethod === 'neft_rtgs' && (
        <p>We will verify your payment with the provided UTR code: {utrCode}</p>
      )}
      {paymentMethod === 'cod' && (
        <p>Please pay ${totalAmount.toFixed(2)} to the delivery person upon receiving your order.</p>
      )}
      <button onClick={() => window.print()}>Print Invoice</button>
    </div>
  );

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleCustomerCreated = (newCustomer) => {
    setUserInfo({
      email: newCustomer.email,
      phoneNumber: newCustomer.phoneNumber,
      address: newCustomer.address || '',
      _id: newCustomer._id
    });
    setCustomerVerified(true);
    setShowCreateCustomer(false);
    message.success('Customer created successfully');
  };

  return (
    <div className="shopping-cart-container">
      <h2>Your Shopping Cart</h2>
      {cart.length === 0 ? (
        <p className="empty-cart-message">Your cart is empty</p>
      ) : (
        <>
          {renderCartItems()}
          {renderOrderSummary()}
          <div className="customer-form-container">
            <h3>Customer Information</h3>
            <CreateCustomerForm 
              onCustomerCreated={handleCustomerCreated}
              initialPhoneNumber={phoneNumber}
            />
          </div>
          {customerVerified && (
            <>
              {!showQR && renderCheckoutForm()}
              {showQR && renderUPIPayment()}
            </>
          )}
          {showUTRInput && renderUTRInput()}
          {orderComplete && renderOrderComplete()}
        </>
      )}
    </div>
  );
};

export default ShoppingCart;
