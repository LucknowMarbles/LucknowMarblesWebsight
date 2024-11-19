import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../AdminPanal.css';
import PiecesTab from '../adminTabs/PiecesTab';
import UsersTab from '../adminTabs/UsersTab';
import ProductsTab from '../adminTabs/ProductsTab';
import OrdersTab from '../adminTabs/OrdersTab';
import EnquiriesTab from '../adminTabs/EnquiriesTab';
import UploadSaleTab from '../adminTabs/UploadSaleTab';
import SaleTab from '../adminTabs/SaleTab';
import CalendarTab from '../adminTabs/CalendarTab';
import { LoadScript } from '@react-google-maps/api';
import { FaBars, FaTimes } from 'react-icons/fa';
import CreateWarehouse from '../adminTabs/WarehouswTab';
import TransactionReportTab from '../adminTabs/TransactionReportTab';
import CreateTransactionTab from '../adminTabs/CreateTransactionTab';
import TransferTab from '../adminTabs/TransferTab';
import PurchaseForm from '../components/PurchaseForm';
import TasksPage from '../adminTabs/TasksPage';
import CreateTaskPage from '../adminTabs/CreateTaskPage';
import DisplayPurchases from '../adminTabs/DisplayPurchases';
import WarehouseModelUpload from '../components/WarehouseModelUpload';


const GOOGLE_MAPS_API_KEY = "AIzaSyCsNh45zRUdhDiJTYblG4vw5gAtWlbTf_4";

function AdminPanel() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pieces');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get('http://localhost:5001/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsAdmin(response.data.isAdmin);
      setLoading(false);
      if (!response.data.isAdmin) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setLoading(false);
      navigate('/login');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!isAdmin) {
    return null;
  }

  const tabs = [
    { id: 'warehouseModelUpload', label: 'Upload Warehouse Model' },
    { id: 'transfer', label: 'Transfer' },
    { id: 'pieces', label: 'Pieces Balance' },
    { id: 'users', label: 'Users' },
    { id: 'products', label: 'Products' },
    { id: 'orders', label: 'Orders' },
    { id: 'enquiries', label: 'Enquiries' },
    { id: 'uploadPurchase', label: 'Upload Purchase' },
    { id: 'uploadSale', label: 'Upload Sale' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'saleData', label: 'Sales' },
    {id: 'warehouse', label: 'CreateWarehouse'},
    { id: 'createTransaction', label: 'Create Transaction' },
    { id: 'transactionReport', label: 'Transaction Report' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'createTask', label: 'Create Task' },
    { id: 'displayPurchases', label: 'Display Purchases' },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="admin-panel">
      {/* Admin Navbar */}
      <nav className="admin-top-nav">
        <div className="admin-nav-content">
          <div className="admin-nav-left">
            <Link to="/" className="admin-nav-link">Home</Link>
          </div>
          <div className="admin-nav-center">
            <h1>Admin Dashboard</h1>
          </div>
          <div className="admin-nav-right">
            <Link to="/login" className="admin-nav-link">Login</Link>
            <Link to="/signup" className="admin-nav-link signup">Sign Up</Link>
            <Link to="/logout" className="admin-nav-link logout">Logout</Link>
          </div>
        </div>
      </nav>

      {/* Sidebar Toggle and Content */}
      <div className="admin-main-content">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
        
        <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <nav className="admin-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
                className={`admin-nav-button ${activeTab === tab.id ? 'active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
