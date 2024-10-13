const express = require('express');
const router = express.Router();
const Warehouse = require('../modals/Warehouse');
const   {CreateWarehouse,
AllWarehouses,
GetWarehouse,
UpgateWarehouse} = require('../controller/Warehouse');

// Create a new warehouse
router.post('/',CreateWarehouse);

// Get all warehouses
router.get('/', AllWarehouses);

// Get a specific warehouse
router.get('/:id', GetWarehouse);

// Update a warehouse
router.patch('/:id',UpgateWarehouse);

module.exports = router;

