const SaleEnquiry = require('../modals/Sale');
const mongoose = require('mongoose');

exports.uploadSaleEnquiries = async (req, res) => {
  try {
    console.log(req.body);
    const saleData = req.body;

    // Validate the incoming data
    if (!saleData || !Array.isArray(saleData.items) || saleData.items.length === 0) {
      return res.status(400).json({ message: 'Invalid sale data format' });
    }

    // Create a new SaleEnquiry document
    const newSaleEnquiry = new SaleEnquiry({
      customer: new mongoose.Types.ObjectId(saleData.customer),
      shippingAddress: {
        street: saleData.shippingAddress.street,
        city: saleData.shippingAddress.city,
        state: saleData.shippingAddress.state,
        zipCode: saleData.shippingAddress.zipCode,
        country: saleData.shippingAddress.country
      },
      billingAddress: {
        street: saleData.billingAddress.street,
        city: saleData.billingAddress.city,
        state: saleData.billingAddress.state,
        zipCode: saleData.billingAddress.zipCode,
        country: saleData.billingAddress.country
      },
      freight: saleData.freight,
      gstPercent: saleData.gstPercent,
      status: saleData.status,
      items: saleData.items.map(item => ({
        piece: new mongoose.Types.ObjectId(item.piece),
        pieceNo: item.pieceNo,
        saleLength: item.saleLength,
        saleWidth: item.saleWidth,
        saleAreaPerPiece: item.saleAreaPerPiece,
        pricePerUnitArea: item.pricePerUnitArea
      }))
    });
    console.log(newSaleEnquiry);

    // Save the new SaleEnquiry
    const savedSaleEnquiry = await newSaleEnquiry.save();

    res.status(201).json({ 
      message: 'Sale enquiry created successfully', 
      saleEnquiry: savedSaleEnquiry 
    });
  } catch (error) {
    console.error('Error creating sale enquiry:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.getAllSaleEnquiries = async (req, res) => {
  try {
    const saleEnquiries = await SaleEnquiry.find()
      .populate('customer', 'name email phoneNumber')
      .populate('items.piece', 'pieceNo');

    res.status(200).json(saleEnquiries);
  } catch (error) {
    console.error('Error fetching sale enquiries:', error);
    res.status(500).json({ message: 'Error fetching sale enquiries' });
  }
};
