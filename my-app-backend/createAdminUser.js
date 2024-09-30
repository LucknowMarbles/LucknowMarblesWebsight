require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./modals/User');
const Customer = require('./modals/Customer');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ isAdmin: true });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin customer
    const adminCustomer = new Customer({
      username: 'Admin',
      email: 'admin@example.com',
      phoneNumber: '1234567890'
    });
    await adminCustomer.save();

    // Create admin user
    const adminUser = new User({
      customer: adminCustomer._id,
      password: 'adminpassword', // This will be hashed by the pre-save hook
      isAdmin: true,
      permissions: {
        viewProducts: true,
        placeOrder: true,
        submitEnquiry: true,
        viewUsers: true,
        editUsers: true,
        deleteUsers: true,
        changeUserRoles: true,
        addProducts: true,
        editProducts: true,
        deleteProducts: true,
        manageCategories: true,
        viewOrders: true,
        updateOrderStatus: true,
        cancelOrders: true,
        refundOrders: true,
        viewEnquiries: true,
        respondToEnquiries: true,
        deleteEnquiries: true,
        editWebsiteContent: true,
        manageBlogPosts: true,
        viewSalesReports: true,
        viewUserAnalytics: true,
        exportData: true,
        managePaymentGateways: true,
        manageShippingOptions: true,
        setSystemPreferences: true,
        viewSecurityLogs: true,
        manageUserPermissions: true
      }
    });

    await adminUser.save();
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

createAdminUser();