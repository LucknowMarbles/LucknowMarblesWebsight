const express = require('express');
const router = express.Router();
const Warehouse = require('../modals/Warehouse');
const   {CreateWarehouse,
AllWarehouses,
GetWarehouse,
UpgateWarehouse} = require('../controller/Warehouse');
const warehouseModelController = require('../controller/warehouseModelController');
// Create a new warehouse
router.post('/',CreateWarehouse);

// Get all warehouses
router.get('/', AllWarehouses);

// Get a specific warehouse
router.get('/:id', GetWarehouse);

// Update a warehouse
router.patch('/:id',UpgateWarehouse);

router.post('/upload-model', warehouseModelController.uploadModel);
router.get('/model/:warehouseId', warehouseModelController.getModel);
router.delete('/model/:warehouseId', warehouseModelController.deleteModel);

module.exports = router;

