const express = require('express');
const multer = require('multer');
const Piece = require('../modals/Piece');
const Purchase = require('../modals/Purchase');
const Product = require('../modals/Product');
const PDFDocument = require('pdfkit');

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
    
    // Fetch purchase with populated fields
    const purchase = await Purchase.findById(purchaseId)
      .populate('ecommerceProducts.product', 'name')
      .populate('ecommerceProducts.warehouse', 'name');

    const pieces = await Piece.find({ purchaseId })
      .populate('productId', 'name')
      .populate('currentWarehouse', 'name')
      .sort({ batchNo: 1, pieceNo: 1 });

    if (!purchase || !pieces) {
      return res.status(404).json({ message: 'Purchase or pieces not found' });
    }

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=purchase-${purchase.billNumber}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add header
    doc.fontSize(20).text('Purchase Invoice', { align: 'center' });
    doc.moveDown();

    // Add purchase details
    doc.fontSize(12)
      .text(`Bill Number: ${purchase.billNumber}`)
      .text(`Supplier: ${purchase.supplier}`)
      .text(`Purchase Date: ${new Date(purchase.purchaseDate).toLocaleDateString()}`)
      .text(`Payment Status: ${purchase.paymentStatus}`)
      .text(`Payment Method: ${purchase.paymentMethod}`)
      .text(`Total Amount: ₹${purchase.totalAmount.toFixed(2)}`)
      .moveDown();

    // Add enquiry products table
    if (pieces.length > 0) {
      doc.fontSize(14).text('Enquiry Products', { underline: true });
      doc.moveDown();

      // Group pieces by batch
      const batchGroups = pieces.reduce((groups, piece) => {
        const batch = piece.batchNo;
        if (!groups[batch]) {
          groups[batch] = [];
        }
        groups[batch].push(piece);
        return groups;
      }, {});

      Object.entries(batchGroups).forEach(([batchNo, batchPieces]) => {
        doc.fontSize(12).text(`Batch: ${batchNo}`);
        doc.moveDown();

        // Add table headers
        doc.fontSize(10)
          .text('Piece No', 50, doc.y, { width: 80 })
          .text('Product', 130, doc.y - 12, { width: 100 })
          .text('Dimensions', 230, doc.y - 12, { width: 120 })
          .text('Thickness', 350, doc.y - 12, { width: 70 })
          .text('Warehouse', 420, doc.y - 12, { width: 100 });
        doc.moveDown();

        // Add pieces
        batchPieces.forEach(piece => {
          const y = doc.y;
          doc.fontSize(10)
            .text(piece.pieceNo, 50, y)
            .text(piece.productId.name, 130, y)
            .text(`${piece.customerLength}×${piece.customerWidth}`, 230, y)
            .text(piece.thickness.toString(), 350, y)
            .text(piece.currentWarehouse.name, 420, y);
          doc.moveDown();
        });

        doc.moveDown();
      });
    }

    // Add e-commerce products table
    if (purchase.ecommerceProducts?.length > 0) {
      doc.addPage();
      doc.fontSize(14).text('E-commerce Products', { underline: true });
      doc.moveDown();

      // Add table headers
      doc.fontSize(10)
        .text('Product', 50, doc.y, { width: 200 })
        .text('Quantity', 250, doc.y - 12, { width: 100 })
        .text('Warehouse', 350, doc.y - 12, { width: 150 });
      doc.moveDown();

      // Add products
      purchase.ecommerceProducts.forEach(product => {
        const y = doc.y;
        doc.fontSize(10)
          .text(product.product.name, 50, y)
          .text(product.quantity.toString(), 250, y)
          .text(product.warehouse.name, 350, y);
        doc.moveDown();
      });
    }

    // Add notes if any
    if (purchase.notes) {
      doc.moveDown()
        .fontSize(12)
        .text('Notes:', { underline: true })
        .fontSize(10)
        .text(purchase.notes);
    }

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

const getIncompleteSales = async (req, res) => {
  try {
    // Find all pieces that have been partially sold
    const incompleteSales = await Piece.find({
      $and: [
        { soldArea: { $gt: 0 } },  // Has some sold area
        {
          $expr: {
            $lt: ["$soldArea", { $multiply: ["$customerLength", "$customerWidth"] }]
          }
        }
      ]
    }).select('pieceNo customerLength customerWidth soldArea');

    // Calculate areas and format response
    const formattedSales = incompleteSales.map(piece => {
      const totalArea = piece.customerLength * piece.customerWidth;
      return {
        pieceNo: piece.pieceNo,
        totalArea: totalArea.toFixed(2),
        soldArea: piece.soldArea.toFixed(2),
        remainingArea: (totalArea - piece.soldArea).toFixed(2)
      };
    });

    return res.status(200).json(formattedSales);

  } catch (error) {
    console.error('Error fetching incomplete sales:', error);
    return res.status(500).json({ 
      message: 'Error fetching incomplete sales data',
      error: error.message 
    });
  }
}; 

// Add this function to get pieces by purchase ID
const getPiecesByPurchaseId = async (req, res) => {
  try {
    const { purchaseId } = req.params;
    
    const pieces = await Piece.find({ purchaseId })
      .populate('currentWarehouse', 'name')
      .populate('productId', 'name')
      .sort({ batchNo: 1, pieceNo: 1 });

    if (!pieces) {
      return res.status(404).json({ 
        message: 'No pieces found for this purchase' 
      });
    }

    res.status(200).json(pieces);
  } catch (error) {
    console.error('Error fetching pieces:', error);
    res.status(500).json({ 
      message: 'Error fetching pieces',
      error: error.message 
    });
  }
};

module.exports = { 
  getPiecesByPurchaseId,
  uploadPurchase, 
  generateInvoice, 
  DisplayPieces, 
  getUniqueBatchesForProduct,
  getPiecesByBatch, 
  getPieceById,
  createChalan,
  updatePieceLocation,
  getAllPurchases,
  getIncompleteSales
};
