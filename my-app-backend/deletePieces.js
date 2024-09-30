
const Piece = require('./modals/Piece');

const deleteAllPieces = async (req, res) => {
    try {
      const result = await Piece.deleteMany({});
      res.status(200).json({ 
        message: 'All pieces have been deleted', 
        deletedCount: result.deletedCount 
      });
    } catch (error) {
      console.error('Error deleting pieces:', error);
      res.status(500).json({ 
        message: 'Error deleting pieces', 
        error: error.toString() 
      });
    }
  };
  module.exports = { 
    deleteAllPieces  // Add this line
  };