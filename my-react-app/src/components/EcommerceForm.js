import React, { useState, useEffect } from 'react';
import { Form, Select, InputNumber, Button, Space } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const EcommerceProductForm = ({ onProductsChange }) => {
  const [ecommerceProducts, setEcommerceProducts] = useState([]);

  useEffect(() => {
    fetchEcommerceProducts();
  }, []);

  const fetchEcommerceProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/products/ecommerce');
      setEcommerceProducts(response.data);
    } catch (error) {
      console.error('Error fetching e-commerce products:', error);
    }
  };

  return (
    <Form.List name="ecommerceProducts">
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, fieldKey, ...restField }) => (
            <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
              <Form.Item
                {...restField}
                name={[name, 'productId']}
                fieldKey={[fieldKey, 'productId']}
                rules={[{ required: true, message: 'Please select a product' }]}
              >
                <Select style={{ width: 200 }} placeholder="Select e-commerce product">
                  {ecommerceProducts.map(product => (
                    <Option key={product._id} value={product._id}>{product.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                {...restField}
                name={[name, 'quantity']}
                fieldKey={[fieldKey, 'quantity']}
                rules={[{ required: true, message: 'Please input quantity' }]}
              >
                <InputNumber min={1} placeholder="Quantity" />
              </Form.Item>
              <MinusCircleOutlined onClick={() => remove(name)} />
            </Space>
          ))}
          <Form.Item>
            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
              Add E-commerce Product
            </Button>
          </Form.Item>
        </>
      )}
    </Form.List>
  );
};

export default EcommerceProductForm;