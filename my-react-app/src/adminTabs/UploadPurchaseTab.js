import React from 'react';
import UploadExcel from '../components/UploadExcel';
import PurchaseForm from '../components/PurchaseForm';
import { Tabs } from 'antd';

const { TabPane } = Tabs;

function UploadPurchaseTab() {
  return (
    <div className="upload-purchase-section">
      <h2>Upload Purchase Data</h2>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Manual Entry" key="1">
          <PurchaseForm />
        </TabPane>
        <TabPane tab="Excel Upload" key="2">
          <UploadExcel 
            url="http://localhost:5001/api/pieces/upload-purchase"
            onSuccess={() => alert('Purchase data uploaded successfully')}
          />
        </TabPane>
      </Tabs>
    </div>
  );
}

export default UploadPurchaseTab;
