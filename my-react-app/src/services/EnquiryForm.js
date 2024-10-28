import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../EnquiryForm.css';
import CreateCustomerForm from '../components/CreateCustomerForm';

const predefinedPurposes = [
  'Kitchen top or table',
  'Stairs',
  'Flooring',
  'Dahal'
];

const EnquiryForm = ({ selectedProducts = [], setSelectedProducts }) => {
  const [formData, setFormData] = useState({
    customerId: '', // Add this line
    username: '',
    email: '',
    phoneNumber: '',
    message: '',
    products: []
  });
  const [purpose, setPurpose] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [uniqueBatches, setUniqueBatches] = useState({});
  const [selectedBatch, setSelectedBatch] = useState('');
  const [batchPieces, setBatchPieces] = useState({});
  const [selectedPieces, setSelectedPieces] = useState({});
  const [isCustomerVerified, setIsCustomerVerified] = useState(false);

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
          pieces: [],
          product: product._id,
          quantity: 1,
          purposes: [],
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

  const addPurpose = (productIndex) => {
    setFormData(prevData => ({
      ...prevData,
      products: prevData.products.map((p, i) => 
        i === productIndex ? {
          ...p,
          purposes: [...p.purposes, { purposeOfUse: '', dimension: {} }]
        } : p
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

    // Set the purpose state (optional, you might want to remove this if it's not needed)
    setPurpose(value);
  };

  const removePurpose = (productIndex, purposeIndex) => {
    setFormData(prevData => ({
      ...prevData,
      products: prevData.products.map((p, i) => 
        i === productIndex ? {
          ...p,
          purposes: p.purposes.filter((_, j) => j !== purposeIndex)
        } : p
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const enquiryData = {
        customerId: formData.customerId, // Add this line to include the customer ID
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        message: formData.message,
        products: formData.products.map(product => ({
          ...product,
          purposes: product.purposes.map(purpose => ({
            ...purpose,
            dimension: Array.isArray(purpose.dimension) ? purpose.dimension : [purpose.dimension]
          }))
        }))
      };
      console.log('Submitting enquiry data:', JSON.stringify(enquiryData, null, 2));
      const response = await axios.post('http://localhost:5001/api/enquiries', enquiryData);
      console.log('Enquiry submitted:', response.data);
      // Reset form and show success message
      setFormData({
        customerId: '',
        username: '',
        email: '',
        phoneNumber: '',
        message: '',
        products: []
      });
      setSelectedProducts([]);
      setIsCustomerVerified(false); // Reset customer verification status
      alert('Enquiry submitted successfully!');
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
      }
      alert('Error submitting enquiry. Please try again.');
    }
  };

  const handleCustomerCreated = (customerData) => {
    console.log(1);
    setFormData(prevData => ({
      ...prevData,
      customerId: customerData.customerId, // Use customerId instead of _id
      username: customerData.username,
      email: customerData.email,
      phoneNumber: customerData.phoneNumber
    }));
    setIsCustomerVerified(true);
  };

  console.log(purpose);

  const renderDimensionInputs = (purpose, productIndex, purposeIndex) => {
    const dimension = purpose.dimension || {};
    
    switch (purpose.purposeOfUse) {
      case 'Kitchen top or table':
        return (
          <div key={purposeIndex}>
            <input
              type="number"
              placeholder="Length"
              value={dimension.length || ''}
              onChange={(e) => handlePurposeChange(productIndex, purposeIndex, 'dimension', { ...dimension, length: e.target.value })}
            />
            <input
              type="number"
              placeholder="Width"
              value={dimension.width || ''}
              onChange={(e) => handlePurposeChange(productIndex, purposeIndex, 'dimension', { ...dimension, width: e.target.value })}
            />
          </div>
        );
      case 'Stairs':
        return (
          <div key={purposeIndex}>
            <input
              type="number"
              placeholder="Riser Length"
              value={dimension.riserLength || ''}
              onChange={(e) => handlePurposeChange(productIndex, purposeIndex, 'dimension', { ...dimension, riserLength: e.target.value })}
            />
            <input
              type="number"
              placeholder="Riser Width"
              value={dimension.riserWidth || ''}
              onChange={(e) => handlePurposeChange(productIndex, purposeIndex, 'dimension', { ...dimension, riserWidth: e.target.value })}
            />
            <input
              type="number"
              placeholder="Step Length"
              value={dimension.stepLength || ''}
              onChange={(e) => handlePurposeChange(productIndex, purposeIndex, 'dimension', { ...dimension, stepLength: e.target.value })}
            />
            <input
              type="number"
              placeholder="Step Width"
              value={dimension.stepWidth || ''}
              onChange={(e) => handlePurposeChange(productIndex, purposeIndex, 'dimension', { ...dimension, stepWidth: e.target.value })}
            />
          </div>
        );
      case 'Flooring':
        return (
          <div key={purposeIndex}>
            <input
              type="number"
              placeholder="Length"
              value={dimension.length || ''}
              onChange={(e) => handlePurposeChange(productIndex, purposeIndex, 'dimension', { ...dimension, length: e.target.value })}
            />
            <input
              type="number"
              placeholder="Width"
              value={dimension.width || ''}
              onChange={(e) => handlePurposeChange(productIndex, purposeIndex, 'dimension', { ...dimension, width: e.target.value })}
            />
          </div>
        );
      case 'Dahal':
        return (
          <div key={purposeIndex}>
            <input
              type="number"
              placeholder="Width"
              value={dimension.width || ''}
              onChange={(e) => handlePurposeChange(productIndex, purposeIndex, 'dimension', { ...dimension, width: e.target.value })}
            />
            <input
              type="number"
              placeholder="Height"
              value={dimension.height || ''}
              onChange={(e) => handlePurposeChange(productIndex, purposeIndex, 'dimension', { ...dimension, height: e.target.value })}
            />
            <input
              type="number"
              placeholder="Running Fit"
              value={dimension.runningFit || ''}
              onChange={(e) => handlePurposeChange(productIndex, purposeIndex, 'dimension', { ...dimension, runningFit: e.target.value })}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const handlePieceSelection = (productId, piece, isSelected) => {
    setSelectedPieces(prevSelected => ({
      ...prevSelected,
      [productId]: {
        ...(prevSelected[productId] || {}),
        [piece._id]: isSelected
      }
    }));

    setFormData(prevData => ({
      ...prevData,
      products: prevData.products.map(product => {
        if (product.product === productId) {
          const updatedPieces = isSelected
            ? [...(product.pieces || []), piece._id]
            : (product.pieces || []).filter(p => p._id !== piece._id);
          return {
            ...product,
            pieces: updatedPieces
          };
        }
        return product;
      })
    }));
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
              <th>Select</th>
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
                <td>
                  <input
                    type="checkbox"
                    checked={selectedPieces[productId]?.[piece._id] || false}
                    onChange={(e) => handlePieceSelection(productId, piece, e.target.checked)}
                  />
                </td>
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

      {!isCustomerVerified ? (
        <CreateCustomerForm
          onCustomerCreated={handleCustomerCreated}
          initialPhoneNumber={formData.phoneNumber}
        />
      ) : (
        <>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            required
            disabled
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
            disabled
          />
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Phone Number"
            required
            disabled
          />
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Your message"
          ></textarea>
          
          {/* Rest of the form */}
        </>
      )}
      
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
            {productData.purposes.map((purposeData, purposeIndex) => (
              <div key={purposeIndex} className="purpose-section">
                <select
                  value={purposeData.purposeOfUse}
                  onChange={(e) => handlePurposeChange(productIndex, purposeIndex, 'purposeOfUse', e.target.value)}
                  required
                >
                  <option value="">Select Purpose of Use</option>
                  {predefinedPurposes.map(purpose => (
                    <option key={purpose} value={purpose}>{purpose}</option>
                  ))}
                </select>
                {renderDimensionInputs(purposeData, productIndex, purposeIndex)}
                <button type="button" onClick={() => removePurpose(productIndex, purposeIndex)}>Remove Purpose</button>
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
