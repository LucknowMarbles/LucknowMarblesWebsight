const Order = require('../modals/Order');
const jwt = require('jsonwebtoken');

const createOrder = async (req, res) => {
  try {
    const { items, userInfo, subtotal, deliveryCharge, totalAmount } = req.body;
    let userId = null;

    // Check if the user is authenticated
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (error) {
        // Token is invalid, but we'll still allow the order to be created
        console.log('Invalid token, creating order without user reference');
      }
    }

    const order = new Order({
      user: userId,
      items,
      userInfo,
      subtotal,
      deliveryCharge,
      totalAmount
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message });
  }
};

const createGuestOrder = async (req, res) => {
  try {
    const { items, userInfo, subtotal, deliveryCharge, totalAmount } = req.body;
    const order = new Order({
      items,
      userInfo,
      subtotal,
      deliveryCharge,
      totalAmount
    });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createOrder, createGuestOrder, getAllOrders, getOrderById, updateOrder, deleteOrder };