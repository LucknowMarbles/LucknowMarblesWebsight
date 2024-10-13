const express = require('express');
const router = express.Router();
const Warehouse = require('../modals/Warehouse');

// Create a new warehouse
const CreateWarehouse = async (req, res) => {
  try {
    const warehouse = new Warehouse(req.body);
    const savedWarehouse = await warehouse.save();
    res.status(201).json(savedWarehouse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all warehouses
const AllWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find();
    res.json(warehouses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific warehouse
const GetWarehouse = (req, res) => {
  res.json(res.warehouse);
};

// Update a warehouse
const UpgateWarehouse = async (req, res) => {
  if (req.body.name != null) {
    res.warehouse.name = req.body.name;
  }
  if (req.body.address != null) {
    res.warehouse.address = req.body.address;
  }
  if (req.body.contactPerson != null) {
    res.warehouse.contactPerson = req.body.contactPerson;
  }
  if (req.body.capacity != null) {
    res.warehouse.capacity = req.body.capacity;
  }
  if (req.body.isActive != null) {
    res.warehouse.isActive = req.body.isActive;
  }

  try {
    const updatedWarehouse = await res.warehouse.save();
    res.json(updatedWarehouse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  CreateWarehouse,
  AllWarehouses,
  GetWarehouse,
  UpgateWarehouse
};
