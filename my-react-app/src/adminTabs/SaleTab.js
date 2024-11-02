import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Tag, Space, Button, Modal, Descriptions, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

function SaleTab() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/sale/all');
      setSales(response.data);
      console.log(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sales:', error);
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items) => items.length,
    },    
    {
      title: 'GST',
      dataIndex: 'gstPercent',
      key: 'gst',
      render: (gst) => `${gst}%`,
    },   
    {
      title: 'Freight',
      dataIndex: 'freight',
      key: 'freight',
      render: (freight) => `₹${freight.toFixed(2)}`,
    },
    {
      title: 'Customer',
      dataIndex: ['customer', 'email'],
      key: 'customer',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => showSaleDetails(record)}>View Details</Button>
        </Space>
      ),
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'orange',
      Confirmed: 'green',
      Shipped: 'blue',
      Delivered: 'green',
      Cancelled: 'red',
    };
    return colors[status] || 'default';
  };

  const showSaleDetails = (sale) => {
    setSelectedSale(sale);
    setModalVisible(true);
  };

  const handleGenerateInvoice = async (saleId) => {
    try {
      const response = await axios.get(
        `http://localhost:5001/api/sale/generate-invoice/${saleId}`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${selectedSale.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error generating invoice:', error);
      message.error('Failed to generate invoice');
    }
  };

  return (
    <div>
      <h2>Sales</h2>
      <Table
        columns={columns}
        dataSource={sales}
        rowKey="_id"
        loading={loading}
      />
      <Modal
        title="Sale Details"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedSale && (
          <div>
            <Descriptions title="Customer Information" bordered>
              <Descriptions.Item label="Email">{selectedSale.customer.email}</Descriptions.Item>
              <Descriptions.Item label="Phone">{selectedSale.customer.phoneNumber}</Descriptions.Item>
            </Descriptions>
            <Descriptions title="Sale Information" bordered>
              <Descriptions.Item label="Status">{selectedSale.status}</Descriptions.Item>
              <Descriptions.Item label="Freight">₹{selectedSale.freight.toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="GST Percent">{selectedSale.gstPercent}%</Descriptions.Item>
              <Descriptions.Item label="Created At">{new Date(selectedSale.createdAt).toLocaleString()}</Descriptions.Item>
            </Descriptions>
            <Descriptions title="Shipping Address" bordered>
              <Descriptions.Item label="Street">{selectedSale.shippingAddress.street}</Descriptions.Item>
              <Descriptions.Item label="City">{selectedSale.shippingAddress.city}</Descriptions.Item>
              <Descriptions.Item label="State">{selectedSale.shippingAddress.state}</Descriptions.Item>
              <Descriptions.Item label="Zip Code">{selectedSale.shippingAddress.zipCode}</Descriptions.Item>
              <Descriptions.Item label="Country">{selectedSale.shippingAddress.country}</Descriptions.Item>
            </Descriptions>
            <h3>Items</h3>
            <Table
              dataSource={selectedSale.items}
              columns={[
                { 
                  title: 'Piece No', 
                  dataIndex: ['piece', 'pieceNo'], 
                  key: 'pieceNo',
                  render: (text, record) => record.piece ? record.piece.pieceNo : 'N/A'
                },
                { title: 'Length', dataIndex: 'saleLength', key: 'length' },
                { title: 'Width', dataIndex: 'saleWidth', key: 'width' },
                { title: 'Area', dataIndex: 'saleAreaPerPiece', key: 'area' },
                { title: 'Price/Unit', dataIndex: 'pricePerUnitArea', key: 'price' },
              ]}
              rowKey={(record) => record._id}
              pagination={false}
            />
            <Button 
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => handleGenerateInvoice(selectedSale._id)}
            >
              Generate Invoice
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default SaleTab;
