import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, message } from 'antd';
import axios from 'axios';

const { Option } = Select;

const CreateCustomerForm = ({ onCustomerCreated, initialPhoneNumber = '' }) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);

  useEffect(() => {
    form.setFieldsValue({ phoneNumber: initialPhoneNumber });
  }, [initialPhoneNumber, form]);

  const verifyPhoneNumber = async () => {
    const phoneNumber = form.getFieldValue('phoneNumber');
    console.log(phoneNumber)
    if (!phoneNumber) {
      message.error('Please enter a phone number');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await axios.get(`http://localhost:5001/api/users/verify/${phoneNumber}`);
      if (response.data) {
        message.success('Existing customer found');
        setIsPhoneVerified(true);
        setIsExistingCustomer(true);
        form.setFieldsValue(response.data);
        setShowNewCustomerForm(false);
      } else {
        message.info('Phone number not found. Please create a new account.');
        setIsPhoneVerified(true);
        setIsExistingCustomer(false);
        setShowNewCustomerForm(true);
        form.setFieldsValue({ phoneNumber: phoneNumber });
      }
    } catch (error) {
      console.error('Error verifying phone number:', error);
      message.error('Failed to verify phone number');
    } finally {
      setIsVerifying(false);
    }
  };

  const onFinish = async (values) => {
    if (!isPhoneVerified) {
      message.error('Please verify the phone number first');
      return;
    }

    setIsLoading(true);
    try {
      let response;
      if (isExistingCustomer) {
        response = await axios.put(`http://localhost:5001/api/users/${values._id}`, values);
        message.success('Customer information updated successfully');
      } else {
        response = await axios.post('http://localhost:5001/api/users/create-customer', values);
        message.success('New customer created successfully');
      }
      form.resetFields();
      onCustomerCreated(response.data);
      setShowNewCustomerForm(false);
      setIsPhoneVerified(false);
    } catch (error) {
      console.error('Error processing customer:', error);
      message.error('Failed to process customer information');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item
        name="phoneNumber"
        label="Phone Number"
        rules={[{ required: true, message: 'Please input the phone number!' }]}
      >
        <Input.Group compact>
          <Form.Item
            name="phoneNumber"
            noStyle
          >
            <Input 
              style={{ width: 'calc(100% - 100px)' }} 
              disabled={isPhoneVerified}
            />
          </Form.Item>
          <Button 
            onClick={verifyPhoneNumber} 
            loading={isVerifying}
            disabled={isPhoneVerified}
            style={{ width: '100px' }}
          >
            {isPhoneVerified ? 'Verified' : 'Verify'}
          </Button>
        </Input.Group>
      </Form.Item>

      {isExistingCustomer && (
        <>
          <p>Existing customer found. You can update your information below:</p>
          <Form.Item name="username" label="Username">
            <Input disabled />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
          <Form.Item name="_id" hidden>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Update Customer
            </Button>
          </Form.Item>
        </>
      )}

      {showNewCustomerForm && (
        <>
          <p>Create a new customer account:</p>
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please input the username!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input the email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Please select the customer type!' }]}
          >
            <Select>
              <Option value="customer">Customer</Option>
              <Option value="vendor">Vendor</Option>
            </Select>
          </Form.Item>
          <Form.Item name="_id" hidden>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Create Customer
            </Button>
          </Form.Item>
        </>
      )}
    </Form>
  );
};

export default CreateCustomerForm;
