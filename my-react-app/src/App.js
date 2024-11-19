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
import { GOOGLE_MAPS_LIBRARIES, REACT_APP_GOOGLE_MAPS_API_KEY } from './cridentials';
import { LoadScript } from '@react-google-maps/api';
import WarehousesTab from './pages/WarehousesTab';
import TransferTab from './adminTabs/TransferTab';
import PiecesTab from './adminTabs/PiecesTab';
import UsersTab from './adminTabs/UsersTab';
import ProductsTab from './adminTabs/ProductsTab';
import OrdersTab from './adminTabs/OrdersTab';
import EnquiriesTab from './adminTabs/EnquiriesTab';
import UploadPurchaseTab from './components/PurchaseForm';
import UploadSaleTab from './adminTabs/UploadSaleTab';
import CalendarTab from './adminTabs/CalendarTab';
import SaleTab from './adminTabs/SaleTab';
import CreateWarehouse from './adminTabs/WarehouswTab';
import CreateTransactionTab from './adminTabs/CreateTransactionTab';
import TransactionReportTab from './adminTabs/TransactionReportTab';
import TasksTab from './adminTabs/TasksPage';
const adminstr = "/admin"
console.log(REACT_APP_GOOGLE_MAPS_API_KEY)


function App() {
  const [cart, setCart] = useState([]);

  return (
    <LoadScript googleMapsApiKey={REACT_APP_GOOGLE_MAPS_API_KEY} libraries={GOOGLE_MAPS_LIBRARIES}>
      <Router>
        <Navbar cart={cart} />
        <Routes>
          <Route path="/warehouses" element={<WarehousesTab />} />
          <Route path="/" element={<HomePage cart={cart} setCart={setCart} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/cart" element={<ShoppingCart cart={cart} setCart={setCart} />} />
          <Route path= {adminstr + "/orders"} element={<CustomerOrders />} />
          <Route path={adminstr + "/warehouses"} element={<WarehousesTab />} />
          <Route path={adminstr + "/transfer"} element={<TransferTab />} />
          <Route path={adminstr + "/pieces"} element={<PiecesTab />} />
          <Route path={adminstr + "/users"} element={<UsersTab />} />
          <Route path={adminstr + "/products"} element={<ProductsTab />} />
          <Route path={adminstr + "/orders"} element={<OrdersTab />} />
          <Route path={adminstr + "/enquiries"} element={<EnquiriesTab />} />
          <Route path={adminstr + "/uploadPurchase"} element={<UploadPurchaseTab />} />
          <Route path={adminstr + "/uploadSale"} element={<UploadSaleTab />} />
          <Route path={adminstr + "/calendar"} element={<CalendarTab />} />
          <Route path={adminstr + "/saleData"} element={<SaleTab />} />
          <Route path={adminstr + "/warehouse"} element={<CreateWarehouse />} />
          <Route path={adminstr + "/createTransaction"} element={<CreateTransactionTab />} />
          <Route path={adminstr + "/transactionReport"} element={<TransactionReportTab />} />
          <Route path={adminstr + "/tasks"} element={<TasksTab />} />

        </Routes>
      </Router>
    </LoadScript>
  );
}

export default App;
