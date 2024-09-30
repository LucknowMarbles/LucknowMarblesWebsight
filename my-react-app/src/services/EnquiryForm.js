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
    const [selectedProduct, setSelectedProduct] = useState('');
    const [uniqueBatches, setUniqueBatches] = useState({});
    const [selectedBatch, setSelectedBatch] = useState('');
    const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    message: '',
    products: []
  });
  const [batchPieces, setBatchPieces] = useState({});
  const fetchUniqueBatches = async (productId) => {
    try {
      const response = await axios.get(`http://localhost:5001/api/pieces/unique-batches/${productId}`);
      setUniqueBatches(prevBatches => ({
        ...prevBatches,
        [productId]: response.data.data
      }));
    } catch (error) {
      console.error('Error fetching unique batches:', error);
    }
  };
  const handleProductChange = (e) => {
    const productId = e.target.value;
    setSelectedProduct(productId);
    setSelectedBatch(''); // Reset selected batch when product changes
    if (productId) {
      fetchUniqueBatches(productId);
    } else {
      setUniqueBatches({});
    }
  };
  useEffect(() => {
    if (selectedProducts.length > 0) {
      setFormData(prevData => ({
        ...prevData,
        products: selectedProducts.map(product => ({
          product: product._id,
          quantity: 1,
          purposes: product.purposes || [],
          selectedBatch: ''
        }))
      }));
      selectedProducts.forEach(product => fetchUniqueBatches(product._id));
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

  const fetchPiecesByBatch = async (productId, batchNo) => {
    try {
      const response = await axios.get(`http://localhost:5001/api/pieces/batch/${batchNo}`);
      setBatchPieces(prevPieces => ({
        ...prevPieces,
        [productId]: response.data.data
      }));
    } catch (error) {
      console.error('Error fetching pieces for batch:', error);
    }
  };

  const handleBatchChange = (productId, batch) => {
    setFormData(prevData => ({
      ...prevData,
      products: prevData.products.map(p => 
        p.product === productId ? { ...p, selectedBatch: batch } : p
      )
    }));
    if (batch) {
      fetchPiecesByBatch(productId, batch);
    }
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

  const renderBatchPieces = (productId) => {
    const pieces = batchPieces[productId];
    if (!pieces || pieces.length === 0) return null;

    return (
      <div className="batch-pieces">
        <h5>Available Pieces:</h5>
        <table>
          <thead>
            <tr>
              <th>Piece No</th>
              <th>Customer Length</th>
              <th>Customer Width</th>
              <th>Trader Length</th>
              <th>Trader Width</th>
              <th>Thickness</th>
              <th>Defective</th>
            </tr>
          </thead>
          <tbody>
            {pieces.map(piece => (
              <tr key={piece._id}>
                <td>{piece.pieceNo}</td>
                <td>{piece.customerLength}</td>
                <td>{piece.customerWidth}</td>
                <td>{piece.traderLength}</td>
                <td>{piece.traderWidth}</td>
                <td>{piece.thickness}</td>
                <td>{piece.isDefective ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
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
            
            <div>
              <label htmlFor={`batch-${productData.product}`}>Batch:</label>
              <select
                id={`batch-${productData.product}`}
                value={productData.selectedBatch}
                onChange={(e) => handleBatchChange(productData.product, e.target.value)}
                required
              >
                <option value="">Select a batch</option>
                {uniqueBatches[productData.product] && uniqueBatches[productData.product].map((batch) => (
                  <option key={batch} value={batch}>
                    {batch}
                  </option>
                ))}
              </select>
            </div>
            
            {renderBatchPieces(productData.product)}
            
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