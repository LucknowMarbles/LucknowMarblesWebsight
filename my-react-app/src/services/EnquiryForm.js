import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../EnquiryForm.css';

const predefinedPurposes = [
  'Kitchen top or table',
  'Stairs',
  'Flooring',
  'Dahal'
];

const EnquiryForm = ({ selectedProducts = [], setSelectedProducts }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    message: '',
    products: []
  });

  useEffect(() => {
    if (selectedProducts.length > 0) {
      setFormData(prevData => ({
        ...prevData,
        products: selectedProducts.map(product => ({
          product: product._id,
          quantity: 1,
          purposes: product.purposes || []
        }))
      }));
    }
  }, [selectedProducts]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProductQuantityChange = (productId, quantity) => {
    setFormData(prevData => ({
      ...prevData,
      products: prevData.products.map(p => 
        p.product === productId ? { ...p, quantity: parseInt(quantity) } : p
      )
    }));
  };

  const handlePurposeChange = (productIndex, purposeIndex, field, value) => {
    setFormData(prevData => ({
      ...prevData,
      products: prevData.products.map((p, i) => 
        i === productIndex ? {
          ...p,
          purposes: p.purposes.map((purpose, j) => 
            j === purposeIndex ? { ...purpose, [field]: value } : purpose
          )
        } : p
      )
    }));
  };

  const addPurpose = (productIndex) => {
    setFormData(prevData => ({
      ...prevData,
      products: prevData.products.map((p, i) => 
        i === productIndex ? { ...p, purposes: [...p.purposes, { purposeOfUse: '', dimensions: { length: '', width: '', height: '' } }] } : p
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5001/api/enquiries', formData);
      console.log('Enquiry submitted:', response.data);
      // Reset form
      setFormData({
        username: '',
        email: '',
        phoneNumber: '',
        message: '',
        products: []
      });
      setSelectedProducts([]);
      alert('Enquiry submitted successfully!');
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      alert('Error submitting enquiry. Please try again.');
    }
  };

  const renderDimensionInputs = (purpose, productIndex, purposeIndex) => {
    switch (purpose.purposeOfUse) {
      case 'Kitchen top or table':
        return (
          <div key={purposeIndex}>
            <input
              type="number"
              placeholder="Length"
              value={purpose.dimensions.length || ''}
              onChange={(e) => handlePurposeChange(productIndex, purposeIndex, 'dimensions', { ...purpose.dimensions, length: e.target.value })}
            />
            <input
              type="number"
              placeholder="Width"
              value={purpose.dimensions.width || ''}
              onChange={(e) => handlePurposeChange(productIndex, purposeIndex, 'dimensions', { ...purpose.dimensions, width: e.target.value })}
            />
          </div>
        );
      case 'Stairs':
        return (
          <div key={purposeIndex}>
            <input
              type="number"
              placeholder="Riser Length"
              value={purpose.dimensions.riserLength || ''}
              onChange={(e) => handlePurposeChange(productIndex, purposeIndex, 'dimensions', { ...purpose.dimensions, riserLength: e.target.value })}
            />
            <input
              type="number"
              placeholder="Riser Width"
              value={purpose.dimensions.riserWidth || ''}
              onChange={(e) => handlePurposeChange(productIndex, purposeIndex, 'dimensions', { ...purpose.dimensions, riserWidth: e.target.value })}
            />
            <input
              type="number"
              placeholder="Step Length"
              value={purpose.dimensions.stepLength || ''}
              onChange={(e) => handlePurposeChange(productIndex, purposeIndex, 'dimensions', { ...purpose.dimensions, stepLength: e.target.value })}
            />
            <input
              type="number"
              placeholder="Step Width"
              value={purpose.dimensions.stepWidth || ''}
              onChange={(e) => handlePurposeChange(productIndex, purposeIndex, 'dimensions', { ...purpose.dimensions, stepWidth: e.target.value })}
            />
          </div>
        );
      case 'Flooring':
        return (
          <div key={purposeIndex}>
            <input
              type="number"
              placeholder="Length"
              value={purpose.dimensions.length || ''}
              onChange={(e) => handlePurposeChange(productIndex, purposeIndex, 'dimensions', { ...purpose.dimensions, length: e.target.value })}
            />
            <input
              type="number"
              placeholder="Width"
              value={purpose.dimensions.width || ''}
              onChange={(e) => handlePurposeChange(productIndex, purposeIndex, 'dimensions', { ...purpose.dimensions, width: e.target.value })}
            />
          </div>
        );
      case 'Dahal':
        return (
          <div key={purposeIndex}>
            <input
              type="number"
              placeholder="Width"
              value={purpose.dimensions.width || ''}
              onChange={(e) => handlePurposeChange(productIndex, purposeIndex, 'dimensions', { ...purpose.dimensions, width: e.target.value })}
            />
            <input
              type="number"
              placeholder="Height"
              value={purpose.dimensions.height || ''}
              onChange={(e) => handlePurposeChange(productIndex, purposeIndex, 'dimensions', { ...purpose.dimensions, height: e.target.value })}
            />
            <input
              type="number"
              placeholder="Running Fit"
              value={purpose.dimensions.runningFit || ''}
              onChange={(e) => handlePurposeChange(productIndex, purposeIndex, 'dimensions', { ...purpose.dimensions, runningFit: e.target.value })}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="enquiry-form">
      <h2>Get a Quote</h2>
      <input
        type="text"
        name="username"
        value={formData.username}
        onChange={handleChange}
        placeholder="Username"
        required
      />
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        required
      />
      <input
        type="tel"
        name="phoneNumber"
        value={formData.phoneNumber}
        onChange={handleChange}
        placeholder="Phone Number"
        required
      />
      <textarea
        name="message"
        value={formData.message}
        onChange={handleChange}
        placeholder="Your message"
      ></textarea>
      
      <h3>Selected Products</h3>
      {formData.products.map((productData, productIndex) => {
        const product = selectedProducts.find(p => p._id === productData.product);
        return (
          <div key={productIndex} className="selected-product">
            <p>{product.name} - ${product.price}</p>
            <input
              type="number"
              min="1"
              value={productData.quantity}
              onChange={(e) => handleProductQuantityChange(productData.product, e.target.value)}
            />
            <h4>Purposes</h4>
            {productData.purposes.map((purpose, purposeIndex) => (
              <div key={purposeIndex} className="purpose-section">
                <select
                  value={purpose.purposeOfUse}
                  onChange={(e) => handlePurposeChange(productIndex, purposeIndex, 'purposeOfUse', e.target.value)}
                  required
                >
                  <option value="">Select Purpose of Use</option>
                  {predefinedPurposes.map(purpose => (
                    <option key={purpose} value={purpose}>{purpose}</option>
                  ))}
                </select>
                {renderDimensionInputs(purpose, productIndex, purposeIndex)}
              </div>
            ))}
            <button type="button" className="add-purpose-btn" onClick={() => addPurpose(productIndex)}>Add Another Purpose</button>
          </div>
        );
      })}
      
      <button type="submit" className="submit-enquiry-btn">Submit Enquiry</button>
    </form>
  );
};

export default EnquiryForm;
