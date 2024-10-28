require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/Product'); // Import product routes
const enquiryRoutes = require('./routes/Enquiry');
const orderRoutes = require('./routes/Order'); // Import order routes
const pieceRoutes = require('./routes/Piece');
const saleEnquiryRoutes = require('./routes/SaleEnquiey');
const otpRoutes = require('./routes/Otp');
const transactionRoutes = require('./routes/Transactions');
const warehouseRoutes = require('./routes/Warehouse');
const transferRoutes = require('./routes/transfer');
const app = express();



// Enable CORS for all routes
const corsOptions = {
  origin: 'http://localhost:3000', // Allow only this origin
  credentials: true, // Allow cookies to be sent with requests
};

app.use(cors(corsOptions));
app.use(express.json());

// Connect to MongoDB (replace with your connection string)
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import and use the user routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes); // Use product routes
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/orders', orderRoutes); // Use order routes
app.use('/api/pieces', pieceRoutes);
app.use('/api/sale', saleEnquiryRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/transfers', transferRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
