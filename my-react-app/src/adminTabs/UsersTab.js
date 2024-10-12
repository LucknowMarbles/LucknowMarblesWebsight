import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [expandedPermissions, setExpandedPermissions] = useState({});

  const permissionCategories = {
    'User Management': ['viewUsers', 'editUsers', 'deleteUsers', 'changeUserRoles'],
    'Product Management': ['viewProducts', 'addProducts', 'editProducts', 'deleteProducts', 'manageCategories'],
    'Order Management': ['viewOrders', 'updateOrderStatus', 'cancelOrders', 'refundOrders'],
    'Enquiry Management': ['viewEnquiries', 'respondToEnquiries', 'deleteEnquiries'],
    'Content Management': ['editWebsiteContent', 'manageBlogPosts'],
    'Analytics & Reporting': ['viewSalesReports', 'viewUserAnalytics', 'exportData'],
    'System Configuration': ['managePaymentGateways', 'manageShippingOptions', 'setSystemPreferences', 'viewSecurityLogs', 'manageUserPermissions']
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const updateUserPermissions = async (userId, permission, value) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5001/api/users/${userId}/permissions`, { [permission]: value }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error('Error updating user permissions:', error);
    }
  };

  const togglePermissionCategory = (userId, category) => {
    setExpandedPermissions(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [category]: !prev[userId]?.[category]
      }
    }));
  };

  return (
    <div className="users-section">
      <h2>Registered Users</h2>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Admin</th>
            <th>Customer</th>
            {Object.keys(permissionCategories).map(category => (
              <th key={category}>{category}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>
                <input
                  type="checkbox"
                  checked={user.isAdmin}
                  onChange={() => updateUserPermissions(user._id, 'isAdmin', !user.isAdmin)}
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={user.isCustomer}
                  onChange={() => updateUserPermissions(user._id, 'isCustomer', !user.isCustomer)}
                />
              </td>
              {Object.entries(permissionCategories).map(([category, permissions]) => (
                <td key={category}>
                  <button
                    className="permission-dropdown"
                    onClick={() => togglePermissionCategory(user._id, category)}
                  >
                    {expandedPermissions[user._id]?.[category] ? '▼' : '▶'}
                  </button>
                  {expandedPermissions[user._id]?.[category] && (
                    <div className="permission-list">
                      {permissions.map(permission => (
                        <label key={permission}>
                          <input
                            type="checkbox"
                            checked={user.permissions[permission]}
                            onChange={() => updateUserPermissions(user._id, permission, !user.permissions[permission])}
                          />
                          {permission}
                        </label>
                      ))}
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UsersTab;