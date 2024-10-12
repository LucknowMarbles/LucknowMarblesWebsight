import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css'; // Import the CSS file

const Navbar = ({ cart }) => {
  return (
    <nav className="navbar">
      <ul className="navbar-list">
        <li className="navbar-item">
          <Link to="/orders" className="navbar-link">Check Order History</Link>
        </li>
        <li className="navbar-item">
          <Link to="/" className="navbar-link">Home</Link>
        </li>
        <li className="navbar-item">
          <Link to="/login" className="navbar-link">Login</Link>
        </li>
        <li className="navbar-item">
          <Link to="/signup" className="navbar-link">Sign Up</Link>
        </li>
        <li className="navbar-item">
          <Link to="/profile" className="navbar-link">Profile</Link>
        </li>
        <li className="navbar-item">
          <Link to="/contact" className="navbar-link">Contact</Link>
        </li>
        <li className="navbar-item">
          <Link to="/admin" className="navbar-link">Admin</Link>
        </li>
        <li className="navbar-item">
          <Link to="/cart" className="navbar-link">
            🛒 Cart ({cart.length})
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;