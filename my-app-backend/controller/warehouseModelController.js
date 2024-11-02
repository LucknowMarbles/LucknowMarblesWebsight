const multer = require('multer');
const path = require('path');
const Warehouse = require('../modals/Warehouse');
const fs = require('fs').promises;

// Configure multer storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/warehouse-models';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `model-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Configure multer upload
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.gltf', '.glb'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only GLTF and GLB files are allowed.'));
    }
  }
}).single('model'); // Configure for single file upload with field name 'model'

// Controller methods
const warehouseModelController = {
  uploadModel: async (req, res) => {
    try {
      // Handle file upload using multer
      upload(req, res, async (err) => {
        if (err) {
          console.error('Upload error:', err);
          return res.status(400).json({ 
            error: err.message || 'Error uploading file' 
          });
        }

        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        const { warehouseId } = req.body;
        if (!warehouseId) {
          return res.status(400).json({ error: 'Warehouse ID is required' });
        }

        try {
          // Create model URL
          const modelUrl = `/warehouse-models/${req.file.filename}`;

          // Update warehouse in database
          const warehouse = await Warehouse.findByIdAndUpdate(
            warehouseId,
            {
              modelUrl,
              modelType: path.extname(req.file.originalname).substring(1),
              lastUpdated: new Date()
            },
            { new: true }
          );

          if (!warehouse) {
            return res.status(404).json({ error: 'Warehouse not found' });
          }

          console.log('Model uploaded successfully:', {
            warehouseId,
            modelUrl,
            filename: req.file.filename
          });

          res.json({
            message: 'Model uploaded successfully',
            modelUrl,
            warehouse
          });
        } catch (error) {
          console.error('Database error:', error);
          res.status(500).json({ error: 'Failed to update warehouse' });
        }
      });
    } catch (error) {
      console.error('Controller error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getModel: async (req, res) => {
    try {
      const { warehouseId } = req.params;
      const warehouse = await Warehouse.findById(warehouseId);
      
      if (!warehouse || !warehouse.modelUrl) {
        return res.status(404).json({ error: 'Model not found' });
      }

      res.json({
        modelUrl: warehouse.modelUrl,
        modelType: warehouse.modelType
      });
    } catch (error) {
      console.error('Get model error:', error);
      res.status(500).json({ error: 'Failed to get model' });
    }
  },

  deleteModel: async (req, res) => {
    try {
      const { warehouseId } = req.params;
      const warehouse = await Warehouse.findById(warehouseId);
      
      if (!warehouse || !warehouse.modelUrl) {
        return res.status(404).json({ error: 'Model not found' });
      }

      // Delete file
      const filePath = path.join(__dirname, '..', 'uploads', warehouse.modelUrl);
      await fs.unlink(filePath);

      // Update warehouse
      warehouse.modelUrl = null;
      warehouse.modelType = null;
      await warehouse.save();

      res.json({ message: 'Model deleted successfully' });
    } catch (error) {
      console.error('Delete model error:', error);
      res.status(500).json({ error: 'Failed to delete model' });
    }
  }
};

module.exports = warehouseModelController;