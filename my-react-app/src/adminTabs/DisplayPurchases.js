import React, { useState, useEffect } from 'react';
import { Table, Tag, Card, Button, Space, Modal, message } from 'antd';
import { EyeOutlined, FileTextOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const DisplayPurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [purchasePieces, setPurchasePieces] = useState([]);
  const [loadingPieces, setLoadingPieces] = useState(false);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5001/api/pieces/purchases');
      setPurchases(response.data.data);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      message.error('Failed to fetch purchases');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (purchase) => {
    setSelectedPurchase(purchase);
    setIsModalVisible(true);
    
    // Fetch pieces for this purchase
    setLoadingPieces(true);
    try {
      const response = await axios.get(`http://localhost:5001/api/pieces/purchase/${purchase._id}`);
      setPurchasePieces(response.data);
    } catch (error) {
      console.error('Error fetching purchase pieces:', error);
      message.error('Failed to fetch purchase pieces');
    } finally {
      setLoadingPieces(false);
    }
  };

  const handleGenerateInvoice = async (purchaseId) => {
    try {
      const response = await axios.get(
        `http://localhost:5001/api/pieces/generate-invoice/${purchaseId}`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${purchaseId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error generating invoice:', error);
      message.error('Failed to generate invoice');
    }
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'Paid': 'green',
      'Pending': 'red',
      'Partial': 'orange'
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Purchase Date',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      render: (date) => moment(date).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.purchaseDate).unix() - moment(b.purchaseDate).unix()
    },
    {
      title: 'Supplier',
      dataIndex: 'supplier',
      key: 'supplier',
    },
    {
      title: 'Bill Number',
      dataIndex: 'billNumber',
      key: 'billNumber',
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `₹${amount.toLocaleString()}`,
      sorter: (a, b) => a.totalAmount - b.totalAmount
    },
    {
      title: 'Payment Status',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status) => (
        <Tag color={getPaymentStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Paid', value: 'Paid' },
        { text: 'Pending', value: 'Pending' },
        { text: 'Partial', value: 'Partial' }
      ],
      onFilter: (value, record) => record.paymentStatus === value
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            View
          </Button>
          <Button 
            icon={<FileTextOutlined />}
            onClick={() => handleGenerateInvoice(record._id)}
          >
            Invoice
          </Button>
        </Space>
      )
    }
  ];

  // Group pieces by batch number
  const groupPiecesByBatch = (pieces) => {
    return pieces.reduce((groups, piece) => {
      const batchNo = piece.batchNo;
      if (!groups[batchNo]) {
        groups[batchNo] = [];
      }
      groups[batchNo].push(piece);
      return groups;
    }, {});
  };

  const batchColumns = [
    {
      title: 'Product',
      dataIndex: ['productId', 'name'],
      key: 'product'
    },
    {
      title: 'Piece No',
      dataIndex: 'pieceNo',
      key: 'pieceNo'
    },
    {
      title: 'Customer Dimensions',
      key: 'customerDimensions',
      render: (_, record) => (
        `${record.customerLength} × ${record.customerWidth}`
      )
    },
    {
      title: 'Trader Dimensions',
      key: 'traderDimensions',
      render: (_, record) => (
        `${record.traderLength} × ${record.traderWidth}`
      )
    },
    {
      title: 'Thickness',
      dataIndex: 'thickness',
      key: 'thickness'
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        if (record.soldArea > 0) {
          const totalArea = record.customerLength * record.customerWidth;
          const isSoldOut = record.soldArea >= totalArea;
          return (
            <Tag color={isSoldOut ? 'red' : 'orange'}>
              {isSoldOut ? 'Sold Out' : 'Partially Sold'}
            </Tag>
          );
        }
        return <Tag color="green">Available</Tag>;
      }
    },
    {
      title: 'Current Warehouse',
      dataIndex: ['currentWarehouse', 'name'],
      key: 'warehouse'
    },
    {
      title: 'Is Defective',
      key: 'isDefective',
      render: (_, record) => (
        <Tag color={record.isDefective ? 'red' : 'green'}>
          {record.isDefective ? 'Yes' : 'No'}
        </Tag>
      )
    }
  ];

  const PurchaseDetailsModal = () => {
    const groupedPieces = groupPiecesByBatch(purchasePieces);
    
    return (
      <Modal
        title="Purchase Details"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setPurchasePieces([]);
        }}
        width={1200}
        footer={[
          <Button key="close" onClick={() => {
            setIsModalVisible(false);
            setPurchasePieces([]);
          }}>
            Close
          </Button>
        ]}
      >
        {selectedPurchase && (
          <div className="space-y-4">
            <Card title="Basic Information" className="mb-4">
              <p><strong>Purchase Date:</strong> {moment(selectedPurchase.purchaseDate).format('DD/MM/YYYY')}</p>
              <p><strong>Supplier:</strong> {selectedPurchase.supplier}</p>
              <p><strong>Bill Number:</strong> {selectedPurchase.billNumber}</p>
              <p><strong>Total Amount:</strong> ₹{selectedPurchase.totalAmount.toLocaleString()}</p>
              <p><strong>Payment Status:</strong> {selectedPurchase.paymentStatus}</p>
              <p><strong>Payment Method:</strong> {selectedPurchase.paymentMethod}</p>
              {selectedPurchase.notes && <p><strong>Notes:</strong> {selectedPurchase.notes}</p>}
            </Card>

            {/* E-commerce Products Section */}
            {selectedPurchase.ecommerceProducts?.length > 0 && (
              <Card title="E-commerce Products" className="mb-4">
                <Table
                  dataSource={selectedPurchase.ecommerceProducts}
                  columns={[
                    {
                      title: 'Product',
                      dataIndex: ['product', 'name'],
                      key: 'product'
                    },
                    {
                      title: 'Quantity',
                      dataIndex: 'quantity',
                      key: 'quantity'
                    },
                    {
                      title: 'Warehouse',
                      dataIndex: ['warehouse', 'name'],
                      key: 'warehouse'
                    }
                  ]}
                  pagination={false}
                  rowKey={(record) => record.product._id}
                />
              </Card>
            )}

            {/* Enquiry Products Batches Section */}
            {Object.entries(groupedPieces).length > 0 && (
              <Card title="Enquiry Products by Batch" className="mb-4">
                {loadingPieces ? (
                  <div className="text-center py-4">Loading pieces...</div>
                ) : (
                  Object.entries(groupedPieces).map(([batchNo, pieces]) => (
                    <div key={batchNo} className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">
                          Batch: {batchNo}
                        </h3>
                        <Space>
                          <Tag color="blue">{pieces.length} pieces</Tag>
                          <Tag color="green">
                            {pieces.filter(p => !p.isDefective).length} Good
                          </Tag>
                          <Tag color="red">
                            {pieces.filter(p => p.isDefective).length} Defective
                          </Tag>
                        </Space>
                      </div>
                      <Table
                        dataSource={pieces}
                        columns={batchColumns}
                        pagination={false}
                        rowKey="_id"
                        size="small"
                        scroll={{ x: true }}
                      />
                    </div>
                  ))
                )}
              </Card>
            )}
          </div>
        )}
      </Modal>
    );
  };

  return (
    <div className="p-6">
      <Card title="Purchase History" className="shadow-md">
        <Table
          columns={columns}
          dataSource={purchases}
          rowKey="_id"
          loading={loading}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} purchases`
          }}
        />
        <PurchaseDetailsModal />
      </Card>
    </div>
  );
};

export default DisplayPurchases; 