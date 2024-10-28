const Transfer = require('../modals/Transfer');
const Product = require('../modals/Product');
const Piece = require('../modals/Piece');
const Warehouse = require('../modals/Warehouse');

const createBulkTransfer = async (req, res) => {
  try {
    const { productId, fromWarehouseId, toWarehouseId, quantity, notes } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if warehouses exist
    const fromWarehouse = await Warehouse.findById(fromWarehouseId);
    const toWarehouse = await Warehouse.findById(toWarehouseId);
    if (!fromWarehouse || !toWarehouse) {
      return res.status(404).json({ message: 'One or both warehouses not found' });
    }

    // Check if there's enough quantity in the source warehouse
    const sourceQuantity = product.warehouseQuantities.find(wq => wq.warehouse.toString() === fromWarehouseId)?.quantity || 0;
    if (sourceQuantity < quantity) {
      return res.status(400).json({ message: 'Insufficient quantity in source warehouse' });
    }

    // Create transfer
    const transfer = new Transfer({
      transferType: 'Bulk',
      product: productId,
      fromWarehouse: fromWarehouseId,
      toWarehouse: toWarehouseId,
      quantity,
      notes
    });

    await transfer.save();

    // Update product quantities
    await Product.findByIdAndUpdate(productId, {
      $inc: {
        [`warehouseQuantities.$[from].quantity`]: -quantity,
        [`warehouseQuantities.$[to].quantity`]: quantity
      }
    }, {
      arrayFilters: [
        { 'from.warehouse': fromWarehouseId },
        { 'to.warehouse': toWarehouseId }
      ],
      new: true
    });

    res.status(201).json(transfer);
  } catch (error) {
    console.error('Error creating bulk transfer:', error);
    res.status(500).json({ message: 'Failed to create bulk transfer', error: error.message });
  }
};

const createPieceTransfer = async (req, res) => {
  try {
    const { pieceIds, fromWarehouseId, toWarehouseId, notes } = req.body;

    // Check if warehouses exist
    const fromWarehouse = await Warehouse.findById(fromWarehouseId);
    const toWarehouse = await Warehouse.findById(toWarehouseId);
    if (!fromWarehouse || !toWarehouse) {
      return res.status(404).json({ message: 'One or both warehouses not found' });
    }

    // Check if all pieces exist and are in the source warehouse
    const pieces = await Piece.find({ _id: { $in: pieceIds }, currentWarehouse: fromWarehouseId });
    if (pieces.length !== pieceIds.length) {
      return res.status(400).json({ message: 'One or more pieces not found or not in the source warehouse' });
    }

    // Create transfer
    const transfer = new Transfer({
      transferType: 'Piece',
      pieces: pieceIds,
      fromWarehouse: fromWarehouseId,
      toWarehouse: toWarehouseId,
      notes
    });

    await transfer.save();

    // Update piece locations
    await Piece.updateMany(
      { _id: { $in: pieceIds } },
      { 
        $set: { currentWarehouse: toWarehouseId },
        $push: { 
          locationHistory: {
            warehouse: toWarehouseId,
            timestamp: new Date(),
            reason: 'Transfer'
          }
        }
      }
    );

    res.status(201).json(transfer);
  } catch (error) {
    console.error('Error creating piece transfer:', error);
    res.status(500).json({ message: 'Failed to create piece transfer', error: error.message });
  }
};

const getTransfers = async (req, res) => {
  try {
    const transfers = await Transfer.find()
      .populate('product', 'name')
      .populate('pieces', 'pieceNo')
      .populate('fromWarehouse', 'name')
      .populate('toWarehouse', 'name');
    res.json(transfers);
  } catch (error) {
    console.error('Error fetching transfers:', error);
    res.status(500).json({ message: 'Failed to fetch transfers', error: error.message });
  }
};

const getTransferById = async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id)
      .populate('product', 'name')
      .populate('pieces', 'pieceNo')
      .populate('fromWarehouse', 'name')
      .populate('toWarehouse', 'name');
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }
    res.json(transfer);
  } catch (error) {
    console.error('Error fetching transfer:', error);
    res.status(500).json({ message: 'Failed to fetch transfer', error: error.message });
  }
};

const updateTransferStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const transfer = await Transfer.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }
    res.json(transfer);
  } catch (error) {
    console.error('Error updating transfer status:', error);
    res.status(500).json({ message: 'Failed to update transfer status', error: error.message });
  }
};

module.exports = {
  createBulkTransfer,
  createPieceTransfer,
  getTransfers,
  getTransferById,
  updateTransferStatus
};
