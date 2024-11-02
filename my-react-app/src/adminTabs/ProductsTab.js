import React, { useState } from 'react';
import axios from 'axios';
import { Form, Input, InputNumber, Upload, Select, Switch, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import AIContentGenerator from '../components/AIContentGenerator';

const { TextArea } = Input;
const { Option } = Select;

function ProductsTab() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleAIContent = (contentType, content) => {
    switch (contentType) {
      case 'description':
        form.setFieldsValue({ description: content });
        break;
      case 'seo':
        try {
          const seoContent = content.split('\n');
          const metaTitle = seoContent.find(line => line.startsWith('Meta title:'))?.replace('Meta title:', '').trim();
          const metaDescription = seoContent.find(line => line.startsWith('Meta description:'))?.replace('Meta description:', '').trim();
          const keywords = seoContent.find(line => line.startsWith('Focus keywords:'))?.replace('Focus keywords:', '').trim();
          
          form.setFieldsValue({
            metaTitle,
            metaDescription,
            tags: keywords
          });
        } catch (error) {
          console.error('Error parsing SEO content:', error);
          message.error('Failed to parse SEO content');
        }
        break;
      case 'features':
        form.setFieldsValue({ features: content });
        break;
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/products', values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('Product added successfully');
      form.resetFields();
    } catch (error) {
      console.error('Error adding product:', error);
      message.error('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="max-w-4xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Form.Item
              name="name"
              label="Product Name"
              rules={[{ required: true, message: 'Please enter product name' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please enter description' }]}
            >
              <TextArea rows={4} />
            </Form.Item>

            <AIContentGenerator
              onContentGenerated={handleAIContent}
              productData={form.getFieldsValue()}
            />

            <Form.Item
              name="price"
              label="Price"
              rules={[{ required: true, message: 'Please enter price' }]}
            >
              <InputNumber
                className="w-full"
                formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/₹\s?|(,*)/g, '')}
              />
            </Form.Item>

            <Form.Item
              name="quantity"
              label="Quantity"
              rules={[{ required: true, message: 'Please enter quantity' }]}
            >
              <InputNumber className="w-full" min={0} />
            </Form.Item>
          </div>

          <div>
            <Form.Item
              name="imageUrl"
              label="Product Image"
              rules={[{ required: true, message: 'Please upload an image' }]}
            >
              <Upload
                name="image"
                listType="picture"
                maxCount={1}
                action="http://localhost:5001/api/upload"
                headers={{ Authorization: `Bearer ${localStorage.getItem('token')}` }}
              >
                <Button icon={<UploadOutlined />}>Upload Image</Button>
              </Upload>
            </Form.Item>

            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Please select category' }]}
            >
              <Select>
                <Option value="furniture">Furniture</Option>
                <Option value="electronics">Electronics</Option>
                <Option value="clothing">Clothing</Option>
                {/* Add more categories as needed */}
              </Select>
            </Form.Item>

            <Form.Item
              name="tags"
              label="Tags"
            >
              <Select mode="tags" placeholder="Enter tags">
                <Option value="new">New</Option>
                <Option value="featured">Featured</Option>
                <Option value="sale">Sale</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="isEcommerce"
              label="E-commerce Product"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="metaTitle"
              label="Meta Title"
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="metaDescription"
              label="Meta Description"
            >
              <TextArea rows={2} />
            </Form.Item>
          </div>
        </div>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            className="w-full md:w-auto"
          >
            Add Product
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default ProductsTab;