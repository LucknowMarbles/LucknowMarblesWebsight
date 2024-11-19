import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const AdminNavbar = () => {
  const adminRoutes = [
    { path: '/', label: 'Home' },
    { path: '/transfer', label: 'Transfer' },
    { path: '/pieces', label: 'Pieces Balance' },
    { path: '/users', label: 'Users' },
    { path: '/products', label: 'Products' },
    { path: '/orders', label: 'Orders' },
    { path: '/enquiries', label: 'Enquiries' },
    { path: '/upload-purchase', label: 'Upload Purchase' },
    { path: '/upload-sale', label: 'Upload Sale' },
    { path: '/calendar', label: 'Calendar' },
    { path: '/sales', label: 'Sales' },
    { path: '/warehouse', label: 'Warehouse' },
    { path: '/transactions', label: 'Transactions' },
    { path: '/tasks', label: 'Tasks' }
  ];

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-container">
        {/* Left side - Brand/Logo */}
        <div className="admin-navbar-brand">
          <Link to="/" className="admin-brand-link">
            Admin Dashboard
          </Link>
        </div>

        {/* Center - Main Navigation */}
        <ul className="admin-navbar-list">
          {adminRoutes.map((route) => (
            <li key={route.path} className="admin-navbar-item">
              <Link 
                to={route.path} 
                className="admin-navbar-link"
              >
                {route.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side - Auth Links */}
        <div className="admin-navbar-auth">
          <Link to="/login" className="admin-navbar-link">Login</Link>
          <Link to="/signup" className="admin-navbar-link admin-signup-btn">Sign Up</Link>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;