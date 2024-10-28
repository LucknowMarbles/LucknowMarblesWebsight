import React, { useState } from 'react';
import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Dragger } = Upload;

const UploadExcel = ({ url, onSuccess, form }) => {
  const [fileList, setFileList] = useState([]);

  const props = {
    name: 'file',
    multiple: false,
    fileList,
    beforeUpload: (file) => {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel';
      if (!isExcel) {
        message.error(`${file.name} is not an Excel file`);
      }
      return isExcel || Upload.LIST_IGNORE;
    },
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
        onSuccess();
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
      setFileList(info.fileList);
    },
    customRequest: async ({ file, onSuccess, onError }) => {
      const formData = new FormData();
      formData.append('file', file);

      // Append form data to the request
      const formValues = form.getFieldsValue();
      Object.keys(formValues).forEach(key => {
        if (key === 'purchaseDate') {
          formData.append(key, formValues[key].toISOString());
        } else {
          formData.append(key, formValues[key]);
        }
      });

      try {
        const response = await axios.post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        onSuccess(response, file);
      } catch (error) {
        onError(error);
      }
    },
  };

  return (
    <Dragger {...props}>
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">Click or drag file to this area to upload</p>
      <p className="ant-upload-hint">
        Support for a single Excel file upload. Strictly prohibit from uploading company data or other
        sensitive files.
      </p>
    </Dragger>
  );
};

export default UploadExcel;
