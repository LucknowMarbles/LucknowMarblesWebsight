import React, { useState, useEffect } from 'react';
import { Table, Select, Modal, Card, Checkbox, Button, Tag } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch tasks and users on component mount
  useEffect(() => {
    fetchUsers();
    fetchTasks();
  }, []);

  // Fetch tasks when user filter changes
  useEffect(() => {
    fetchTasks();
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/users/all');
      console.log(response.data);
      const customers = await axios.get('http://localhost:5001/api/users/customers');
      console.log(customers.data);
      response.data.map(user => user.customer = customers.data.forEach((c) => {
        if(c._id === user.customer) user.customer = c.username;
      }));

      console.log(response.data);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const url = selectedUser === 'all' 
        ? 'http://localhost:5001/api/tasks'
        : `http://localhost:5001/api/tasks?userId=${selectedUser}`;
      
      const response = await axios.get(url);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsModalVisible(true);
  };

  const handleChecklistItemToggle = async (taskId, itemId, checked) => {
    try {
      await axios.patch(`http://localhost:5001/api/tasks/${taskId}/checklist/${itemId}`, {
        completed: checked
      });
      
      // Refresh tasks after updating
      fetchTasks();
    } catch (error) {
      console.error('Error updating checklist item:', error);
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Assigned To',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      render: (user) => user?.name || 'Unassigned'
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'completed' ? 'green' : 'blue'}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (_, record) => {
        const completed = record.checklist.filter(item => item.completed).length;
        const total = record.checklist.length;
        return `${completed}/${total}`;
      }
    }
  ];

  const TaskChecklistModal = () => (
    <Modal
      title={selectedTask?.title}
      open={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      footer={[
        <Button key="close" onClick={() => setIsModalVisible(false)}>
          Close
        </Button>
      ]}
    >
      <Card>
        <h4>Description:</h4>
        <p>{selectedTask?.description}</p>
        
        <h4 className="mt-4">Checklist:</h4>
        {selectedTask?.checklist.map((item) => (
          <div key={item._id} className="flex items-center gap-2 my-2">
            <Checkbox
              checked={item.completed}
              onChange={(e) => handleChecklistItemToggle(
                selectedTask._id,
                item._id,
                e.target.checked
              )}
            >
              {item.description}
            </Checkbox>
          </div>
        ))}
      </Card>
    </Modal>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <div className="flex gap-4">
          <Select
            style={{ width: 200 }}
            value={selectedUser}
            onChange={setSelectedUser}
            placeholder="Filter by user"
          >
            <Option value="all">All Users</Option>
            {users.map(user => (
              <Option key={user.customer_id} value={user.customer_id}>
                {user.customer}
              </Option>
            ))}
          </Select>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/admin/tasks/create')}
          >
            Create Task
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={tasks}
        loading={loading}
        rowKey="_id"
        onRow={(record) => ({
          onClick: () => handleTaskClick(record),
          className: 'cursor-pointer hover:bg-gray-50'
        })}
      />

      <TaskChecklistModal />
    </div>
  );
};

export default TasksPage;