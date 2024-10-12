import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Select, InputNumber, Button, AutoComplete, Checkbox, Table, Modal } from 'antd';
import { Autocomplete } from '@react-google-maps/api';
import UploadExcel from '../components/UploadExcel';

const { Option } = Select;

function UploadSaleTab() {
  const [saleEntryMethod, setSaleEntryMethod] = useState('excel');
  const [manualSaleData, setManualSaleData] = useState({
    customerId: '',
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    freight: 0,
    gstPercent: 18,
    status: 'Pending',
    items: [{ pieceId: '', pieceNo: '', saleLength: 0, saleWidth: 0, saleAreaPerPiece: 0, pricePerUnitArea: 0 }]
  });
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [availablePieces, setAvailablePieces] = useState([]);
  const [shippingAddressInput, setShippingAddressInput] = useState('');
  const [billingAddressInput, setBillingAddressInput] = useState('');
  const [shippingCityInput, setShippingCityInput] = useState('');
  const [billingCityInput, setBillingCityInput] = useState('');
  const [autocomplete, setAutocomplete] = useState(null);
  const [selectedPieces, setSelectedPieces] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
  });
  const [sameAsBilling, setSameAsBilling] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      fetchBatches(selectedProduct);
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (selectedBatch) {
      fetchPieces(selectedBatch);
    }
  }, [selectedBatch]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchBatches = async (productId) => {
    try {
      const response = await axios.get(`http://localhost:5001/api/pieces/unique-batches/${productId}`);
      setBatches(response.data.data);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const fetchPieces = async (batchNo) => {
    try {
      const response = await axios.get(`http://localhost:5001/api/pieces/batch/${batchNo}`);
      setAvailablePieces(response.data.data);
    } catch (error) {
      console.error('Error fetching pieces:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/users/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleProductChange = (productId) => {
    setSelectedProduct(productId);
    setSelectedBatch(null);
    setManualSaleData(prevData => ({
      ...prevData,
      items: []
    }));
  };

  const handleBatchChange = (value) => {
    setSelectedBatch(value);
    setSelectedPieces([]);
    setManualSaleData(prevData => ({
      ...prevData,
      items: []
    }));
  };

  const handlePieceSelect = (pieceId, checked) => {
    if (checked) {
      setSelectedPieces(prev => [...prev, pieceId]);
      setManualSaleData(prevData => ({
        ...prevData,
        items: [...prevData.items, { pieceId, pieceNo: '', saleLength: 0, saleWidth: 0, saleAreaPerPiece: 0, pricePerUnitArea: 0 }]
      }));
    } else {
      setSelectedPieces(prev => prev.filter(id => id !== pieceId));
      setManualSaleData(prevData => ({
        ...prevData,
        items: prevData.items.filter(item => item.pieceId !== pieceId)
      }));
    }
  };

  const handlePieceLengthChange = (pieceId, value) => {
    setManualSaleData(prevData => ({
      ...prevData,
      items: prevData.items.map(item => 
        item.pieceId === pieceId 
          ? { ...item, saleLength: value, saleAreaPerPiece: value * item.saleWidth } 
          : item
      )
    }));
  };

  const handlePieceWidthChange = (pieceId, value) => {
    setManualSaleData(prevData => ({
      ...prevData,
      items: prevData.items.map(item => 
        item.pieceId === pieceId 
          ? { ...item, saleWidth: value, saleAreaPerPiece: item.saleLength * value } 
          : item
      )
    }));
  };

  const handleManualSaleDataChange = (field, value, index = null) => {
    if (index !== null) {
      setManualSaleData(prevData => {
        const newItems = [...prevData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        return { ...prevData, items: newItems };
      });
    } else {
      setManualSaleData(prevData => ({ ...prevData, [field]: value }));
    }
  };

  const addSaleItem = () => {
    setManualSaleData(prevData => ({
      ...prevData,
      items: [...prevData.items, { pieceId: '', pieceNo: '', saleLength: 0, saleWidth: 0, saleAreaPerPiece: 0, pricePerUnitArea: 0 }]
    }));
  };

  const removeSaleItem = (index) => {
    setManualSaleData(prevData => ({
      ...prevData,
      items: prevData.items.filter((_, i) => i !== index)
    }));
  };

  const handleManualSaleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const saleData = {
        customer: selectedCustomer,
        shippingAddress: manualSaleData.shippingAddress,
        billingAddress: sameAsBilling ? manualSaleData.shippingAddress : manualSaleData.billingAddress,
        items: manualSaleData.items.map(item => ({
          piece: item.pieceId,
          pieceNo: item.pieceNo,
          saleLength: item.saleLength,
          saleWidth: item.saleWidth,
          saleAreaPerPiece: item.saleAreaPerPiece,
          pricePerUnitArea: item.pricePerUnitArea
        })),
        freight: manualSaleData.freight,
        gstPercent: manualSaleData.gstPercent,
        status: manualSaleData.status
      };

      console.log('Sending sale data:', JSON.stringify(saleData, null, 2));

      const response = await axios.post('http://localhost:5001/api/sale/upload', saleData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Response data:', JSON.stringify(response.data, null, 2));

      alert('Sale data submitted successfully');
      // Reset the form
      setManualSaleData({
        customerId: '',
        shippingAddress: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        billingAddress: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        freight: 0,
        gstPercent: 18,
        status: 'Pending',
        items: []
      });
      setSelectedCustomer(null);
      setSelectedProduct(null);
      setSelectedBatch(null);
      setSelectedPieces([]);
      setShippingAddressInput('');
      setBillingAddressInput('');
      setShippingCityInput('');
      setBillingCityInput('');
    } catch (error) {
      console.error('Error submitting sale data:', error);
      
      // Print more detailed error information
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }

      alert('Failed to submit sale data');
    }
  };

  const fillAddressFields = (place, addressType) => {
    let street = '';
    let city = addressType === 'shipping' ? shippingCityInput : billingCityInput;
    let state = '';
    let zipCode = '';
    let country = '';

    for (const component of place.address_components) {
      const componentType = component.types[0];

      switch (componentType) {
        case 'street_number':
          street = `${component.long_name} ${street}`;
          break;
        case 'route':
          street += component.short_name;
          break;
        case 'postal_code':
          zipCode = component.long_name;
          break;
        case 'locality':
          if (!city) city = component.long_name;
          break;
        case 'administrative_area_level_1':
          state = component.long_name;
          break;
        case 'country':
          country = component.long_name;
          break;
      }
    }

    setManualSaleData(prevData => ({
      ...prevData,
      [addressType === 'shipping' ? 'shippingAddress' : 'billingAddress']: {
        street,
        city,
        state,
        zipCode,
        country
      }
    }));

    if (addressType === 'shipping') {
      setShippingAddressInput(place.formatted_address);
    } else {
      setBillingAddressInput(place.formatted_address);
    }
  };

  const handleCityChange = (e, addressType) => {
    if (addressType === 'shipping') {
      setShippingCityInput(e.target.value);
    } else {
      setBillingCityInput(e.target.value);
    }
    setManualSaleData(prevData => ({
      ...prevData,
      [addressType === 'shipping' ? 'shippingAddress' : 'billingAddress']: {
        ...prevData[addressType === 'shipping' ? 'shippingAddress' : 'billingAddress'],
        city: e.target.value
      }
    }));
  };

  const handleCustomerChange = (value) => {
    if (value === 'new') {
      setIsNewCustomer(true);
      setIsModalVisible(true);
    } else {
      setIsNewCustomer(false);
      setSelectedCustomer(value);
      const customer = customers.find(c => c._id === value);
      if (customer) {
        setManualSaleData(prevData => ({
          ...prevData,
          customerId: customer._id,
          // You might want to update other fields based on the customer data
        }));
      }
    }
  };

  const handleNewCustomerInputChange = (field, value) => {
    setNewCustomerData(prevData => ({
      ...prevData,
      [field]: value
    }));
  };

  const handleCreateNewCustomer = async () => {
    try {
      const response = await axios.post('http://localhost:5001/api/customers', newCustomerData);
      const newCustomer = response.data;
      setCustomers(prevCustomers => [...prevCustomers, newCustomer]);
      setSelectedCustomer(newCustomer._id);
      setManualSaleData(prevData => ({
        ...prevData,
        customerId: newCustomer._id,
      }));
      setIsModalVisible(false);
      setIsNewCustomer(false);
    } catch (error) {
      console.error('Error creating new customer:', error);
      alert('Failed to create new customer');
    }
  };

  const columns = [
    {
      title: 'Piece ID',
      dataIndex: 'pieceId',
      key: 'pieceId',
    },
    {
      title: 'Sale Length',
      dataIndex: 'saleLength',
      key: 'saleLength',
      render: (text, record) => (
        <InputNumber
          value={text}
          onChange={(value) => handlePieceLengthChange(record.pieceId, value)}
        />
      ),
    },
    {
      title: 'Sale Width',
      dataIndex: 'saleWidth',
      key: 'saleWidth',
      render: (text, record) => (
        <InputNumber
          value={text}
          onChange={(value) => handlePieceWidthChange(record.pieceId, value)}
        />
      ),
    },
  ];

  return (
    <div className="upload-sale-section">
      <h2>Upload Sale Data</h2>
      <Select value={saleEntryMethod} onChange={(value) => setSaleEntryMethod(value)} style={{ width: 200, marginBottom: 20 }}>
        <Option value="excel">Excel Upload</Option>
        <Option value="manual">Manual Entry</Option>
      </Select>

      {saleEntryMethod === 'excel' ? (
        <UploadExcel uploadType="sale" />
      ) : (
        <Form layout="vertical">
          <Form.Item label="Customer">
            <Select
              value={selectedCustomer}
              onChange={handleCustomerChange}
              placeholder="Select a customer"
            >
              {customers.map(customer => (
                <Option key={customer._id} value={customer._id}>{customer.name}</Option>
              ))}
              <Option value="new">Create New Customer</Option>
            </Select>
          </Form.Item>

          <h3>Shipping Address</h3>
          <Form.Item label="City">
            <Input
              value={shippingCityInput}
              onChange={(e) => handleCityChange(e, 'shipping')}
            />
          </Form.Item>
          <Form.Item label="Address">
            <Autocomplete
              onLoad={(autocomplete) => setAutocomplete(autocomplete)}
              onPlaceChanged={() => {
                if (autocomplete !== null) {
                  const place = autocomplete.getPlace();
                  fillAddressFields(place, 'shipping');
                }
              }}
              restrictions={{ country: "in" }}
              fields={['address_components', 'formatted_address', 'geometry']}
            >
              <Input
                value={shippingAddressInput}
                onChange={(e) => setShippingAddressInput(e.target.value)}
                placeholder="Enter shipping address"
              />
            </Autocomplete>
          </Form.Item>
          <Form.Item label="Street">
            <Input 
              value={manualSaleData.shippingAddress.street} 
              onChange={(e) => setManualSaleData(prevData => ({
                ...prevData,
                shippingAddress: { ...prevData.shippingAddress, street: e.target.value }
              }))} 
            />
          </Form.Item>
          <Form.Item label="State">
            <Input 
              value={manualSaleData.shippingAddress.state} 
              onChange={(e) => setManualSaleData(prevData => ({
                ...prevData,
                shippingAddress: { ...prevData.shippingAddress, state: e.target.value }
              }))} 
            />
          </Form.Item>
          <Form.Item label="Zip Code">
            <Input 
              value={manualSaleData.shippingAddress.zipCode} 
              onChange={(e) => setManualSaleData(prevData => ({
                ...prevData,
                shippingAddress: { ...prevData.shippingAddress, zipCode: e.target.value }
              }))} 
            />
          </Form.Item>
          <Form.Item label="Country">
            <Input 
              value={manualSaleData.shippingAddress.country} 
              onChange={(e) => setManualSaleData(prevData => ({
                ...prevData,
                shippingAddress: { ...prevData.shippingAddress, country: e.target.value }
              }))} 
            />
          </Form.Item>

          <Form.Item>
            <Checkbox checked={sameAsBilling} onChange={(e) => setSameAsBilling(e.target.checked)}>
              Billing address same as shipping address
            </Checkbox>
          </Form.Item>

          {!sameAsBilling && (
            <>
              <h3>Billing Address</h3>
              <Form.Item label="City">
                <Input
                  value={billingCityInput}
                  onChange={(e) => handleCityChange(e, 'billing')}
                />
              </Form.Item>
              <Form.Item label="Address">
                <Autocomplete
                  onLoad={(autocomplete) => setAutocomplete(autocomplete)}
                  onPlaceChanged={() => {
                    if (autocomplete !== null) {
                      const place = autocomplete.getPlace();
                      fillAddressFields(place, 'billing');
                    }
                  }}
                  restrictions={{ country: "in" }}
                  fields={['address_components', 'formatted_address', 'geometry']}
                >
                  <Input
                    value={billingAddressInput}
                    onChange={(e) => setBillingAddressInput(e.target.value)}
                    placeholder="Enter billing address"
                  />
                </Autocomplete>
              </Form.Item>
              <Form.Item label="Street">
                <Input 
                  value={manualSaleData.billingAddress.street} 
                  onChange={(e) => setManualSaleData(prevData => ({
                    ...prevData,
                    billingAddress: { ...prevData.billingAddress, street: e.target.value }
                  }))} 
                />
              </Form.Item>
              <Form.Item label="State">
                <Input 
                  value={manualSaleData.billingAddress.state} 
                  onChange={(e) => setManualSaleData(prevData => ({
                    ...prevData,
                    billingAddress: { ...prevData.billingAddress, state: e.target.value }
                  }))} 
                />
              </Form.Item>
              <Form.Item label="Zip Code">
                <Input 
                  value={manualSaleData.billingAddress.zipCode} 
                  onChange={(e) => setManualSaleData(prevData => ({
                    ...prevData,
                    billingAddress: { ...prevData.billingAddress, zipCode: e.target.value }
                  }))} 
                />
              </Form.Item>
              <Form.Item label="Country">
                <Input 
                  value={manualSaleData.billingAddress.country} 
                  onChange={(e) => setManualSaleData(prevData => ({
                    ...prevData,
                    billingAddress: { ...prevData.billingAddress, country: e.target.value }
                  }))} 
                />
              </Form.Item>
            </>
          )}

          <Form.Item label="Freight">
            <InputNumber
              value={manualSaleData.freight}
              onChange={(value) => handleManualSaleDataChange('freight', value)}
            />
          </Form.Item>

          <Form.Item label="GST Percent">
            <InputNumber
              value={manualSaleData.gstPercent}
              onChange={(value) => handleManualSaleDataChange('gstPercent', value)}
            />
          </Form.Item>

          <Form.Item label="Status">
            <Select
              value={manualSaleData.status}
              onChange={(value) => handleManualSaleDataChange('status', value)}
            >
              <Option value="Pending">Pending</Option>
              <Option value="Processing">Processing</Option>
              <Option value="Shipped">Shipped</Option>
              <Option value="Delivered">Delivered</Option>
              <Option value="Cancelled">Cancelled</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Product">
            <Select
              value={selectedProduct}
              onChange={(value) => handleProductChange(value)}
              placeholder="Select a product"
            >
              {products.map(product => (
                <Option key={product._id} value={product._id}>{product.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Batch">
            <Select
              value={selectedBatch}
              onChange={handleBatchChange}
              placeholder="Select a batch"
              disabled={!selectedProduct}
            >
              {batches.map(batch => (
                <Option key={batch} value={batch}>{batch}</Option>
              ))}
            </Select>
          </Form.Item>

          {selectedBatch && (
            <Form.Item label="Select Pieces">
              {availablePieces.map(piece => (
                <Checkbox
                  key={piece._id}
                  onChange={(e) => handlePieceSelect(piece._id, e.target.checked)}
                  checked={selectedPieces.includes(piece._id)}
                >
                  {piece.pieceNo}
                </Checkbox>
              ))}
            </Form.Item>
          )}

          {manualSaleData.items.length > 0 && (
            <Table
              dataSource={manualSaleData.items}
              columns={columns}
              rowKey="pieceId"
              pagination={false}
            />
          )}

          <Button onClick={handleManualSaleSubmit} type="primary" style={{ marginLeft: 10 }}>Submit Sale Data</Button>
        </Form>
      )}

      <Modal
        title="Create New Customer"
        visible={isModalVisible}
        onOk={handleCreateNewCustomer}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form layout="vertical">
          <Form.Item label="Name">
            <Input
              value={newCustomerData.name}
              onChange={(e) => handleNewCustomerInputChange('name', e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Email">
            <Input
              value={newCustomerData.email}
              onChange={(e) => handleNewCustomerInputChange('email', e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Phone Number">
            <Input
              value={newCustomerData.phoneNumber}
              onChange={(e) => handleNewCustomerInputChange('phoneNumber', e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default UploadSaleTab;