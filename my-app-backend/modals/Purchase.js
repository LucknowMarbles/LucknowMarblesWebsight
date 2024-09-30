const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  purchaseDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  supplier: {
    type: String,
    required: true
  },
  billNumber: {
    type: String,
    required: true,
    unique: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Unpaid', 'Partial'],
    default: 'Unpaid'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Check', 'Credit'],
    required: true
  },
  notes: {
    type: String
  },
  pieces: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Piece'
  }]
}, { timestamps: true });

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;