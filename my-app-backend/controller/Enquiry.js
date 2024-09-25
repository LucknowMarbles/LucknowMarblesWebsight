const Enquiry = require('../modals/Enquiry');

const createEnquiry = async (req, res) => {
  try {
    const {
      username,
      email,
      phoneNumber,
      message,
      products,
      purposeOfUse,
      dimensions
    } = req.body;

    const newEnquiry = new Enquiry({
      username,
      email,
      phoneNumber,
      message,
      products,
      purposeOfUse,
      dimensions
    });

    const savedEnquiry = await newEnquiry.save();
    res.status(201).json(savedEnquiry);
  } catch (error) {
    console.error('Error creating enquiry:', error);
    res.status(500).json({ message: 'Failed to create enquiry', error: error.message });
  }
};

const getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().populate('products.product');
    res.json(enquiries);
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({ message: 'Failed to fetch enquiries', error: error.message });
  }
};

module.exports = { createEnquiry, getAllEnquiries };
