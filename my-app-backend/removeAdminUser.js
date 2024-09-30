require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./modals/User');
const Customer = require('./modals/Customer');

const removeAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Find the admin user
    const adminUser = await User.findOne({ isAdmin: true });
    
    if (!adminUser) {
      console.log('No admin user found');
      return;
    }

    // Remove the associated Customer record
    if (adminUser.customer) {
      await Customer.findByIdAndDelete(adminUser.customer);
      console.log('Admin customer record removed');
    }

    // Remove the admin User record
    await User.findByIdAndDelete(adminUser._id);
    console.log('Admin user record removed');

    console.log('Admin user and associated customer successfully removed');
  } catch (error) {
    console.error('Error removing admin user:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

removeAdminUser();