const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  date: { type: Date, required: true, default: Date.now },
  type: { type: String, enum: ['Payment', 'Receipt'], required: true },
  amount: { type: Number, required: true },
  relatedParty: { type: mongoose.Schema.Types.ObjectId, refPath: 'partyType', required: true },
  partyType: { type: String, enum: ['Customer', 'Vendor'], required: true },
  invoice: { type: mongoose.Schema.Types.ObjectId, refPath: 'invoiceType' },
  invoiceType: { type: String, enum: ['Sale', 'Purchase'] },
  notes: String
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;