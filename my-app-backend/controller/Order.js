const Order = require('../modals/Order');

const createOrder = async (req, res) => {
  try {
    const { cart } = req.body;
    const order = new Order({
      user: req.user.id,
      products: cart.map(item => ({ product: item._id, quantity: 1 }))
    });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createGuestOrder = async (req, res) => {
  try {
    const { cart, phoneNumber } = req.body;
    const order = new Order({
      phoneNumber,
      products: cart.map(item => ({ product: item._id, quantity: 1 }))
    });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createOrder, createGuestOrder };