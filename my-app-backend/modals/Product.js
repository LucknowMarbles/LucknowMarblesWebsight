const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true,
    default: 0
  },
  imageUrl: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true,
    enum: ['furniture', 'electronics', 'clothing'] // Add more categories as needed
  },
  tags: [{ 
    type: String 
  }],
  isEcommerce: { 
    type: Boolean, 
    default: false 
  },
  // SEO fields
  metaTitle: { 
    type: String 
  },
  metaDescription: { 
    type: String 
  },
  // Warehouse relationship
  warehouseQuantities: [{
    warehouse: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Warehouse' 
    },
    quantity: { 
      type: Number, 
      required: true,
      default: 0
    }
  }],
  // Additional tracking fields
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true // This will automatically manage createdAt and updatedAt
});

// Update the controller to match these fields
productSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ isEcommerce: 1 });
productSchema.index({ tags: 1 });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
