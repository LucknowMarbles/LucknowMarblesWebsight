import { React, updateState, useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import '../App.css'; // Import the CSS file
const Navbar = ({ cart }) => {
  const commonRoutes = [
    { path: '/', label: 'Home' },
    { path: '/signup', label: 'Sign Up' },
    { path: '/login', label: 'Login' }
  ];
  const adminRoutes = [
    { path: '/admin/transfer', label: 'Transfer' },
    { path: '/admin/pieces', label: 'Pieces Balance' },
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/products', label: 'Products' },
    { path: '/admin/orders', label: 'Orders' },
    { path: '/admin/enquiries', label: 'Enquiries' },
    { path: '/admin/uploadpurchase', label: 'Upload Purchase' },
    { path: '/admin/uploadsale', label: 'Upload Sale' },
    { path: '/admin/calendar', label: 'Calendar' },
    { path: '/admin/sales', label: 'Sales' },
    { path: '/admin/warehouse', label: 'Warehouse' },
    { path: '/admin/createTransaction', label: 'Transactions' },
    { path: '/admin/tasks', label: 'Tasks' }
  ];
  const userRoutes = [
    { path: '/', label: 'Home' },
    { path: '/orders', label: 'Order History' },
    { path: '/contact', label: 'Contact' },
    { path: '/warehouses', label: 'Warehouses' },
    { path: '/cart', label: 'Cart' },
    { path: '/profile', label: 'Profile' },
    { path: '/contact', label: 'Contact' },
  ];
  const changeRouts = [
    { path: '/admin/pieces', label: 'Admin' },
  ]
  const [isAdmin, setIsAdmin] = useState(false);
  const changeAdmin = () => {
    console.log("changeAdmin");
    setIsAdmin(true);
  }

  useEffect(() => {
    console.log("isAdmin", isAdmin);
  }, [isAdmin]);
  return (
    <nav className="navbar">
      <ul className="navbar-list">
        {
        <li className="navbar-item">
          <Link to={changeRouts[0].path} className="navbar-link" onClick = {changeAdmin}s>{changeRouts[0].label}</Link>
        </li>
        }
        {commonRoutes.map((route) => (
          <li className="navbar-item">
            <Link to={route.path} className="navbar-link">{route.label}</Link>
          </li>
        ))}
        {
        isAdmin && (adminRoutes.map((route) => (
          <li className="navbar-item">
            <Link to={route.path} className="navbar-link">{route.label}</Link>
          </li>
        )))}
        {!isAdmin && (userRoutes.map((route) => (
          <li className="navbar-item">
            <Link to={route.path} className="navbar-link">{route.label}</Link>
          </li>
        )))}
      </ul>
    </nav>
  );
};


export default Navbar;