const mongoose = require('mongoose');
const Piece = require('./modals/Piece');

// MongoDB connection string - replace with your actual connection string
const MONGODB_URI = "mongodb://localhost/your_database";

const deleteAllPieces = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Delete all pieces
    const result = await Piece.deleteMany({});
    console.log(`Deleted ${result.deletedCount} pieces`);

  } catch (error) {
    console.error('Error deleting pieces:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
};

// Run the deletion function
deleteAllPieces();