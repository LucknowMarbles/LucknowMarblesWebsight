import {  message } from 'antd';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';


function PiecesTab() {
  const [pieces, setPieces] = useState([]);
  const [batchNoFilter, setBatchNoFilter] = useState('');
  const [productNameFilter, setproductNameFilter] = useState('');
  const fetchPieces = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/pieces', {
        params: {
          batchNo: batchNoFilter,
          productName: productNameFilter
        }
      });
      setPieces(response.data.data);
    } catch (error) {
      console.error('Error fetching pieces:', error);
      message.error('Failed to fetch pieces');
    }
  }, [batchNoFilter, productNameFilter]);

  useEffect(() => {
    fetchPieces();
  }, [batchNoFilter, productNameFilter, fetchPieces]);

  return (
    <div className="pieces-section">
      <h2>Pieces</h2>
      <div className="filter-inputs">
        <input
          type="text"
          placeholder="Batch No"
          value={batchNoFilter}
          onChange={(e) => setBatchNoFilter(e.target.value)}
        />
        <input
          type="text"
          placeholder="Product ID"
          value={productNameFilter}
          onChange={(e) => setproductNameFilter(e.target.value)}
        />
        <button onClick={fetchPieces}>Filter</button>
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