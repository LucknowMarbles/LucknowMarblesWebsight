require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/Product'); // Import product routes
const enquiryRoutes = require('./routes/Enquiry');
const orderRoutes = require('./routes/Order'); // Import order routes
const pieceRoutes = require('./routes/Piece');
const saleEnquiryRoutes = require('./routes/SaleEnquiey');
const transactionRoutes = require('./routes/Transactions');
const warehouseRoutes = require('./routes/Warehouse');
const transferRoutes = require('./routes/transfer');
const taskRoutes = require('./routes/tasks');
const aiRoutes = require('./routes/ai');
const calendarRoutes = require('./routes/calendar');
const app = express();
const session = require('express-session');



// Enable CORS for all routes
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://lucknowmarbles.co.in',
  credentials: true
}));
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, {
    sessionId: req.session.id,
    hasTokens: !!req.session.googleTokens
  });
  next();
});
app.use(express.urlencoded({ extended: true }));

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
app.use('/api/transactions', transactionRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/calendar', calendarRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Important: Use the PORT environment variable
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Log when server starts
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
