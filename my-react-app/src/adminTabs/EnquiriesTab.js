import React, { useState, useEffect,useCallback } from 'react';
import axios from 'axios';
import { message } from 'antd';

function EnquiriesTab() {
  const [pieces, setPieces] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [batchNoFilter, setBatchNoFilter] = useState('');
  const [productNameFilter, setProductNameFilter] = useState('');
  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/enquiries/get', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEnquiries(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      setError('Failed to fetch enquiries. Please try again.');
    } finally {
      setLoading(false);
    }
  };
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="enquiries-section">
          <h2>Customer Enquiries</h2>
          {enquiries.length === 0 ? (
            <p>No enquiries found.</p>
          ) : (
            <table className="enquiries-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Message</th>
                  <th>Products</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((enquiry) => (
                  <tr key={enquiry._id}>
                    <td>{enquiry.customer.username}</td>
                    <td>{enquiry.customer.email}</td>
                    <td>{enquiry.customer.phoneNumber}</td>
                    <td>{enquiry.message}</td>
                    <td>
                      <ul className="product-list">
                        {enquiry.products.map((product, index) => (
                          <li key={index} className="product-item">
                            <strong>{product.product.name}</strong> - Quantity: {product.quantity}
                            <br />
                            Selected Batch: {product.selectedBatch}
                            <br />
                            Purposes:
                            <ul className="purpose-list">
                              {product.purposes.map((purpose, purposeIndex) => (
                                <li key={purposeIndex} className="purpose-item">
                                  <strong>{purpose.purposeOfUse}</strong>
                                  <br />
                                  Dimensions:
                                  <ul className="dimension-list">
                                    {purpose.dimension && Object.entries(purpose.dimension).map(([key, value]) => (
                                      <li key={key} className="dimension-item">
                                        {key}: {value}
                                      </li>
                                    ))}
                                  </ul>
                                </li>
                              ))}
                            </ul>
                            <br />
                            Selected Pieces:
                            <ul className="pieces-list">
                              {product.pieces.map((piece, pieceIndex) => (
                                <li key={pieceIndex} className="piece-item">
                                  Piece No: {piece}
                                  <br />
                                  Customer Length: {piece.customerLength}
                                  <br />
                                  Customer Width: {piece.customerWidth}
                                  <br />
                                  Trader Length: {piece.traderLength}
                                  <br />
                                  Trader Width: {piece.traderWidth}
                                  <br />
                                  Thickness: {piece.thickness}
                                  <br />
                                  Defective: {piece.isDefective ? 'Yes' : 'No'}
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td>{new Date(enquiry.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
  );
}

export default EnquiriesTab;