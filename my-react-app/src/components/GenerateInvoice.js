import React, { useState } from 'react';
import axios from 'axios';

const GenerateInvoice = () => {
  const [purchaseId, setPurchaseId] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateInvoice = async () => {
    if (!purchaseId) {
      setError('Please enter a Purchase ID');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const response = await axios.get(`http://localhost:5001/api/invoices/generate-invoice/${purchaseId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'invoice.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setGenerating(false);
    } catch (error) {
      setGenerating(false);
      setError('Error generating invoice. Please try again.');
      console.error('Error generating invoice:', error);
    }
  };

  return (
    <div className="generate-invoice">
      <input 
        type="text" 
        value={purchaseId} 
        onChange={(e) => setPurchaseId(e.target.value)}
        placeholder="Enter Purchase ID"
      />
      <button onClick={handleGenerateInvoice} disabled={generating}>
        {generating ? 'Generating...' : 'Generate Invoice'}
      </button>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default GenerateInvoice;