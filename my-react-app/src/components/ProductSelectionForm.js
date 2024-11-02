import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Select, Checkbox, InputNumber, Button, Table, Space } from 'antd';

const { Option } = Select;

const ProductSelectionForm = ({ onProductsSelected, transferType }) => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [pieces, setPieces] = useState([]);
  const [selectedPieces, setSelectedPieces] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchWarehouses();
  }, []);

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
      setLoading(true);
      const params = new URLSearchParams({
        batchNo,
        ...(selectedWarehouse && { warehouseId: selectedWarehouse })
      });
      
      const response = await axios.get(
        `http://localhost:5001/api/pieces/batch/${batchNo}?${params}`
      );
      setPieces(response.data.data);
    } catch (error) {
      console.error('Error fetching pieces:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/warehouses');
      setWarehouses(response.data);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  const handleProductChange = (value) => {
    const product = products.find(p => p._id === value);
    setSelectedProduct(product);
    setSelectedBatch(null);
    setPieces([]);
    setSelectedPieces([]);
    setQuantity(1);
    if (!product.isEcommerce) {
      fetchBatches(value);
    }
    onProductsSelected({
      product,
      batch: null,
      pieces: [],
      quantity: 1
    });
  };

  const handleBatchChange = (value) => {
    setSelectedBatch(value);
    setSelectedPieces([]);
    fetchPieces(value);
  };

  const handlePieceSelection = (pieceId, checked) => {
    let newSelectedPieces;
    if (checked) {
      newSelectedPieces = [...selectedPieces, pieceId];
    } else {
      newSelectedPieces = selectedPieces.filter(id => id !== pieceId);
    }
    setSelectedPieces(newSelectedPieces);
    
    if (!selectedProduct.isEcommerce) {
      const selectedPiecesData = pieces.filter(piece => newSelectedPieces.includes(piece._id));
      const calculatedQuantity = selectedPiecesData.reduce((sum, piece) => {
        return sum + (piece.customerLength * piece.customerWidth) / 144;
      }, 0);
      setQuantity(Math.round(calculatedQuantity * 100) / 100); // Round to 2 decimal places
    }
  };

  const handleWarehouseChange = (value) => {
    setSelectedWarehouse(value);
    if (selectedBatch) {
      fetchPieces(selectedBatch);
    }
  };

  const handleSubmit = () => {
    onProductsSelected({
      product: selectedProduct,
      batch: selectedProduct.isEcommerce ? null : selectedBatch,
      pieces: selectedPieces,
      quantity: quantity,
      warehouse: selectedWarehouse
    });
  };

  const columns = [
    {
      title: 'Select',
      dataIndex: '_id',
      key: 'select',
      render: (id) => (
        <Checkbox
          onChange={(e) => handlePieceSelection(id, e.target.checked)}
          checked={selectedPieces.includes(id)}
        />
      ),
    },
    { title: 'Piece No', dataIndex: 'pieceNo', key: 'pieceNo' },
    { title: 'Customer Length', dataIndex: 'customerLength', key: 'customerLength' },
    { title: 'Customer Width', dataIndex: 'customerWidth', key: 'customerWidth' },
    { title: 'Trader Length', dataIndex: 'traderLength', key: 'traderLength' },
    { title: 'Trader Width', dataIndex: 'traderWidth', key: 'traderWidth' },
    { title: 'Thickness', dataIndex: 'thickness', key: 'thickness' },
    { 
      title: 'Defective', 
      dataIndex: 'isDefective', 
      key: 'isDefective',
      render: (isDefective) => isDefective ? 'Yes' : 'No'
    },
    {
      title: 'Warehouse',
      dataIndex: ['currentWarehouse', 'name'],
      key: 'warehouse',
    }
  ];

  return (
    <Form layout="vertical">
      <Space direction="vertical" className="w-full">
        <Form.Item label="Select Product">
          <Select 
            value={selectedProduct?._id} 
            onChange={handleProductChange}
            placeholder="Select a product"
          >
            {products.map(product => (
              <Option key={product._id} value={product._id}>{product.name}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Select Warehouse">
          <Select
            value={selectedWarehouse}
            onChange={handleWarehouseChange}
            placeholder="Select a warehouse"
          >
            {warehouses.map(warehouse => (
              <Option key={warehouse._id} value={warehouse._id}>
                {warehouse.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {selectedProduct && !selectedProduct.isEcommerce && (
          <Form.Item label="Select Batch">
            <Select 
              value={selectedBatch} 
              onChange={handleBatchChange}
              placeholder="Select a batch"
              disabled={!selectedWarehouse}
            >
              {batches.map(batch => (
                <Option key={batch} value={batch}>{batch}</Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {selectedProduct && (
          <>
            {selectedProduct.isEcommerce ? (
              <Form.Item label="Quantity">
                <InputNumber
                  value={quantity}
                  onChange={(value) => setQuantity(value)}
                  min={1}
                  disabled={!selectedWarehouse}
                />
              </Form.Item>
            ) : selectedBatch && (
              <>
                <Form.Item label="Select Pieces">
                  <Table
                    dataSource={pieces}
                    columns={columns}
                    rowKey="_id"
                    pagination={false}
                    scroll={{ y: 240 }}
                    loading={loading}
                  />
                </Form.Item>
                <Form.Item label="Calculated Quantity">
                  <InputNumber value={quantity} disabled />
                </Form.Item>
              </>
            )}

            <Form.Item>
              <Button 
                type="primary" 
                onClick={handleSubmit} 
                disabled={
                  !selectedWarehouse || 
                  (!selectedProduct.isEcommerce && selectedPieces.length === 0) ||
                  (selectedProduct.isEcommerce && !quantity)
                }
              >
                Add to Transfer
              </Button>
            </Form.Item>
          </>
        )}
      </Space>
    </Form>
  );
};

export default ProductSelectionForm;
