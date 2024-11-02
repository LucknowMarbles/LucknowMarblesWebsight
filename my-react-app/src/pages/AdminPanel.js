import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
        <header className="admin-header">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          <h1>Admin Panel</h1>
        </header>
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
        <main className="admin-content">
          {activeTab === 'transfer' && <TransferTab />}
          {activeTab === 'pieces' && <PiecesTab />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'products' && <ProductsTab />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'enquiries' && <EnquiriesTab />}
          {activeTab === 'uploadPurchase' && <PurchaseForm />}
          {activeTab === 'uploadSale' && <UploadSaleTab />}
          {activeTab === 'calendar' && <CalendarTab />}
          {activeTab === 'saleData'&& <SaleTab />}
          {activeTab === 'warehouse' && <CreateWarehouse />}
          {activeTab === 'createTransaction' && <CreateTransactionTab />}
          {activeTab === 'transactionReport' && <TransactionReportTab />}
          {activeTab === 'tasks' && <TasksPage />}
          {activeTab === 'createTask' && <CreateTaskPage />}
          {activeTab === 'displayPurchases' && <DisplayPurchases />}
          {activeTab === 'warehouseModelUpload' && <WarehouseModelUpload />}
        </main>
    </div>
  );
}

export default AdminPanel;
