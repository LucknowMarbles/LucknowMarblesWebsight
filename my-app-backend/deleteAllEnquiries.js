const mongoose = require('mongoose');
const Enquiry = require('./modals/Enquiry');

// ... existing createEnquiry and getAllEnquiries functions ...
const MONGODB_URI = "mongodb://localhost/your_database";

const deleteAllEnquiries = async () => {
    console.log("Deleting all enquiries");
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
    
        // Delete all pieces
        const result = await Enquiry.deleteMany({});
        console.log(`Deleted ${result.deletedCount} pieces`);
    
      } catch (error) {
        console.error('Error deleting pieces:', error);
      } finally {
        // Close the database connection
        await mongoose.connection.close();
        console.log('Disconnected from MongoDB');
      }
    };

deleteAllEnquiries();