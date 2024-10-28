const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  transferType: {
    type: String,
    enum: ['Bulk', 'Piece'],
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: function() { return this.transferType === 'Bulk'; }
  },
  pieces: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Piece',
    required: function() { return this.transferType === 'Piece'; }
  }],
  fromWarehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  toWarehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  quantity: {
    type: Number,
    required: function() { return this.transferType === 'Bulk'; },
    min: 1
  },
  transferDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  notes: String
}, { timestamps: true });

const Transfer = mongoose.model('Transfer', transferSchema);
module.exports = Transfer;
