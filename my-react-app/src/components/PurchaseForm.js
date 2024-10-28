import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Button, DatePicker, message, Upload, Select, InputNumber, Table } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { parse } from 'csv-parse/browser/esm';
import moment from 'moment';

const { Option } = Select;

const PurchaseForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchWarehouses();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Failed to fetch products');
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/warehouses');
      setWarehouses(response.data);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      message.error('Failed to fetch warehouses');
    }
  };

  const loadCSV = (event) => {
    const file = event.target.files[0];
    if (!file) {
      message.error('Please select a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      const csvText = e.target.result;
      parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }, (err, records) => {
        if (err) {
          console.error('Error parsing CSV file:', err);
          message.error('Failed to parse CSV file');
          return;
        }
        handleFillPieceData(records);
        message.success('CSV file loaded successfully');
      });
    };
    reader.onerror = function(e) {
      console.error('Error reading file:', e);
      message.error('Error reading file. Please try again.');
    };
    reader.readAsText(file);
  };

  const handleFillPieceData = (data) => {
    if (data && data.length > 0) {
      const newPieces = data.map((row, index) => ({
        key: index,
        batchNo: row.batchNo,
        pieceNo: row.pieceNo,
        customerLength: parseFloat(row.customerLength) || 0,
        customerWidth: parseFloat(row.customerWidth) || 0,
        traderLength: parseFloat(row.traderLength) || 0,
        traderWidth: parseFloat(row.traderWidth) || 0,
        thickness: parseFloat(row.thickness) || 0,
        isDefective: row.isDefective === 'Yes',
        productId: row.productId,
        currentWarehouse: row.currentWarehouse,
      }));

      setPieces(newPieces);
      message.success('Piece data filled successfully');

      // Set form fields based on the first row
      if (data[0]) {
        form.setFieldsValue({
          purchaseDate: data[0].purchaseDate ? moment(data[0].purchaseDate) : null,
          vendorName: data[0].vendorName || '',
          billNumber: data[0].billNumber || '',
          totalAmount: parseFloat(data[0].totalAmount) || 0,
        });
      }
    } else {
      message.error('No valid data found in the CSV file');
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const purchaseData = {
        ...values,
        pieces,
        ecommerceProducts: values.ecommerceProducts || []
      };
      console.log(purchaseData);

      const response = await axios.post('http://localhost:5001/api/pieces/upload-purchase', purchaseData);
      message.success('Purchase data uploaded successfully');
      form.resetFields();
      setPieces([]);
    } catch (error) {
      console.error('Error uploading purchase data:', error);
      message.error('Failed to upload purchase data');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Batch No', dataIndex: 'batchNo', key: 'batchNo' },
    { title: 'Piece No', dataIndex: 'pieceNo', key: 'pieceNo' },
    { title: 'Customer Length', dataIndex: 'customerLength', key: 'customerLength' },
    { title: 'Customer Width', dataIndex: 'customerWidth', key: 'customerWidth' },
    { title: 'Trader Length', dataIndex: 'traderLength', key: 'traderLength' },
    { title: 'Trader Width', dataIndex: 'traderWidth', key: 'traderWidth' },
    { title: 'Thickness', dataIndex: 'thickness', key: 'thickness' },
    { 
      title: 'Is Defective', 
      dataIndex: 'isDefective', 
      key: 'isDefective',
      render: (isDefective) => isDefective ? 'Yes' : 'No'
    },
  ];

  return (
    <div className="upload-purchase-section">
      <h2>Upload Purchase Data</h2>
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item>
          <input type="file" id="csvFile" accept=".csv" onChange={loadCSV} />
        </Form.Item>
        
        <Form.Item 
          name="purchaseDate" 
          label="Purchase Date" 
          rules={[{ required: true, message: 'Please select purchase date' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item 
          name="vendorName" 
          label="Vendor Name" 
          rules={[{ required: true, message: 'Please input vendor name' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item 
          name="billNumber" 
          label="Bill Number" 
          rules={[{ required: true, message: 'Please input bill number' }]}
        >
          <Input />
        </Form.Item>
        <Form.List name="ecommerceProducts">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, fieldKey, ...restField }) => (
                <div key={key} style={{ display: 'flex', marginBottom: 8 }}>
                  <Form.Item
                    {...restField}
                    name={[name, 'product']}
                    fieldKey={[fieldKey, 'product']}
                    rules={[{ required: true, message: 'Missing product' }]}
                    style={{ width: '40%', marginRight: 8 }}
                  >
                    <Select placeholder="Select product">
                      {products.map(product => (
                        <Option key={product._id} value={product._id}>{product.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'quantity']}
                    fieldKey={[fieldKey, 'quantity']}
                    rules={[{ required: true, message: 'Missing quantity' }]}
                    style={{ width: '20%', marginRight: 8 }}
                  >
                    <InputNumber min={1} placeholder="Quantity" style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'warehouse']}
                    fieldKey={[fieldKey, 'warehouse']}
                    rules={[{ required: true, message: 'Missing warehouse' }]}
                    style={{ width: '30%', marginRight: 8 }}
                  >
                    <Select placeholder="Select warehouse">
                      {warehouses.map(warehouse => (
                        <Option key={warehouse._id} value={warehouse._id}>{warehouse.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Button onClick={() => remove(name)} style={{ marginLeft: 8 }}>Delete</Button>
                </div>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add E-commerce Product
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
        <Form.Item 
          name="totalAmount" 
          label="Total Amount" 
          rules={[{ required: true, message: 'Please input total amount' }]}
        >
          <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item 
          name="paymentMethod" 
          label="Payment Method" 
          rules={[{ required: true, message: 'Please select payment method' }]}
        >
          <Select>
            <Option value="Cash">Cash</Option>
            <Option value="Credit Card">Credit Card</Option>
            <Option value="Bank Transfer">Bank Transfer</Option>
            <Option value="Cheque">Cheque</Option>
          </Select>
        </Form.Item>
        <Form.Item 
          name="paymentStatus" 
          label="Payment Status" 
          rules={[{ required: true, message: 'Please select payment status' }]}
        >
          <Select>
            <Option value="Paid">Paid</Option>
            <Option value="Pending">Pending</Option>
            <Option value="Partial">Partial</Option>
          </Select>
        </Form.Item>
        <Form.Item 
          name="notes" 
          label="Notes"
        >
          <Input.TextArea />
        </Form.Item>
        
        <h3>Uploaded Pieces</h3>
        <Table dataSource={pieces} columns={columns} />

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Submit Purchase
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default PurchaseForm;
