import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Button, message } from 'antd';
import axios from 'axios';

const { Option, OptGroup } = Select;

function CreateTransactionTab() {
  const [form] = Form.useForm();
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomersAndVendors();
  }, []);

  const fetchCustomersAndVendors = async () => {
    try {
      const [customersResponse, vendorsResponse] = await Promise.all([
        axios.get('http://localhost:5001/api/customers'),
        axios.get('http://localhost:5001/api/vendors')
      ]);
      setCustomers(customersResponse.data);
      setVendors(vendorsResponse.data);
    } catch (error) {
      console.error('Error fetching customers and vendors:', error);
      message.error('Failed to fetch customers and vendors');
    }
  };

  const fetchInvoices = async (partyId, partyType) => {
    try {
      const response = await axios.get(`http://localhost:5001/api/transactions/invoices`, {
        params: { partyId, partyType }
      });
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      message.error('Failed to fetch invoices');
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const [partyId, partyType] = values.relatedParty.split('|');
      const transactionData = {
        ...values,
        relatedParty: partyId,
        partyType: partyType,
        date: values.date.toISOString()
      };
      await axios.post('http://localhost:5001/api/transactions', transactionData);
      message.success('Transaction created successfully');
      form.resetFields();
    } catch (error) {
      console.error('Error creating transaction:', error);
      message.error('Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  const onPartyChange = (value) => {
    const [partyId, partyType] = value.split('|');
    fetchInvoices(partyId, partyType);
    form.setFieldsValue({ invoice: undefined });
  };

  return (
    <div className="create-transaction-container">
      <h2>Create New Transaction</h2>
      <Form
        form={form}
        name="createTransaction"
        onFinish={onFinish}
        layout="vertical"
      >
        <Form.Item
          name="date"
          label="Transaction Date"
          rules={[{ required: true, message: 'Please select the transaction date' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="type"
          label="Transaction Type"
          rules={[{ required: true, message: 'Please select the transaction type' }]}
        >
          <Select>
            <Option value="Payment">Payment</Option>
            <Option value="Receipt">Receipt</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="amount"
          label="Amount"
          rules={[{ required: true, message: 'Please enter the amount' }]}
        >
          <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
        </Form.Item>

        <Form.Item
          name="relatedParty"
          label="Related Party"
          rules={[{ required: true, message: 'Please select the related party' }]}
        >
          <Select onChange={onPartyChange}>
            <Option value="" disabled>Select a party</Option>
            <OptGroup label="Customers">
              {customers.map(customer => (
                <Option key={`${customer._id}|Customer`} value={`${customer._id}|Customer`}>{customer.name}</Option>
              ))}
            </OptGroup>
            <OptGroup label="Vendors">
              {vendors.map(vendor => (
                <Option key={`${vendor._id}|Vendor`} value={`${vendor._id}|Vendor`}>{vendor.name}</Option>
              ))}
            </OptGroup>
          </Select>
        </Form.Item>

        <Form.Item
          name="invoice"
          label="Related Invoice"
        >
          <Select>
            <Option value="">No related invoice</Option>
            {invoices.map(invoice => (
              <Option key={invoice._id} value={invoice._id}>{invoice.invoiceNumber}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="notes"
          label="Notes"
        >
          <Input.TextArea />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Create Transaction
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default CreateTransactionTab;
