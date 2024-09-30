const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const readXlsxFile = require('read-excel-file/node');
const Piece = require('../modals/Piece');
const Purchase = require('../modals/Purchase');

const mongoose = require('mongoose');
const router = express.Router();

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

const uploadPurchase = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    //console.log('File received:', req.file);
    //console.log('File buffer length:', req.file.buffer.length);

    // Change this line
    const workbook = await readXlsxFile(req.file.buffer);
    //console.log(workbook);
    //console.log('Sheet names:', workbook);

    // Remove or comment out these lines as they're not applicable
    // if (workbook.SheetNames.length === 0) {
    //   return res.status(400).json({ message: 'No sheets found in the uploaded file' });
    // }
    // 
    // const sheetName = workbook.SheetNames[0];
    // const sheet = workbook.Sheets[sheetName];



    if (workbook.length === 0) {
      return res.status(400).json({ message: 'No sheets found in the uploaded file' });
    }
    const sheet = workbook;
    //const data = xlsx.utils.sheet_to_json(sheet);
    const purchase = sheet.map(row => 
        Purchase({
        purchaseDate: new Date(),
        supplier: row[11],
        billNumber: row[12],
        totalAmount: 0,
        paymentMethod: row[13]}));
    const pieces = sheet.map((row,i) => ({
      batchNo: row[0],
      pieceNo: row[1],
      customerLength: parseInt(row[2]),
      customerWidth: parseInt(row[3]),
      traderLength: parseInt(row[4]),
      traderWidth: parseInt(row[5]),
      thickness: parseInt(row[6]),
      isDefective: row[7].toLowerCase() === 'yes',
      purchaseId: purchase[i]._id,
      purchaseBillNo: row[9],
      enquiryProductNo: row[10],
      productId: row[14]
    }));
    

    console.log('Processed pieces:', pieces); // Log the processed data

    await Piece.insertMany(pieces);

    res.status(200).json({ message: 'Purchase data uploaded successfully', count: pieces.length });
  } catch (error) {
    console.error('Error in uploadPurchase:', error);
    res.status(500).json({ message: 'Error uploading purchase data', error: error.toString() });
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