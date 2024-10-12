const express = require('express');
const router = express.Router();
const Customer = require('../modals/Customer');
const Order = require('../modals/Order');
const jwt = require('jsonwebtoken');
const { sendSMS, sendEmail } = require('../utils/notifications');

// Send OTP
const SendOTP = async (req, res) => {
  const { contact } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);
  
  try {
    console.log(req.body);
    /*
    VA3ff1df5b2b783414dfeb9f686c6498b1
    const customer = await Customer.findOneAndUpdate(
      { $or: [{ phoneNumber: contact }, { email: contact }] },
      { otp },
      { new: true, upsert: true }
    );
 */
    if (contact.includes('@')) {
      await sendEmail(contact, 'Your OTP', `Your OTP is: ${otp}`);
    } else {
      await sendSMS(contact, `Your OTP is: ${otp}`);
    }

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

// Verify OTP and generate token
const VerifyOTP = async (req, res) => {
  const { contact, otp } = req.body;

  try {
    const customer = await Customer.findOne({
      $or: [{ phoneNumber: contact }, { email: contact }],
      otp
    });

    if (!customer) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const token = jwt.sign({ customerId: customer._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    customer.otp = undefined;
    await customer.save();

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
};

// Get customer orders
const GetOrders = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const orders = await Order.find({ customer: decoded.customerId }).populate('items.product');
    res.status(200).json(orders);
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = { GetOrders, SendOTP, VerifyOTP };