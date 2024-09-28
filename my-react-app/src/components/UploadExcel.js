import React, { useState } from 'react';
import axios from 'axios';

const UploadExcel = ({ url, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token'); // Assuming you're using token-based auth
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` // Include this if you're using token-based auth
        }
      });
      console.log('API response:', response.data); // Log the response data
      setUploading(false);
      onSuccess(response.data);
    } catch (error) {
      setUploading(false);
      setError('Error uploading file. Please try again.');
      console.error('Error uploading file:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    }
  };

  return (
    <div className="upload-excel">
      <input type="file" onChange={handleFileChange} accept=".xlsx, .xls" />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default UploadExcel;