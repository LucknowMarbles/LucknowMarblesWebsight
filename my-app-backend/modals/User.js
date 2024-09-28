const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  phoneNumber: { type: String },
  isAdmin: { type: Boolean, default: false },
  isCustomer: { type: Boolean, default: true }, // New field
  permissions: {
    viewProducts: { type: Boolean, default: true }, // Customers can view products
    placeOrder: { type: Boolean, default: true }, // Customers can place orders
    submitEnquiry: { type: Boolean, default: true }, // Customers can submit enquiries
    // ... other permissions (set to false by default)
    viewUsers: { type: Boolean, default: false },
    editUsers: { type: Boolean, default: false },
    deleteUsers: { type: Boolean, default: false },
    changeUserRoles: { type: Boolean, default: false },
    addProducts: { type: Boolean, default: false },
    editProducts: { type: Boolean, default: false },
    deleteProducts: { type: Boolean, default: false },
    manageCategories: { type: Boolean, default: false },
    viewOrders: { type: Boolean, default: false },
    updateOrderStatus: { type: Boolean, default: false },
    cancelOrders: { type: Boolean, default: false },
    refundOrders: { type: Boolean, default: false },
    viewEnquiries: { type: Boolean, default: false },
    respondToEnquiries: { type: Boolean, default: false },
    deleteEnquiries: { type: Boolean, default: false },
    editWebsiteContent: { type: Boolean, default: false },
    manageBlogPosts: { type: Boolean, default: false },
    viewSalesReports: { type: Boolean, default: false },
    viewUserAnalytics: { type: Boolean, default: false },
    exportData: { type: Boolean, default: false },
    managePaymentGateways: { type: Boolean, default: false },
    manageShippingOptions: { type: Boolean, default: false },
    setSystemPreferences: { type: Boolean, default: false },
    viewSecurityLogs: { type: Boolean, default: false },
    manageUserPermissions: { type: Boolean, default: false }
  }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;


