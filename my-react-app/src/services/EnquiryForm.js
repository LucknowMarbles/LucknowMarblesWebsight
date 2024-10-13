import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';
import { Form, Input, Select, Button, Checkbox, Modal, message, Space } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import CreateCustomerForm from '../components/CreateCustomerForm';

const { Option } = Select;

const predefinedPurposes = ['Flooring', 'Wall Cladding', 'Countertop', 'Other'];

const EnquiryForm = forwardRef(({ selectedProducts = [], setSelectedProducts }, ref) => {
  const [formData, setFormData] = useState({
    customerId: '',
    products: [],
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (selectedProducts.length > 0) {
      setFormData(prevData => ({
        ...prevData,
        products: selectedProducts
      }));
    }
  }, [selectedProducts]);

  useImperativeHandle(ref, () => ({
    handleGetQuote: (product) => {
      setSelectedProducts(prevSelected => {
        if (prevSelected.find(p => p._id === product._id)) {
          return prevSelected;
        }
        return [...prevSelected, { ...product, purposes: [] }];
      });
    }
  }));

  const handleCustomerCreated = (newCustomer) => {
    setFormData(prevData => ({
      ...prevData,
      customerId: newCustomer._id
    }));
    setIsModalVisible(false);
  };

  const handlePurposeChange = (productIndex, purposeIndex, field, value) => {
    setFormData(prevData => ({
      ...prevData,
      products: prevData.products.map((product, pIndex) => {
        if (pIndex === productIndex) {
          const updatedPurposes = [...product.purposes];
          updatedPurposes[purposeIndex] = {
            ...updatedPurposes[purposeIndex],
            [field]: value
          };
          return { ...product, purposes: updatedPurposes };
        }
        return product;
      })
    }));
  };

  const addPurpose = (productIndex) => {
    setFormData(prevData => ({
      ...prevData,
      products: prevData.products.map((product, pIndex) => {
        if (pIndex === productIndex) {
          return {
            ...product,
            purposes: [...product.purposes, { purposeOfUse: '', dimension: {} }]
          };
        }
        return product;
      })
    }));
  };

  const removePurpose = (productIndex, purposeIndex) => {
    setFormData(prevData => ({
      ...prevData,
      products: prevData.products.map((product, pIndex) => {
        if (pIndex === productIndex) {
          const updatedPurposes = product.purposes.filter((_, index) => index !== purposeIndex);
          return { ...product, purposes: updatedPurposes };
        }
        return product;
      })
    }));
  };

  const renderDimensionInputs = (purpose, productIndex, purposeIndex) => {
    const dimension = purpose.dimension || {};
    switch (purpose.purposeOfUse) {
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
      case 'Wall Cladding':
        return (
          <div key={purposeIndex}>
            <input
              type="number"
              placeholder="Height"
              value={dimension.height || ''}
              onChange={(e) => handlePurposeChange(productIndex, purposeIndex, 'dimension', { ...dimension, height: e.target.value })}
            />
            <input
              type="number"
              placeholder="Width"
              value={dimension.width || ''}
              onChange={(e) => handlePurposeChange(productIndex, purposeIndex, 'dimension', { ...dimension, width: e.target.value })}
            />
          </div>
        );
      case 'Countertop':
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
            <input
              type="number"
              placeholder="Thickness"
              value={dimension.thickness || ''}
              onChange={(e) => handlePurposeChange(productIndex, purposeIndex, 'dimension', { ...dimension, thickness: e.target.value })}
            />
          </div>
        );
      case 'Other':
        return (
          <div key={purposeIndex}>
            <input
              type="text"
              placeholder="Specify dimensions"
              value={dimension.custom || ''}
              onChange={(e) => handlePurposeChange(productIndex, purposeIndex, 'dimension', { custom: e.target.value })}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5001/api/enquiries/create', formData);
      console.log('Enquiry submitted:', response.data);
      message.success('Enquiry submitted successfully');
      // Reset form or redirect user
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      message.error('Failed to submit enquiry');
    }
  };

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Item label="Phone Number">
        <Input
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          placeholder="Enter phone number"
        />
      </Form.Item>

      <Button onClick={() => setIsModalVisible(true)}>
        Create New Customer
      </Button>

      {formData.products.map((productData, productIndex) => (
        <div key={productIndex} className="selected-product">
          <h4>Product: {productData.name || productData.productId}</h4>
          <p>Quantity: {productData.quantity}</p>
          {productData.batch && <p>Batch: {productData.batch}</p>}
          {productData.pieces && productData.pieces.length > 0 && (
            <p>Selected Pieces: {productData.pieces.join(', ')}</p>
          )}
          
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
      ))}
      
      <Form.Item>
        <Button type="primary" htmlType="submit" disabled={!formData.customerId}>
          Submit Enquiry
        </Button>
      </Form.Item>

      <Modal
        title="Create New Customer"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <CreateCustomerForm 
          onCustomerCreated={handleCustomerCreated} 
          initialPhoneNumber={phoneNumber}
        />
      </Modal>
    </Form>
  );
});

export default EnquiryForm;