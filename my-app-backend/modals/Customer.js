const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String },
  type: { 
    type: String, 
    enum: ['customer', 'vendor'], 
    default: 'customer',
    required: true 
  },
  createdAt: { type: Date, default: Date.now }
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
