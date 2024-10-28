const express = require('express');
const multer = require('multer');
const Piece = require('../modals/Piece');
const Purchase = require('../modals/Purchase');
const Product = require('../modals/Product');

const mongoose = require('mongoose');
const router = express.Router();

// Configure multer for memory storage
const uploadPurchase = async (req, res) => {
  try {
    const purchase = new Purchase({
      transactions: [], 
      notes: req.body.notes,
      paymentStatus: req.body.paymentStatus,
      totalAmount: req.body.totalAmount, // You may want to calculate this based on the pieces
      paymentMethod: req.body.paymentMethod,
      purchaseDate: new Date(req.body.purchaseDate),
      supplier: req.body.vendorName,
      billNumber: req.body.billNumber,
      ecommerceProducts: req.body.ecommerceProducts.map(product => ({
        product: new mongoose.Types.ObjectId(product.product),
        quantity: product.quantity,
        warehouse: product.warehouse
      }))
    });
    await purchase.save();

    const pieces = req.body.pieces.map((piece) => ({
      batchNo: piece.batchNo,
      pieceNo: piece.pieceNo,
      customerLength: parseInt(piece.customerLength),
      customerWidth: parseInt(piece.customerWidth),
      traderLength: parseInt(piece.traderLength),
      traderWidth: parseInt(piece.traderWidth),
      thickness: parseInt(piece.thickness),
      isDefective: piece.isDefective.toLowerCase === 'yes',
      purchaseId: purchase._id,
      productId: new mongoose.Types.ObjectId(piece.productId),
      currentWarehouse: new mongoose.Types.ObjectId(piece.currentWarehouse),
      locationHistory: [{
        warehouse: new mongoose.Types.ObjectId(piece.currentWarehouse),
        timestamp: new Date(),
        reason: 'Purchase'
      }]
    }));

    await Piece.insertMany(pieces);

    // Update product quantities in warehouses
    for (const ecommerceProduct of purchase.ecommerceProducts) {
      await Product.findByIdAndUpdate(
        ecommerceProduct.product,
        {
          $inc: {
            [`warehouses.${ecommerceProduct.warehouse}`]: ecommerceProduct.quantity
          }
        }
      );
    }

    res.status(200).json({ message: 'Purchase data uploaded successfully', purchaseId: purchase._id });
  } catch (error) {
    console.error('Error in uploadPurchase:', error);
    res.status(500).json({ message: 'Error uploading purchase data', error: error.toString() });
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
    const { batchNo, productName, unsoldOnly, warehouseId } = req.query;
    let query = {};
    if (warehouseId) {
      query.currentWarehouse = new mongoose.Types.ObjectId(warehouseId);
    }
    if (batchNo) {
      query.batchNo = { $regex: batchNo, $options: 'i' };
    }

    if (productName) {
      query.productName = { $regex: productName, $options: 'i' };
    }

    const pieces1 = await Piece.find(query);
    const pieces  = await pieces1.filter(piece =>{ 
      if (unsoldOnly === 'true'){
          return piece.isSold === false;
      }
      else return true;
    });
    
    res.json({ success: true, data: pieces });
  } catch (error) {
    console.error('Error fetching pieces:', error);
    res.status(500).json({ success: false, message: 'Error fetching pieces', error: error.message });
  }
};

const getUniqueBatchesForProduct = async (req, res) => {
    try {
      const { productId } = req.params;
      const uniqueBatches = await Piece.distinct('batchNo', { productId });
      res.json({ success: true, data: uniqueBatches });
    } catch (error) {
      console.error('Error fetching unique batches:', error);
      res.status(500).json({ success: false, message: 'Error fetching unique batches', error: error.message });
    }
  };


  const getPiecesByBatch = async (req, res) => {
    try {
      const { batchNo } = req.params;
      const pieces = await Piece.find({ batchNo }).select('pieceNo customerLength customerWidth traderLength traderWidth thickness isDefective');
      res.json({ success: true, data: pieces });
    } catch (error) {
      console.error('Error fetching pieces by batch:', error);
      res.status(500).json({ success: false, message: 'Error fetching pieces', error: error.message });
    }
  };

  const getPieceById = async (req, res) => {
    try {
      const pieceId = req.params.id;
      const piece = await Piece.findById(pieceId);
      
      if (!piece) {
        return res.status(404).json({ message: 'Piece not found' });
      }
      
      res.status(200).json(piece);
    } catch (error) {
      console.error('Error fetching piece by ID:', error);
      res.status(500).json({ message: 'Error fetching piece', error: error.message });
    }
  };

const updatePieceLocation = async (pieceId, warehouseId, reason) => {
  try {
    const piece = await Piece.findById(pieceId);
    if (!piece) {
      throw new Error('Piece not found');
    }

    piece.currentWarehouse = warehouseId;
    piece.locationHistory.push({
      warehouse: warehouseId,
      timestamp: new Date(),
      reason: reason
    });

    await piece.save();
  } catch (error) {
    console.error('Error updating piece location:', error);
    throw error;
  }
};

// Example usage when creating a chalan
const createChalan = async (req, res) => {
  try {
    const { pieceIds, destinationWarehouseId } = req.body;

    // Create chalan logic here...

    // Update location for each piece in the chalan
    for (const pieceId of pieceIds) {
      await updatePieceLocation(pieceId, destinationWarehouseId, 'Chalan');
    }

    res.status(200).json({ message: 'Chalan created successfully' });
  } catch (error) {
    console.error('Error creating chalan:', error);
    res.status(500).json({ message: 'Error creating chalan', error: error.toString() });
  }
};

const getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate('ecommerceProducts.product', 'name') // Populate product names
      .sort({ purchaseDate: -1 }); // Sort by purchase date, newest first

    res.status(200).json({ success: true, data: purchases });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ success: false, message: 'Error fetching purchases', error: error.message });
  }
};

module.exports = { 
  uploadPurchase, 
  generateInvoice, 
  DisplayPieces, 
  getUniqueBatchesForProduct,
  getPiecesByBatch, 
  getPieceById,
  createChalan,
  updatePieceLocation,
  getAllPurchases
};
