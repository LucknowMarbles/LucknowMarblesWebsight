import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/Home';
import LoginPage from './pages/Login';
import ProfilePage from './pages/Profile';
import ContactPage from './pages/Contact';
import SignUp from './pages/SignUp';
import Navbar from './pages/NavBar';
import AdminPanel from './pages/AdminPanel';
import ShoppingCart from './pages/ShoppingCart';
import CustomerOrders from './pages/CustomerOrders';

function App() {
  const [cart, setCart] = useState([]);

  return (
    <Router>
      <Navbar cart={cart} />
      <Routes>
        <Route path="/" element={<HomePage cart={cart} setCart={setCart} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/cart" element={<ShoppingCart cart={cart} setCart={setCart} />} />
        <Route path="/orders" element={<CustomerOrders />} />
      </Routes>
    </Router>
  );
}

export default App;
