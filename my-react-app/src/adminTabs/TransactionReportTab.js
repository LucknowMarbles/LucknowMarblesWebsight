import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, message } from 'antd';

function TransactionReportTab() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/transactions/report');
      setTransactions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      message.error('Failed to fetch transactions');
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'Related Party',
      dataIndex: ['relatedParty', 'name'],
      key: 'relatedParty',
    },
    {
      title: 'Party Type',
      dataIndex: 'partyType',
      key: 'partyType',
    },
    {
      title: 'Invoice Number',
      dataIndex: ['invoice', 'billNumber'],
      key: 'invoice',
    },
    {
      title: 'Invoice Type',
      dataIndex: 'invoiceType',
      key: 'invoiceType',
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
    },
  ];

  return (
    <div className="transaction-report">
      <h2>Transaction Report</h2>
      <Table 
        dataSource={transactions} 
        columns={columns} 
        rowKey="_id"
        loading={loading}
      />
    </div>
  );
}

export default TransactionReportTab;