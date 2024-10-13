const Transaction = require('../modals/Transactions');
const Purchase = require('../modals/Purchase');
const Sale = require('../modals/Sale');

exports.createTransaction = async (req, res) => {
  try {
    const { type, amount, relatedParty, partyType, invoice, invoiceType, notes } = req.body;

    const newTransaction = new Transaction({
      type,
      amount,
      relatedParty,
      partyType,
      invoice,
      invoiceType,
      notes
    });

    const savedTransaction = await newTransaction.save();

    // Update the corresponding invoice
    if (invoiceType === 'Purchase') {
      await Purchase.findByIdAndUpdate(invoice, { $push: { transactions: savedTransaction._id } });
    } else if (invoiceType === 'Sale') {
      await Sale.findByIdAndUpdate(invoice, { $push: { transactions: savedTransaction._id } });
    }

    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getTransactionReport = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('relatedParty', 'name')
      .populate('invoice', 'billNumber totalAmount');

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getInvoices = async (req, res) => {
  try {
    const { partyId, partyType } = req.query;
    let invoices;

    if (partyType === 'Customer') {
      invoices = await Sale.find({ customer: partyId }).select('_id invoiceNumber');
    } else if (partyType === 'Vendor') {
      invoices = await Purchase.find({ supplier: partyId }).select('_id billNumber');
    } else {
      return res.status(400).json({ message: 'Invalid party type' });
    }

    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
