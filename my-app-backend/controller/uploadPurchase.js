const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const Piece = require('../modals/Piece');
const router = express.Router();

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

const uploadPurchase = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    const pieces = data.map(row => ({
      batchNo: row['Batch No'],
      pieceNo: row['Piece No'],
      customerLength: row['Customer Length'],
      customerWidth: row['Customer Width'],
      traderLength: row['Trader Length'],
      traderWidth: row['Trader Width'],
      thickness: row['Thickness'],
      isDefective: row['Is Defective'].toLowerCase() === 'yes',
      purchaseId: row['Purchase ID'],
      purchaseBillNo: row['Purchase Bill No']
    }));

    console.log('Processed pieces:', pieces); // Log the processed data

    await Piece.insertMany(pieces);

    res.status(200).json({ message: 'Purchase data uploaded successfully', count: pieces.length });
  } catch (error) {
    console.error('Error uploading purchase data:', error);
    res.status(500).json({ message: 'Error uploading purchase data', error: error.message });
  }
};

const uploadSale = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Process sale data here
    console.log('Sale data:', data);  // Log the data for debugging

    // TODO: Implement the logic to process and save the sale data
    // For now, we'll just return a success message

    res.status(200).json({ message: 'Sale data uploaded successfully', count: data.length });
  } catch (error) {
    console.error('Error uploading sale data:', error);
    res.status(500).json({ message: 'Error uploading sale data', error: error.message });
  }
};

const generateInvoice = async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const pieces = await Piece.find({ purchaseId });

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');

    doc.pipe(res);

    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();

    pieces.forEach(piece => {
      doc.fontSize(12).text(`Piece No: ${piece.pieceNo}`);
      doc.text(`Customer Length: ${piece.customerLength}`);
      doc.text(`Customer Width: ${piece.customerWidth}`);
      doc.text(`Trader Length: ${piece.traderLength}`);
      doc.text(`Trader Width: ${piece.traderWidth}`);
      doc.text(`Thickness: ${piece.thickness}`);
      doc.text(`Is Defective: ${piece.isDefective ? 'Yes' : 'No'}`);
      doc.text(`Batch No: ${piece.batchNo}`);
      doc.text(`Purchase Bill No: ${piece.purchaseBillNo}`);
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ message: 'Error generating invoice' });
  }
};

const DisplayPieces = async (req, res) => {
  try {
    const { batchNo, productId } = req.query;
    let query = {};
    if (batchNo) query.batchNo = batchNo;
    if (productId) query.purchaseId = productId;

    const pieces = await Piece.find(query).populate('purchaseId', 'name');
    
    // Ensure we're sending a valid JSON response
    res.json({ success: true, data: pieces });
  } catch (error) {
    console.error('Error fetching pieces:', error);
    // Ensure we're sending a valid JSON response even in case of an error
    res.status(500).json({ success: false, message: 'Error fetching pieces', error: error.message });
  }
};

module.exports = { uploadPurchase, uploadSale, generateInvoice, DisplayPieces };