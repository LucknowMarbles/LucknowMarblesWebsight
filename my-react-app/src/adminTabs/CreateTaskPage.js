import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  DatePicker, 
  Select, 
  Button, 
  message, 
  Space,
  Card,
  Divider 
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { TextArea } = Input;
const { Option } = Select;

const CreateTaskPage = () => {
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checklistItems, setChecklistItems] = useState(['']);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/users/all');
      const customers = await axios.get('http://localhost:5001/api/users/customers');
      
      response.data.map(user => user.customer = customers.data.forEach((c) => {
        if(c._id === user.customer) user.customer = c.username;
      }));

      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Failed to fetch users');
    }
  };

  const handleAddChecklistItem = () => {
    setChecklistItems([...checklistItems, '']);
  };

  const handleRemoveChecklistItem = (index) => {
    const newItems = checklistItems.filter((_, idx) => idx !== index);
    setChecklistItems(newItems);
  };

  const handleChecklistItemChange = (index, value) => {
    const newItems = [...checklistItems];
    newItems[index] = value;
    setChecklistItems(newItems);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Filter out empty checklist items
      const filteredChecklist = checklistItems.filter(item => item.trim() !== '');
      
      const taskData = {
        title: values.title,
        description: values.description,
        assignedTo: values.assignedTo,
        dueDate: values.dueDate.toISOString(),
        checklist: filteredChecklist
      };

      await axios.post('http://localhost:5001/api/tasks', taskData);
      
      message.success('Task created successfully');
      form.resetFields();
      setChecklistItems(['']);
    } catch (error) {
      console.error('Error creating task:', error);
      message.error('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card title="Create New Task" className="shadow-md">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="title"
            label="Task Title"
            rules={[{ required: true, message: 'Please enter task title' }]}
          >
            <Input placeholder="Enter task title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter task description' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Enter task description" 
            />
          </Form.Item>

          <Form.Item
            name="assignedTo"
            label="Assign To"
            rules={[{ required: true, message: 'Please select a user' }]}
          >
            <Select placeholder="Select user">
              {users.map(user => (
                <Option key={user.customer_id} value={user.customer_id}>
                  {user.customer}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="Due Date"
            rules={[{ required: true, message: 'Please select due date' }]}
          >
            <DatePicker 
              className="w-full"
              disabledDate={(current) => current && current < moment().startOf('day')}
            />
          </Form.Item>

          <Divider>Checklist Items</Divider>

          {checklistItems.map((item, index) => (
            <div key={index} className="flex gap-2 mb-4">
              <Input
                placeholder="Enter checklist item"
                value={item}
                onChange={(e) => handleChecklistItemChange(index, e.target.value)}
              />
              {checklistItems.length > 1 && (
                <Button 
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveChecklistItem(index)}
                />
              )}
            </div>
          ))}

          <Button 
            type="dashed" 
            onClick={handleAddChecklistItem} 
            block
            icon={<PlusOutlined />}
            className="mb-4"
          >
            Add Checklist Item
          </Button>

          <Form.Item>
            <Space className="w-full justify-end">
              <Button onClick={() => form.resetFields()}>
                Reset
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Task
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateTaskPage; 