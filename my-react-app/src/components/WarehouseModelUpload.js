import React, { useState } from 'react';
import { Upload, Button, Progress, message, Card } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';

const WarehouseModelUpload = ({ warehouseId, onModelUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async ({ file }) => {
    const isGLTF = file.name.endsWith('.gltf');
    const isGLB = file.name.endsWith('.glb');
    
    if (!isGLTF && !isGLB) {
      message.error('Please upload GLTF or GLB files only!');
      return;
    }

    // Create FormData and append file and warehouseId
    const formData = new FormData();
    formData.append('model', file); // 'model' should match the field name expected by multer
    formData.append('warehouseId', warehouseId);
    console.log(formData.get('model'));
    console.log(formData.get('warehouseId'));

    try {
      setUploading(true);
      
      const response = await axios.post(
        'http://localhost:5001/api/warehouses/upload-model',
        formData, // Send formData instead of object
        {
          headers: {
            'Content-Type': 'multipart/form-data', // Important for file upload
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          },
        }
      );

      message.success('Model uploaded successfully!');
      onModelUploaded(response.data.modelUrl);
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Failed to upload model');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <Card title={`Upload 3D Model for Warehouse ${warehouseId}`} className="mb-4">
      <Upload
        customRequest={handleUpload}
        showUploadList={false}
        accept=".gltf,.glb"
        maxCount={1}
      >
        <Button 
          icon={<UploadOutlined />} 
          loading={uploading}
          disabled={uploading}
        >
          Select 3D Model
        </Button>
      </Upload>

      {uploading && (
        <Progress 
          percent={progress} 
          status="active" 
          className="mt-4"
        />
      )}

      <div className="mt-4 text-sm text-gray-500">
        Supported formats: .gltf, .glb
        <br />
        Maximum file size: 50MB
      </div>
    </Card>
  );
};

export default WarehouseModelUpload; 