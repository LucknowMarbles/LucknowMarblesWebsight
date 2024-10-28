import React, { useState, useEffect } from 'react';
import { Form, Select, Button, message, Table } from 'antd';
import axios from 'axios';
import ProductSelectionForm from '../components/ProductSelectionForm';

const { Option } = Select;

function TransferTab() {
  const [form] = Form.useForm();
  const [transferType, setTransferType] = useState('Piece');
  const [warehouses, setWarehouses] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProductData, setSelectedProductData] = useState(null);

  useEffect(() => {
    fetchWarehouses();
    fetchTransfers();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/warehouses');
      setWarehouses(response.data);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      message.error('Failed to fetch warehouses');
    }
  };

  const fetchTransfers = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/transfers');
      setTransfers(response.data);
    } catch (error) {
      console.error('Error fetching transfers:', error);
      message.error('Failed to fetch transfers');
    }
  };

  const handleProductsSelected = (productData) => {
    setSelectedProductData(productData);
    const newTransferType = productData.product.isEcommerce ? 'Bulk' : 'Piece';
    setTransferType(newTransferType);
    form.setFieldsValue({
      productId: productData.product._id,
      quantity: productData.quantity,
      pieceIds: productData.pieces,
    });
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const endpoint = transferType === 'Bulk' ? '/api/transfers/bulk' : '/api/transfers/piece';
      const transferData = {
        ...values,
        transferType,
        productId: selectedProductData.product._id,
        quantity: selectedProductData.quantity,
        pieceIds: selectedProductData.pieces,
      };
      console.log(transferData);
      await axios.post(`http://localhost:5001${endpoint}`, transferData);
      message.success('Transfer created successfully');
      form.resetFields();
      setSelectedProductData(null);
      fetchTransfers();
    } catch (error) {
      console.error('Error creating transfer:', error);
      message.error('Failed to create transfer');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Transfer Type', dataIndex: 'transferType', key: 'transferType' },
    { title: 'From Warehouse', dataIndex: ['fromWarehouse', 'name'], key: 'fromWarehouse' },
    { title: 'To Warehouse', dataIndex: ['toWarehouse', 'name'], key: 'toWarehouse' },
    { title: 'Product', dataIndex: ['product', 'name'], key: 'product' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
  ];

  return (
    <div className="transfer-tab">
      <h2>Create Transfer</h2>
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item name="fromWarehouse" label="From Warehouse" rules={[{ required: true }]}>
          <Select placeholder="Select source warehouse">
            {warehouses.map(warehouse => (
              <Option key={warehouse._id} value={warehouse._id}>{warehouse.name}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="toWarehouse" label="To Warehouse" rules={[{ required: true }]}>
          <Select placeholder="Select destination warehouse">
            {warehouses.map(warehouse => (
              <Option key={warehouse._id} value={warehouse._id}>{warehouse.name}</Option>
            ))}
          </Select>
        </Form.Item>

        <ProductSelectionForm 
          onProductsSelected={handleProductsSelected} 
          transferType={transferType}
        />

        {selectedProductData && (
          <div>
            <h3>Selected Product Details</h3>
            <p>Product: {selectedProductData.product.name}</p>
            <p>Transfer Type: {transferType}</p>
            <p>Batch: {selectedProductData.batch}</p>
            <p>Quantity: {selectedProductData.quantity}</p>
            {transferType === 'Piece' && (
              <p>Selected Pieces: {selectedProductData.pieces.length}</p>
            )}
          </div>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} disabled={!selectedProductData}>
            Create Transfer
          </Button>
        </Form.Item>
      </Form>

      <h2>Recent Transfers</h2>
      <Table columns={columns} dataSource={transfers} rowKey="_id" />
    </div>
  );
}

export default TransferTab;
