import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Spin, message, Select } from 'antd';
import WarehouseViewer3D from '../components/WarehouseViewer3D';
import WarehouseModelUpload from '../components/WarehouseModelUpload';
import Warehouse3DControls from '../components/Warehouse3DControls';

const WarehousesTab = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/warehouses');
      setWarehouses(response.data);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      message.error('Failed to fetch warehouses');
    } finally {
      setLoading(false);
    }
  };

  const handleWarehouseSelect = (warehouseId) => {
    setSelectedWarehouseId(warehouseId);
  };

  const handleModelUploaded = async (modelUrl) => {
    // Refresh warehouses list to get updated model URL
    await fetchWarehouses();
    message.success('Warehouse model updated successfully');
  };

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">3D Warehouse Overview</h2>
      
      {/* Warehouse Selector */}
      <div className="mb-6">
        <Select
          placeholder="Select Warehouse"
          onChange={handleWarehouseSelect}
          value={selectedWarehouseId}
          className="w-full md:w-64"
        >
          {warehouses.map((warehouse) => (
            <Select.Option key={warehouse._id} value={warehouse._id}>
              {warehouse.name}
            </Select.Option>
          ))}
        </Select>
      </div>

      {/* Model Upload Section */}
      {selectedWarehouseId && (
        <WarehouseModelUpload
          warehouseId={selectedWarehouseId}
          onModelUploaded={handleModelUploaded}
        />
      )}

      {/* 3D Viewer */}
      <div className="relative">
        <WarehouseViewer3D 
          warehouses={warehouses}
          selectedWarehouseId={selectedWarehouseId}
        />
        <Warehouse3DControls
          onZoomIn={() => {/* implement zoom in */}}
          onZoomOut={() => {/* implement zoom out */}}
          onReset={() => {/* implement reset */}}
          onToggleFullscreen={() => {/* implement fullscreen */}}
          onSnapshot={() => {/* implement snapshot */}}
        />
      </div>
    </div>
  );
};

export default WarehousesTab;