import { message, Checkbox, Input, Button, Select, Tabs } from 'antd';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const { Option } = Select;
const { TabPane } = Tabs;

function PiecesTab() {
  const [pieces, setPieces] = useState([]);
  const [incompleteSales, setIncompleteSales] = useState([]);
  const [batchNoFilter, setBatchNoFilter] = useState('');
  const [productNameFilter, setProductNameFilter] = useState('');
  const [showUnsoldOnly, setShowUnsoldOnly] = useState(false);
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [warehouses, setWarehouses] = useState([]);
  const [showPartiallySold, setShowPartiallySold] = useState(false);

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
      let endpoint = showPartiallySold 
        ? 'http://localhost:5001/api/pieces/incomplete-sales'
        : 'http://localhost:5001/api/pieces';

      const response = await axios.get(endpoint, {
        params: {
          batchNo: batchNoFilter,
          productName: productNameFilter,
          unsoldOnly: showUnsoldOnly.toString(),
          warehouseId: warehouseFilter
        }
      });
      
      setPieces(showPartiallySold ? response.data : response.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Failed to fetch data');
    }
  }, [batchNoFilter, productNameFilter, showUnsoldOnly, warehouseFilter, showPartiallySold]);

  useEffect(() => {
    fetchPieces();
  }, [fetchPieces]);

  const AllPiecesTable = () => (
    pieces && pieces.length > 0 ? (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
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
            {showPartiallySold && (
              <>
                <th>Total Area</th>
                <th>Sold Area</th>
                <th>Remaining Area</th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {pieces.map((piece) => (
            <tr key={piece._id || piece.pieceNo}>
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
              {showPartiallySold && (
                <>
                  <td>{piece.totalArea}</td>
                  <td>{piece.soldArea}</td>
                  <td>{piece.remainingArea}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p>No pieces found. Try adjusting your filter criteria.</p>
    )
  );

  return (
    <div className="pieces-section">
      <h2>Pieces</h2>
      <div className="filter-inputs" style={{ marginBottom: '20px' }}>
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
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Checkbox
            checked={showUnsoldOnly}
            onChange={(e) => {
              setShowUnsoldOnly(e.target.checked);
              if (e.target.checked) setShowPartiallySold(false);
            }}
          >
            Show Unsold Only
          </Checkbox>
          <Checkbox
            checked={showPartiallySold}
            onChange={(e) => {
              setShowPartiallySold(e.target.checked);
              if (e.target.checked) setShowUnsoldOnly(false);
            }}
          >
            Show Partially Sold Only
          </Checkbox>
          <Button onClick={fetchPieces} type="primary">
            Filter
          </Button>
        </div>
      </div>
      <AllPiecesTable />
    </div>
  );
}

export default PiecesTab;
