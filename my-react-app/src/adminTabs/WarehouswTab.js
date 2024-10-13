import React, { useState } from 'react';
import { Form, Input, InputNumber, Switch, Button, message } from 'antd';
import axios from 'axios';
import AddressForm from '../components/AddressForm';

function CreateWarehouse() {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  const onFinish = async (values) => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5001/api/warehouses', values);
      message.success('Warehouse created successfully');
      form.resetFields();
    } catch (error) {
      console.error('Error creating warehouse:', error);
      message.error('Failed to create warehouse');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressChange = (address) => {
    form.setFieldsValue({ address });
  };

  return (
    <div className="create-warehouse-container">
      <h2>Create New Warehouse</h2>
      <Form
        form={form}
        name="createWarehouse"
        onFinish={onFinish}
        layout="vertical"
      >
        <Form.Item
          name="name"
          label="Warehouse Name"
          rules={[{ required: true, message: 'Please input the warehouse name!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="address"
          label="Address"
          rules={[{ required: true, message: 'Please input the warehouse address!' }]}
        >
          <AddressForm onAddressChange={handleAddressChange} />
        </Form.Item>

        <Form.Item label="Contact Person">
          <Input.Group compact>
            <Form.Item
              name={['contactPerson', 'name']}
              noStyle
              rules={[{ required: true, message: 'Name is required' }]}
            >
              <Input style={{ width: '50%' }} placeholder="Name" />
            </Form.Item>
            <Form.Item
              name={['contactPerson', 'phone']}
              noStyle
              rules={[{ required: true, message: 'Phone is required' }]}
            >
              <Input style={{ width: '50%' }} placeholder="Phone" />
            </Form.Item>
          </Input.Group>
          <Form.Item
            name={['contactPerson', 'email']}
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>
        </Form.Item>

        <Form.Item
          name="capacity"
          label="Capacity"
          rules={[{ required: true, message: 'Please input the warehouse capacity!' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="isActive" label="Active" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Create Warehouse
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default CreateWarehouse;
