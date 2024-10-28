import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Select, InputNumber, Button, Checkbox, Table, Space } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

const { Option } = Select;

const EnquiryProductForm = ({ onProductsChange, initialProducts = [] }) => {
  const [products, setProducts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [availablePieces, setAvailablePieces] = useState([]);
  const [enquiryItems, setEnquiryItems] = useState(initialProducts);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setEnquiryItems(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    onProductsChange(enquiryItems);
  }, [enquiryItems, onProductsChange]);

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

  const handleAddProduct = () => {
    setEnquiryItems([...enquiryItems, { productId: null, isEcommerce: false, quantity: 1, batch: null, pieces: [] }]);
  };

  const handleRemoveProduct = (index) => {
    const newEnquiryItems = [...enquiryItems];
    newEnquiryItems.splice(index, 1);
    setEnquiryItems(newEnquiryItems);
  };

  const handleProductChange = async (productId, index) => {
    try {
      const response = await axios.get(`http://localhost:5001/api/products/product/${productId}`);
      const newEnquiryItems = [...enquiryItems];
      newEnquiryItems[index] = {
        productId,
        isEcommerce: response.data.isEcommerce,
        quantity: 1,
        batch: null,
        pieces: []
      };
      setEnquiryItems(newEnquiryItems);

      if (!response.data.isEcommerce) {
        fetchBatches(productId);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  const handleQuantityChange = (value, index) => {
    const newEnquiryItems = [...enquiryItems];
    newEnquiryItems[index].quantity = value;
    setEnquiryItems(newEnquiryItems);
  };

  const handleBatchChange = (value, index) => {
    const newEnquiryItems = [...enquiryItems];
    newEnquiryItems[index].batch = value;
    setEnquiryItems(newEnquiryItems);
    fetchPieces(value);
  };

  const handlePieceSelect = (pieceId, checked, index) => {
    const newEnquiryItems = [...enquiryItems];
    if (checked) {
      newEnquiryItems[index].pieces.push(pieceId);
    } else {
      newEnquiryItems[index].pieces = newEnquiryItems[index].pieces.filter(id => id !== pieceId);
    }
    setEnquiryItems(newEnquiryItems);
  };

  return (
    <Form.List name="products">
      {(fields, { add, remove }) => (
        <>
          {enquiryItems.map((item, index) => (
            <div key={index}>
              <Space style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Form.Item label="Product">
                  <Select
                    value={item.productId}
                    onChange={(value) => handleProductChange(value, index)}
                    placeholder="Select a product"
                    style={{ width: 200 }}
                  >
                    {products.map(product => (
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
                        value={item.batch}
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

                    {item.batch && (
                      <Form.Item label="Select Pieces">
                        {availablePieces.map(piece => (
                          <Checkbox
                            key={piece._id}
                            onChange={(e) => handlePieceSelect(piece._id, e.target.checked, index)}
                            checked={item.pieces.includes(piece._id)}
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
            </div>
          ))}
          <Form.Item>
            <Button type="dashed" onClick={handleAddProduct} block icon={<PlusOutlined />}>
              Add Product
            </Button>
          </Form.Item>
        </>
      )}
    </Form.List>
  );
};



export default EnquiryProductForm;
