const mongoose = require('mongoose');

const locationHistorySchema = new mongoose.Schema({
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  timestamp: { type: Date, default: Date.now },
  reason: { type: String, enum: ['Purchase', 'Sale', 'Transfer', 'Chalan'] }
}, { _id: false });

const pieceSchema = new mongoose.Schema({
  customerLength: { type: Number, required: true },
  customerWidth: { type: Number, required: true },
  traderLength: { type: Number, required: true },
  traderWidth: { type: Number, required: true },
  thickness: { type: Number, required: true },
  isDefective: { type: Boolean, default: false },
  batchNo: { type: String, required: true },
  pieceNo: { type: String, required: true },
  purchaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Purchase', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  isSold: { type: Boolean, default: false },
  currentWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  locationHistory: [locationHistorySchema],
  soldArea: { type: Number, default: 0 },
}, { timestamps: true });

const Piece = mongoose.model('Piece', pieceSchema);

module.exports = Piece;
