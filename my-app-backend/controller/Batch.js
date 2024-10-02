

const getPiecesByBatch = async (req, res) => {
    try {
      const { batchNo } = req.params;
      const pieces = await Piece.find({ batchNo }).select('pieceNo customerLength customerWidth traderLength traderWidth thickness isDefective');
      res.json({ success: true, data: pieces });
    } catch (error) {
      console.error('Error fetching pieces by batch:', error);
      res.status(500).json({ success: false, message: 'Error fetching pieces', error: error.message });
    }
  };