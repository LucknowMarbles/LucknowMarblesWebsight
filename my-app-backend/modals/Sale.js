const mongoose = require('mongoose');

const saleEnquiryItemSchema = new mongoose.Schema({
  piece: { type: mongoose.Schema.Types.ObjectId, ref: 'Piece', required: true },
  pieceNo: { type: String, required: true },
  saleLength: { type: Number, required: true },
  saleWidth: { type: Number, required: true },
  saleAreaPerPiece: { type: Number, required: true },
  pricePerUnitArea: { type: Number, required: true },
});

const totalAreaPerProductSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  totalArea: { type: Number, required: true },
}, { _id: false });

const saleEnquirySchema = new mongoose.Schema({
  totalAreaPerProduct: [totalAreaPerProductSchema],
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  items: [saleEnquiryItemSchema],
  freight: { type: Number, default: 0 },
  gstPercent: { type: Number, required: true, min: 0, max: 100 },
  subtotal: { type: Number, required: true },
  gstAmount: { type: Number, required: true },
  totalInvoiceAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Calculate total area per product, subtotal, GST, and total invoice amount before saving
saleEnquirySchema.pre('save', async function(next) {
  let subtotal = 0;
  const productAreas = {};

  for (const item of this.items) {
    // Populate the piece to get the productId
    await item.populate('piece');
    const productId = item.piece.productId;

    if (productId) {
      if (!productAreas[productId]) {
        productAreas[productId] = {
          productId: productId,
          productName: item.piece.productName,
          totalArea: 0
        };
      }
      productAreas[productId].totalArea += item.saleAreaPerPiece;
    }

    // Calculate subtotal
    subtotal += item.saleAreaPerPiece * item.pricePerUnitArea;
  }

  this.totalAreaPerProduct = Object.values(productAreas);
  this.subtotal = subtotal;
  this.gstAmount = (this.subtotal + this.freight) * (this.gstPercent / 100);
  this.totalInvoiceAmount = this.subtotal + this.freight + this.gstAmount;

  next();
});

const SaleEnquiry = mongoose.model('SaleEnquiry', saleEnquirySchema);

module.exports = SaleEnquiry;