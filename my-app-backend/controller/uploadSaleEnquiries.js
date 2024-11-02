const SaleEnquiry = require('../modals/Sale');
const Piece = require('../modals/Piece');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.uploadSaleEnquiries = async (req, res) => {
  try {
    const saleData = req.body;

    // Validate the incoming data
    if (!saleData || !Array.isArray(saleData.items) || saleData.items.length === 0) {
      return res.status(400).json({ message: 'Invalid sale data format' });
    }

    // Process all pieces in parallel
    await Promise.all(saleData.items.map(async (item) => {
      const foundPiece = await Piece.findOne({ pieceNo: item.pieceNo });
      if (foundPiece) {
        foundPiece.soldArea = item.saleAreaPerPiece;
        foundPiece.remainingArea = foundPiece.pieceArea - item.saleAreaPerPiece
        await foundPiece.save();
      }
    }));

    // Create a new SaleEnquiry document
    const newSaleEnquiry = new SaleEnquiry({
      customer: new mongoose.Types.ObjectId(saleData.customer),
      invoiceNumber: saleData.invoiceNumber,
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
    

    // Save the new SaleEnquiry
    const savedSaleEnquiry = await newSaleEnquiry.save();

    // Update the sold status of the pieces
    const pieceIds = savedSaleEnquiry.items.map(item => item.piece);
    console.log(pieceIds);
    await Piece.updateMany(
      { _id: { $in: pieceIds } },
      { $set: { isSold: true } }
    );
    console.log(Piece);

    res.status(201).json({ 
      message: 'Sale enquiry created successfully and pieces marked as sold', 
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

exports.generateSaleInvoice = async (req, res) => {
  try {
    const { saleId } = req.params;
    
    // Fetch sale details with populated fields
    const sale = await SaleEnquiry.findById(saleId)
      .populate('customer', 'name email phoneNumber')
      .populate('items.piece', 'pieceNo productId')
      .populate('items.piece.productId', 'name');

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${sale.invoiceNumber}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add company logo (if exists)
    // doc.image('path/to/logo.png', 50, 45, { width: 50 });

    // Add company info
    doc.fontSize(20).text('COMPANY NAME', { align: 'right' });
    doc.fontSize(10)
      .text('123 Business Street', { align: 'right' })
      .text('City, State, ZIP', { align: 'right' })
      .text('Phone: (123) 456-7890', { align: 'right' })
      .moveDown();

    // Add invoice header
    doc.fontSize(20)
      .text('INVOICE', { align: 'center' })
      .moveDown();

    // Add invoice details
    doc.fontSize(10)
      .text(`Invoice Number: ${sale.invoiceNumber}`)
      .text(`Date: ${new Date(sale.createdAt).toLocaleDateString()}`)
      .moveDown();

    // Add customer details
    doc.text('Bill To:')
      .text(sale.customer.name)
      .text(sale.customer.email)
      .text(sale.customer.phoneNumber)
      .text(`${sale.billingAddress.street}`)
      .text(`${sale.billingAddress.city}, ${sale.billingAddress.state} ${sale.billingAddress.zipCode}`)
      .text(sale.billingAddress.country)
      .moveDown();

    // Add shipping address if different
    if (sale.shippingAddress.street !== sale.billingAddress.street) {
      doc.text('Ship To:')
        .text(`${sale.shippingAddress.street}`)
        .text(`${sale.shippingAddress.city}, ${sale.shippingAddress.state} ${sale.shippingAddress.zipCode}`)
        .text(sale.shippingAddress.country)
        .moveDown();
    }

    // Add items table
    const tableTop = doc.y;
    const itemsPerPage = 10;
    let currentItem = 0;

    // Table headers
    const addTableHeaders = () => {
      doc
        .fontSize(10)
        .text('Item', 50, doc.y, { width: 150 })
        .text('Dimensions', 200, doc.y - 12, { width: 100 })
        .text('Area (sq.ft)', 300, doc.y - 12, { width: 80 })
        .text('Price/sq.ft', 380, doc.y - 12, { width: 80 })
        .text('Amount', 460, doc.y - 12, { width: 80 })
        .moveDown();
    };

    addTableHeaders();

    // Calculate totals
    let subtotal = 0;
    let totalArea = 0;

    // Add items
    sale.items.forEach((item, i) => {
      if (currentItem === itemsPerPage) {
        doc.addPage();
        addTableHeaders();
        currentItem = 0;
      }

      const amount = item.saleAreaPerPiece * item.pricePerUnitArea;
      subtotal += amount;
      totalArea += item.saleAreaPerPiece;

      doc
        .fontSize(10)
        .text(item.piece.productId.name, 50, doc.y)
        .text(`${item.saleLength}" × ${item.saleWidth}"`, 200, doc.y - 12)
        .text(item.saleAreaPerPiece.toFixed(2), 300, doc.y - 12)
        .text(`₹${item.pricePerUnitArea.toFixed(2)}`, 380, doc.y - 12)
        .text(`₹${amount.toFixed(2)}`, 460, doc.y - 12)
        .moveDown();

      currentItem++;
    });

    // Add totals
    const gstAmount = (subtotal * sale.gstPercent) / 100;
    const total = subtotal + gstAmount + sale.freight;

    doc
      .moveDown()
      .text(`Subtotal: ₹${subtotal.toFixed(2)}`, { align: 'right' })
      .text(`GST (${sale.gstPercent}%): ₹${gstAmount.toFixed(2)}`, { align: 'right' })
      .text(`Freight: ₹${sale.freight.toFixed(2)}`, { align: 'right' })
      .fontSize(12)
      .text(`Total: ₹${total.toFixed(2)}`, { align: 'right' })
      .moveDown();

    // Add footer
    doc
      .fontSize(10)
      .text('Thank you for your business!', { align: 'center' })
      .text('Terms & Conditions Apply', { align: 'center' });

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ 
      message: 'Error generating invoice',
      error: error.message 
    });
  }
};
