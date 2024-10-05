const PaymentComplete = async (req, res)  => {
    try {
      const order = await Order.findByIdAndUpdate(req.params.id, { paymentStatus: 'completed' }, { new: true });
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: 'Error updating payment status', error: error.message });
    }
  };

