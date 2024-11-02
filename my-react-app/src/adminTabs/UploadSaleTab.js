import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Select, InputNumber, Button, AutoComplete, Checkbox, Table, Modal, message, Space } from 'antd';
import { Autocomplete } from '@react-google-maps/api';
import UploadExcel from '../components/UploadExcel';
import CreateCustomerForm from '../components/CreateCustomerForm';
import AddressForm from '../components/AddressForm';
import EcommerceProductForm from '../components/EcommerceForm';
import EnquiryProductForm from '../components/EnquiryProductForm'; // Add this import
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import EnquirySelector from '../components/EnquirySelector';

const { Option } = Select;

function UploadSaleTab() {
  const indexProduct = 0; 
  const [saleEntryMethod, setSaleEntryMethod] = useState('excel');
  const [manualSaleData, setManualSaleData] = useState({
    invoiceNumber: '',
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
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [shippingAddress, setShippingAddress] = useState({});
  const [billingAddress, setBillingAddress] = useState({});
  const [isEcommerceProduct, setIsEcommerceProduct] = useState(false);
  const [saleItems, setSaleItems] = useState([]);

  useEffect(() => {
    fetchProducts();
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
      console.log(response)
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

  const handleAddProduct = () => {
    setSaleItems([...saleItems, { productId: null, isEcommerce: false, quantity: 1, pieces: [], batch: null }]);
  };
  const handleAddProductAuto = (productId, isEcommerce, quantity, pieces, batch) => {
    setSaleItems([...saleItems, { productId: productId, isEcommerce: isEcommerce, quantity: quantity, pieces: pieces, batch: batch }]);
    };

  const handleRemoveProduct = (index) => {
    const newSaleItems = [...saleItems];
    newSaleItems.splice(index, 1);
    setSaleItems(newSaleItems);
  };

  const handleProductChange = async (productId, index) => {
    try {
      const response = await axios.get(`http://localhost:5001/api/products/product/${productId}`);
      const newSaleItems = [...saleItems];
      newSaleItems[index] = {
        productId,
        isEcommerce: response.data.isEcommerce,
        quantity: 1,
        pieces: []
      };
      setSaleItems(newSaleItems);

      if (!response.data.isEcommerce) {
        fetchBatches(productId);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      message.error('Failed to fetch product details');
    }
  };

  const handleQuantityChange = (value, index) => {
    const newSaleItems = [...saleItems];
    newSaleItems[index].quantity = value;
    setSaleItems(newSaleItems);
  };

  const handleBatchChange = (value, index) => {
    setSelectedBatch(value);
    fetchPieces(value);
  };

  const handlePieceSelect = (piece, checked, index) => {
    const newSaleItems = [...saleItems];
    if (checked) {
      newSaleItems[index].pieces.push({ pieceId: piece._id, pieceNo: piece.pieceNo, saleLength: piece.customerLength, saleWidth: piece.customerWidth, saleAreaPerPiece: piece.customerLength*piece.customerWidth/144, pricePerUnitArea: piece.pricePerUnitArea });
    } else {
      newSaleItems[index].pieces = newSaleItems[index].pieces.filter(piece => piece.pieceId !== piece._id);
    }
    setSaleItems(newSaleItems);
  };
  /*
  const handlePieceLengthChange = (pieceId, value, index) => {
    const newSaleItems = [...saleItems];
    const piece = newSaleItems[index].pieces.find(p => p.pieceId === pieceId);
    if (piece) {
      piece.saleLength = value;
      piece.saleAreaPerPiece = value * piece.saleWidth;
    }
    setSaleItems(newSaleItems);
  };

  const handlePieceWidthChange = (pieceId, value, index) => {
    const newSaleItems = [...saleItems];
    const piece = newSaleItems[index].pieces.find(p => p.pieceId === pieceId);
    if (piece) {
      piece.saleWidth = value;
      piece.saleAreaPerPiece = piece.saleLength * value;
    }
    setSaleItems(newSaleItems);
  };
*/
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
        invoiceNumber: manualSaleData.invoiceNumber,
        customer: manualSaleData.customerId,
        shippingAddress: manualSaleData.shippingAddress,
        billingAddress: sameAsBilling ? manualSaleData.shippingAddress : manualSaleData.billingAddress,
        items: saleItems.flatMap(item => 
          item.isEcommerce 
            ? [{ product: item.productId, quantity: item.quantity }]
            : item.pieces.map(piece => ({
              pieceNo: piece.pieceNo,
              piece: piece.pieceId,
              saleLength: piece.saleLength,
              saleWidth: piece.saleWidth,
              saleAreaPerPiece:piece.saleLength*piece.saleWidth/144,
              pricePerUnitArea: 0
              }))
        ),
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

  const handleCustomerCreated = (newCustomer) => {
    setManualSaleData(prevData => ({
      ...prevData,
      customerId: newCustomer._id,
    }));
  };

  const handleShippingAddressChange = (address) => {
    setShippingAddress(address);
    setManualSaleData(prevData => ({
      ...prevData,
      shippingAddress: address
    }));
  };

  const handleBillingAddressChange = (address) => {
    setBillingAddress(address);
    setManualSaleData(prevData => ({
      ...prevData,
      billingAddress: address
    }));
  };

  const handleProductsChange = (updatedProducts) => {
    setSaleItems(updatedProducts);
  };

  const handleEnquirySelect = async (enquiry) => {
    try {
      console.log(enquiry);
      // Set customer details
      setManualSaleData(prevData => ({
        ...prevData,
        customerId: enquiry.customer._id,
      }));

      // Set addresses
      setShippingAddress(enquiry.customer.shippingAddress || {});
      setBillingAddress(enquiry.customer.billingAddress || {});
      console.log(enquiry.products)
      // Transform enquiry products to sale items
      const transformedItems = await Promise.all(enquiry.products.map(async (product, index) => {
        // Fetch product details to check if it's an e-commerce product
        //handleProductChange(product.productId, index)
        
        handleAddProductAuto(product._id, product.isEcommerce, product.quantity || 1, 
          product.pieces.map(piece => ({
            pieceId: piece._id,
            pieceNo: piece.pieceNo,
            saleLength: piece.customerLength || 0,
            saleWidth: piece.customerWidth || 0,
            saleAreaPerPiece: (piece.customerLength * piece.customerWidth)/144 || 0,
            pricePerUnitArea: 0
          })),
          product.selectedBatch
        );
      }));


      message.success('Enquiry data loaded successfully');
    } catch (error) {
      console.error('Error loading enquiry data:', error);
      message.error('Failed to load enquiry data');
    }
  };

  const columns = [
    {
      title: 'Piece No',
      dataIndex: 'pieceNo',
      key: 'pieceNo',
    },
    {
      title: 'Length',
      dataIndex: 'saleLength',
      key: 'saleLength',
      render: (text, record, rowIndex) => (
        <InputNumber
          min={0}
          value={text}
          onChange={(value) => handlePieceLengthChange(record.pieceId, value, rowIndex)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Width',
      dataIndex: 'saleWidth',
      key: 'saleWidth',
      render: (text, record, rowIndex) => (
        <InputNumber
          min={0}
          value={text}
          onChange={(value) => handlePieceWidthChange(record.pieceId, value, rowIndex)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Area (sq.ft)',
      dataIndex: 'saleAreaPerPiece',
      key: 'saleAreaPerPiece',
      render: (text) => text.toFixed(2)
    },
    {
      title: 'Price/sq.ft',
      dataIndex: 'pricePerUnitArea',
      key: 'pricePerUnitArea',
      render: (text, record, rowIndex) => (
        <InputNumber
          min={0}
          value={text}
          onChange={(value) => handlePiecePriceChange(record.pieceId, value, rowIndex)}
          style={{ width: '100%' }}
          formatter={value => `₹ ${value}`}
          parser={value => value.replace(/₹\s?|(,*)/g, '')}
        />
      ),
    },
    {
      title: 'Total Price',
      key: 'totalPrice',
      render: (_, record) => (
        <span>₹ {(record.saleAreaPerPiece * record.pricePerUnitArea).toFixed(2)}</span>
      ),
    }
  ];

  const handlePieceLengthChange = (pieceId, value, index) => {
    setSaleItems(prevItems => {
      return prevItems.map(item => {
        if (item.pieces.some(p => p.pieceId === pieceId)) {
          return {
            ...item,
            pieces: item.pieces.map(piece => {
              if (piece.pieceId === pieceId) {
                const newArea = (value * piece.saleWidth) / 144; // Convert to sq.ft
                return {
                  ...piece,
                  saleLength: value,
                  saleAreaPerPiece: newArea
                };
              }
              return piece;
            })
          };
        }
        return item;
      });
    });
  };

  const handlePieceWidthChange = (pieceId, value, index) => {
    setSaleItems(prevItems => {
      return prevItems.map(item => {
        if (item.pieces.some(p => p.pieceId === pieceId)) {
          return {
            ...item,
            pieces: item.pieces.map(piece => {
              if (piece.pieceId === pieceId) {
                const newArea = (piece.saleLength * value) / 144; // Convert to sq.ft
                return {
                  ...piece,
                  saleWidth: value,
                  saleAreaPerPiece: newArea
                };
              }
              return piece;
            })
          };
        }
        return item;
      });
    });
  };

  const handlePiecePriceChange = (pieceId, value, index) => {
    setSaleItems(prevItems => {
      return prevItems.map(item => {
        if (item.pieces.some(p => p.pieceId === pieceId)) {
          return {
            ...item,
            pieces: item.pieces.map(piece => {
              if (piece.pieceId === pieceId) {
                return {
                  ...piece,
                  pricePerUnitArea: value
                };
              }
              return piece;
            })
          };
        }
        return item;
      });
    });
  };

  return (
    <div className="upload-sale-section">
      <h2>Upload Sale Data</h2>
        <Form layout="vertical">
          <CreateCustomerForm onCustomerCreated={handleCustomerCreated} />

          <h3>Shipping Address</h3>
          <AddressForm onAddressChange={handleShippingAddressChange} />

          <Form.Item>
            <Checkbox checked={sameAsBilling} onChange={(e) => setSameAsBilling(e.target.checked)}>
              Billing address same as shipping address
            </Checkbox>
          </Form.Item>

          {!sameAsBilling && (
            <>
              <h3>Billing Address</h3>
              <AddressForm onAddressChange={handleBillingAddressChange} />
            </>
          )}
          <Form.Item label="Invoice Number">
            <InputNumber
              value={manualSaleData.invoiceNumber}
              onChange={(value) => handleManualSaleDataChange('invoiceNumber', value)}
            />
          </Form.Item>

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

          <h3>E-commerce Products</h3>
          <EcommerceProductForm />

          <h3>Non E-commerce Products</h3>
          {/*
          <EnquiryProductForm 
            onProductsChange={handleProductsChange}
            initialProducts={saleItems}
          />
          */}

          <Form.Item label="Select Enquiry">
            <EnquirySelector onEnquirySelect={handleEnquirySelect} />
          </Form.Item>

          {saleItems.map((item, index) => (
            <div key={index}>
              <Space style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Form.Item label="Product">
                  <Select
                    value={item.productId}
                    onChange={(value) => handleProductChange(value, index)}
                    placeholder="Select a product"
                    style={{ width: 200 }}
                  >
                    {products.map((product) => (
                      <Option key={product._id} value={product._id}>{product.name}</Option>
                    ))}
                  </Select>
                </Form.Item>

                {item.isEcommerce ? (
                  <Form.Item label="Quantity">
                    <InputNumber
                      min={1}
                      value={item.quantity}
                      onChange={(value) => handleQuantityChange(value, index)}
                    />
                  </Form.Item>
                ) : (
                     
                  <>
                    <Form.Item label="Batch">
                      <Select
                        value={item.batchNo}
                        onChange={(value) => handleBatchChange(value, index)}
                        placeholder="Select a batch"
                        disabled={!item.productId}
                        style={{ width: 200 }}
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
                            onChange={(e) => handlePieceSelect(piece, e.target.checked, index)}
                            checked={item.pieces.some(p => p.pieceId === piece._id)}
                          >
                            {piece.pieceNo}
                          </Checkbox>
                        ))}
                      </Form.Item>
                    )}
                      
                  </>
                )}
      
                <MinusCircleOutlined onClick={() => handleRemoveProduct(index)} />
              </Space>

              {!item.isEcommerce && item.pieces.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <Table
                    dataSource={item.pieces}
                    columns={columns}
                    rowKey="pieceId"
                    pagination={false}
                  />
                </div>
              )}
            </div>
          ))}

          <Form.Item>
            <Button type="dashed" onClick={handleAddProduct} block icon={<PlusOutlined />}>
              Add Product
            </Button>
            
          </Form.Item>
          
          <Button onClick={handleManualSaleSubmit} type="primary" style={{ marginLeft: 10 }}>Submit Sale Data</Button>
        </Form>
  
    </div>
  
  );
}

export default UploadSaleTab;
