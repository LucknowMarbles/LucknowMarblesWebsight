const Enquiry = require('../modals/Enquiry');
const Customer = require('../modals/Customer');

const createEnquiry = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      message,
      products,
      purposeOfUse,
      dimensions
    } = req.body;

    // Check if customer exists, if not create a new one
    let customer = await Customer.findOne({ email: customerEmail });
    if (!customer) {
      customer = new Customer({
        username: customerName,
        email: customerEmail,
        phoneNumber: customerPhone
      });
      await customer.save();
    }

    const newEnquiry = new Enquiry({
      customer: customer._id,
      message,
      products: products.map(product => ({
        product: product.productId,
        quantity: product.quantity,
        purposeOfUse: product.purposeOfUse,
        dimensions: product.dimensions
      }))
    });

    const savedEnquiry = await newEnquiry.save();
    
    // Populate the customer and product details in the response
    const populatedEnquiry = await Enquiry.findById(savedEnquiry._id)
      .populate('customer', 'username email phoneNumber')
      .populate('products.product', 'name');

    res.status(201).json(populatedEnquiry);
  } catch (error) {
    console.error('Error creating enquiry:', error);
    res.status(500).json({ message: 'Failed to create enquiry', error: error.message });
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
