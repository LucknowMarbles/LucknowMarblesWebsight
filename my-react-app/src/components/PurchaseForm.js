import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Button, DatePicker, message, Upload, Select, InputNumber } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

const PurchaseForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
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
      message.error('Failed to fetch e-commerce products');
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('purchaseDate', values.purchaseDate.toISOString());
      formData.append('vendorName', values.vendorName);
      formData.append('billNo', values.billNo);
      formData.append('file', fileList[0].originFileObj);
      formData.append('ecommerceProducts', JSON.stringify(values.ecommerceProducts));

      await axios.post('http://localhost:5001/api/pieces/upload-purchase', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      message.success('Purchase data uploaded successfully');
      form.resetFields();
      setFileList([]);
    } catch (error) {
      console.error('Error uploading purchase data:', error);
      message.error('Failed to upload purchase data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = ({ fileList }) => {
    setFileList(fileList);
  };

  return (
    <Form form={form} onFinish={onFinish} layout="vertical">
      <Form.Item name="purchaseDate" label="Purchase Date" rules={[{ required: true }]}>
        <DatePicker />
      </Form.Item>
      <Form.Item name="vendorName" label="Vendor Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="billNo" label="Bill Number" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item 
        name="file" 
        label="Upload Pieces Excel"
        rules={[{ required: true, message: 'Please upload an Excel file' }]}
      >
        <Upload
          accept=".xlsx, .xls"
          fileList={fileList}
          onChange={handleFileChange}
          beforeUpload={() => false}
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>Click to Upload Excel</Button>
        </Upload>
      </Form.Item>

      <Form.List name="ecommerceProducts">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, fieldKey, ...restField }) => (
              <div key={key} style={{ display: 'flex', marginBottom: 8 }}>
                <Form.Item
                  {...restField}
                  name={[name, 'product']}
                  fieldKey={[fieldKey, 'product']}
                  rules={[{ required: true, message: 'Missing product' }]}
                  style={{ width: '60%', marginRight: 8 }}
                >
                  <Select placeholder="Select e-commerce product">
                    {ecommerceProducts.map(product => (
                      <Option key={product._id} value={product._id}>{product.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'quantity']}
                  fieldKey={[fieldKey, 'quantity']}
                  rules={[{ required: true, message: 'Missing quantity' }]}
                  style={{ width: '30%' }}
                >
                  <InputNumber min={1} placeholder="Quantity" />
                </Form.Item>
                <Button onClick={() => remove(name)} style={{ marginLeft: 8 }}>Delete</Button>
              </div>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                Add E-commerce Product
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Submit Purchase
        </Button>
      </Form.Item>
    </Form>
  );
};

export default PurchaseForm;
