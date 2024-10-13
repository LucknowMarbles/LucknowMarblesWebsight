import { message, Checkbox, Input, Button, Select } from 'antd';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const { Option } = Select;

function PiecesTab() {
  const [pieces, setPieces] = useState([]);
  const [batchNoFilter, setBatchNoFilter] = useState('');
  const [productNameFilter, setProductNameFilter] = useState('');
  const [showUnsoldOnly, setShowUnsoldOnly] = useState(false);
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    // Fetch warehouses when component mounts
    const fetchWarehouses = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/warehouses');
        setWarehouses(response.data);
      } catch (error) {
        console.error('Error fetching warehouses:', error);
        message.error('Failed to fetch warehouses');
      }
    };

    fetchWarehouses();
  }, []);

  const fetchPieces = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/pieces', {
        params: {
          batchNo: batchNoFilter,
          productName: productNameFilter,
          unsoldOnly: showUnsoldOnly.toString(),
          warehouseId: warehouseFilter
        }
      });
      setPieces(response.data.data);
    } catch (error) {
      console.error('Error fetching pieces:', error);
      message.error('Failed to fetch pieces');
    }
  }, [batchNoFilter, productNameFilter, showUnsoldOnly, warehouseFilter]);

  useEffect(() => {
    fetchPieces();
  }, [fetchPieces]);

  return (
    <div className="pieces-section">
      <h2>Pieces</h2>
      <div className="filter-inputs">
        <Input
          placeholder="Batch No"
          value={batchNoFilter}
          onChange={(e) => setBatchNoFilter(e.target.value)}
          style={{ width: 200, marginRight: 10 }}
        />
        <Input
          placeholder="Product Name"
          value={productNameFilter}
          onChange={(e) => setProductNameFilter(e.target.value)}
          style={{ width: 200, marginRight: 10 }}
        />
        <Select
          placeholder="Select Warehouse"
          value={warehouseFilter}
          onChange={setWarehouseFilter}
          style={{ width: 200, marginRight: 10 }}
        >
          <Option value="">All Warehouses</Option>
          {warehouses.map(warehouse => (
            <Option key={warehouse._id} value={warehouse._id}>{warehouse.name}</Option>
          ))}
        </Select>
        <Checkbox
          checked={showUnsoldOnly}
          onChange={(e) => setShowUnsoldOnly(e.target.checked)}
        >
          Show Unsold Only
        </Checkbox>
        <Button onClick={fetchPieces} type="primary" style={{ marginLeft: 10 }}>Filter</Button>
      </div>
      {pieces && pieces.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Batch No</th>
              <th>Piece No</th>
              <th>Product</th>
              <th>Customer Length</th>
              <th>Customer Width</th>
              <th>Trader Length</th>
              <th>Trader Width</th>
              <th>Thickness</th>
              <th>Is Defective</th>
              <th>Purchase Id</th>
              <th>Sold</th>
              <th>Current Warehouse</th>
            </tr>
          </thead>
          <tbody>
            {pieces.map((piece) => (
              <tr key={piece._id}>
                <td>{piece.batchNo}</td>
                <td>{piece.pieceNo}</td>
                <td>{piece.productName}</td>
                <td>{piece.customerLength}</td>
                <td>{piece.customerWidth}</td>
                <td>{piece.traderLength}</td>
                <td>{piece.traderWidth}</td>
                <td>{piece.thickness}</td>
                <td>{piece.isDefective ? 'Yes' : 'No'}</td>
                <td>{piece.purchaseId}</td>
                <td>{piece.isSold ? 'Yes' : 'No'}</td>
                <td>{piece.currentWarehouse ? piece.currentWarehouse.name : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No pieces found. Try adjusting your filter criteria.</p>
      )}
    </div>
  );
}

export default PiecesTab;
