import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EnquiryForm = ({ selectedProducts = [] }) => {
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
          purposeOfUse: '',
          dimensions: []
        }))
      }));
    }
  }, [selectedProducts]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProductChange = (index, field, value) => {
    setFormData(prevData => ({
      ...prevData,
      products: prevData.products.map((p, i) => 
        i === index ? { ...p, [field]: value } : p
      )
    }));
  };

  const handlePurposeChange = (index, value) => {
    handleProductChange(index, 'purposeOfUse', value);
    handleProductChange(index, 'dimensions', []);
  };

  const addDimension = (productIndex) => {
    setFormData(prevData => ({
      ...prevData,
      products: prevData.products.map((p, i) => 
        i === productIndex ? { ...p, dimensions: [...p.dimensions, {}] } : p
      )
    }));
  };

  const updateDimension = (productIndex, dimensionIndex, field, value) => {
    setFormData(prevData => ({
      ...prevData,
      products: prevData.products.map((p, i) => 
        i === productIndex ? {
          ...p,
          dimensions: p.dimensions.map((d, j) => 
            j === dimensionIndex ? { ...d, [field]: value } : d
          )
        } : p
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
      alert('Enquiry submitted successfully!');
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      alert('Error submitting enquiry. Please try again.');
    }
  };

  const renderDimensionInputs = (productIndex, purposeOfUse, dimensions) => {
    switch (purposeOfUse) {
      case 'Kitchen top or table':
        return dimensions.map((dim, index) => (
          <div key={index}>
            <input
              type="number"
              placeholder="Length"
              value={dim.length || ''}
              onChange={(e) => updateDimension(productIndex, index, 'length', e.target.value)}
            />
            <input
              type="number"
              placeholder="Width"
              value={dim.width || ''}
              onChange={(e) => updateDimension(productIndex, index, 'width', e.target.value)}
            />
          </div>
        ));
      case 'Stairs':
        return (
          <div>
            <input
              type="number"
              placeholder="Riser Length"
              value={dimensions[0]?.riserLength || ''}
              onChange={(e) => updateDimension(productIndex, 0, 'riserLength', e.target.value)}
            />
            <input
              type="number"
              placeholder="Riser Width"
              value={dimensions[0]?.riserWidth || ''}
              onChange={(e) => updateDimension(productIndex, 0, 'riserWidth', e.target.value)}
            />
            <input
              type="number"
              placeholder="Step Length"
              value={dimensions[0]?.stepLength || ''}
              onChange={(e) => updateDimension(productIndex, 0, 'stepLength', e.target.value)}
            />
            <input
              type="number"
              placeholder="Step Width"
              value={dimensions[0]?.stepWidth || ''}
              onChange={(e) => updateDimension(productIndex, 0, 'stepWidth', e.target.value)}
            />
          </div>
        );
      case 'Flooring':
        return (
          <div>
            <input
              type="number"
              placeholder="Length"
              value={dimensions[0]?.length || ''}
              onChange={(e) => updateDimension(productIndex, 0, 'length', e.target.value)}
            />
            <input
              type="number"
              placeholder="Width"
              value={dimensions[0]?.width || ''}
              onChange={(e) => updateDimension(productIndex, 0, 'width', e.target.value)}
            />
          </div>
        );
      case 'Dahal':
        return dimensions.map((dim, index) => (
          <div key={index}>
            <input
              type="number"
              placeholder="Width"
              value={dim.width || ''}
              onChange={(e) => updateDimension(productIndex, index, 'width', e.target.value)}
            />
            <input
              type="number"
              placeholder="Height"
              value={dim.height || ''}
              onChange={(e) => updateDimension(productIndex, index, 'height', e.target.value)}
            />
            <input
              type="number"
              placeholder="Running Fit"
              value={dim.runningFit || ''}
              onChange={(e) => updateDimension(productIndex, index, 'runningFit', e.target.value)}
            />
          </div>
        ));
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
      {formData.products.map((productData, index) => {
        const product = selectedProducts.find(p => p._id === productData.product);
        return (
          <div key={index} className="selected-product">
            <p>{product.name} - ${product.price}</p>
            <input
              type="number"
              min="1"
              value={productData.quantity}
              onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value))}
            />
            <select 
              value={productData.purposeOfUse} 
              onChange={(e) => handlePurposeChange(index, e.target.value)}
              required
            >
              <option value="">Select Purpose of Use</option>
              <option value="Kitchen top or table">Kitchen top or table</option>
              <option value="Stairs">Stairs</option>
              <option value="Flooring">Flooring</option>
              <option value="Dahal">Dahal</option>
            </select>
            {productData.purposeOfUse && (
              <div>
                <h4>Dimensions</h4>
                {renderDimensionInputs(index, productData.purposeOfUse, productData.dimensions)}
                {(productData.purposeOfUse === 'Kitchen top or table' || productData.purposeOfUse === 'Dahal') && (
                  <button type="button" onClick={() => addDimension(index)}>Add Another Piece</button>
                )}
              </div>
            )}
          </div>
        );
      })}

      <button type="submit" className="submit-enquiry-btn">Submit Enquiry</button>
    </form>
  );
};

export default EnquiryForm;
