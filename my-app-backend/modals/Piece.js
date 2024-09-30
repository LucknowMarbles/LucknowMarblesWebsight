const mongoose = require('mongoose');

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
  purchaseBillNo: { type: String, required: true }, 
  enquiryProductNo: { type: String },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Add this line
  productName: { type: String }
}, { timestamps: true });

const Piece = mongoose.model('Piece', pieceSchema);

module.exports = Piece;