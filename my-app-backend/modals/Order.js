const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  items: [{
    _id: String,
    name: String,
    price: Number,
    quantity: Number
  }],
  userInfo: {
    email: String,
    phoneNumber: String,
    address: String
  },
  subtotal: Number,
  deliveryCharge: Number,
  totalAmount: Number,
  createdAt: { type: Date, default: Date.now },
  paymentMethod: { type: String, enum: ['upi', 'cod'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'completed'], default: 'pending' },
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
