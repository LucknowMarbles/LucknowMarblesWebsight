const mongoose = require('mongoose');

const dimensionSchema = new mongoose.Schema({
  length: Number,
  width: Number,
  height: Number,
  riserLength: Number,
  riserWidth: Number,
  stepLength: Number,
  stepWidth: Number,
  runningFit: Number
}, { _id: false });

const productEnquirySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  purposeOfUse: { type: String, required: true, enum: ['Kitchen top or table', 'Stairs', 'Flooring', 'Dahal'] },
  dimensions: [dimensionSchema]
}, { _id: false });

const enquirySchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  message: { type: String },
  products: [productEnquirySchema],
  createdAt: { type: Date, default: Date.now }
});

const Enquiry = mongoose.model('Enquiry', enquirySchema);
module.exports = Enquiry;
