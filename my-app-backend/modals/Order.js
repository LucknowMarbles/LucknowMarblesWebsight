const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  items: [{
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    price: Number,
    quantity: Number,
    name: String
  }],
  userInfo: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    email: String,
    phoneNumber: String,
    address: String
  },
  subtotal: Number,
  deliveryCharge: Number,
  totalAmount: Number,
  createdAt: { type: Date, default: Date.now },
  paymentMethod: { type: String, enum: ['upi', 'cod', 'neft_rtgs',], required: true },
  paymentStatus: { type: String, enum: ['pending', 'completed'], default: 'pending' },
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
