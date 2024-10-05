const Enquiry = require('../modals/Enquiry');
const Customer = require('../modals/Customer');
const mongoose = require('mongoose');

const createEnquiry = async (req, res) => {
  try {
    const {
      username,
      email,
      phoneNumber,
      message,
      products
    } = req.body;

    console.log('Received enquiry data:', req.body.products[0].purposes[0].dimension.length);

    let customer = await Customer.findOne({ email });
    if (!customer) {
      if (!username || !email || !phoneNumber) {
        return res.status(400).json({ message: 'Username, email, and phone number are required for new customers' });
      }
      customer = new Customer({
        username,
        email,
        phoneNumber
      });
      await customer.save();
    }

    const newEnquiry = new Enquiry({
      customer: customer._id,
      message,
      products: products.map(product => ({
        product: product.product,
        purposes: product.purposes.map(purpose => ({
          purposeOfUse: purpose.purposeOfUse,
          dimension: {
            length: purpose.dimension[0].length,
            width: purpose.dimension[0].width,
            height: purpose.dimension[0].height,
            riserLength: purpose.dimension[0].riserLength,
            riserWidth: purpose.dimension[0].riserWidth,
            stepLength: purpose.dimension[0].stepLength,
            stepWidth: purpose.dimension[0].stepWidth,
            runningFit: purpose.dimension[0].runningFit
          }
        })),
        quantity: product.quantity,
        selectedBatch: product.selectedBatch,
        pieces: product.pieces.map(piece => 
            new mongoose.Types.ObjectId(piece)
        )
      }))
    });

    console.log('New enquiry object:', newEnquiry);

    const savedEnquiry = await newEnquiry.save();
    
    const populatedEnquiry = await Enquiry.findById(savedEnquiry._id)
      .populate('customer', 'username email phoneNumber')
      .populate('products.product', 'name')
      .populate('products.pieces', 'pieceNo');

    res.status(201).json(populatedEnquiry);
  } catch (error) {
    console.error('Error creating enquiry:', error);
    res.status(500).json({ message: 'Failed to create enquiry', error: error.message, stack: error.stack });
  }
};

const getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find()
      .populate('customer', 'username email phoneNumber')
      .populate('products.product', 'name');
    res.json(enquiries);
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({ message: 'Failed to fetch enquiries', error: error.message });
  }
};

module.exports = { createEnquiry, getAllEnquiries };
