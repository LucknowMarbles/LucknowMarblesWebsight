const mongoose = require('mongoose');

const saleEnquiryItemSchema = new mongoose.Schema({
  piece: { type: mongoose.Schema.Types.ObjectId, ref: 'Piece', required: true },
  pieceNo: { type: String},
  saleLength: { type: Number, required: true },
  saleWidth: { type: Number, required: true },
  saleAreaPerPiece: { type: Number, required: true },
  pricePerUnitArea: { type: Number, required: true },
});

const saleEnquirySchema = new mongoose.Schema({
  items: [saleEnquiryItemSchema],
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  billingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  items: [saleEnquiryItemSchema],
  invoiceNumber: { type: String, required: true },
  freight: { type: Number, default: 0 },
  gstPercent: { type: Number, required: true, min: 0, max: 100 },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  createdAt: { type: Date, default: Date.now },
  transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }]
}, { timestamps: true });


const SaleEnquiry = mongoose.model('SaleEnquiry', saleEnquirySchema);

module.exports = SaleEnquiry;
