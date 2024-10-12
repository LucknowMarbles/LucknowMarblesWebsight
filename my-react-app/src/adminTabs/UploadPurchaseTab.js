import React from 'react';
import UploadExcel from '../components/UploadExcel';

function UploadPurchaseTab() {
  return (
    <div className="upload-purchase-section">
      <h2>Upload Purchase Data</h2>
      <UploadExcel uploadType="purchase" />
    </div>
  );
}

export default UploadPurchaseTab;