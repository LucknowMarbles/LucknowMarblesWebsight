const Enquiry = require('../modals/Enquiry').Enquiry;
const Customer = require('../modals/Customer');

const createEnquiry = async (req, res) => {
  try {
    const {
      username,
      email,
      phoneNumber,
      message,
      products
    } = req.body;

    console.log('Received enquiry data:', JSON.stringify(req.body, null, 2));

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
          dimensions: Array.isArray(purpose.dimensions) 
            ? purpose.dimensions.map(dimension => ({
                length: dimension.length,
                width: dimension.width,
                height: dimension.height,
                riserLength: dimension.riserLength,
                riserWidth: dimension.riserWidth,
                stepLength: dimension.stepLength,
                stepWidth: dimension.stepWidth,
                runningFit: dimension.runningFit
              }))
            : [purpose.dimensions] // If it's not an array, wrap it in an array
        })),
        quantity: product.quantity,
        selectedBatch: product.selectedBatch
      }))
    });

    console.log('New enquiry object:', JSON.stringify(newEnquiry, null, 2));

    const savedEnquiry = await newEnquiry.save();
    
    const populatedEnquiry = await Enquiry.findById(savedEnquiry._id)
      .populate('customer', 'username email phoneNumber')
      .populate('products.product', 'name');

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
