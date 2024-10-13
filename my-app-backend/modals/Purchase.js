const mongoose = require('mongoose');

const ecommerceProductSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

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
  }],
  transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  ecommerceProducts: [ecommerceProductSchema]
}, { timestamps: true });

// Middleware to ensure only e-commerce products are added
purchaseSchema.pre('save', async function(next) {
  const Product = mongoose.model('Product');
  for (let ecommerceProduct of this.ecommerceProducts) {
    const product = await Product.findById(ecommerceProduct.product);
    if (!product || product.type !== 'ecommerce') {
      return next(new Error('Only e-commerce products can be added to ecommerceProducts'));
    }
  }
  next();
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
