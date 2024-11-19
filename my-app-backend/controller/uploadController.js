const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Track upload status
const uploadStatus = new Map();

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only images are allowed!'), false);
    }

    // Check file extension
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const extension = file.originalname.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return cb(new Error('Invalid file type!'), false);
    }

    cb(null, true);
  }
}).single('image');

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No image file provided' 
      });
    }

    const uploadId = uuidv4();
    uploadStatus.set(uploadId, {
      status: 'processing',
      progress: 0
    });

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to Cloudinary with options
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'products',
      transformation: [
        { width: 1000, crop: 'limit' }, // Resize large images
        { quality: 'auto:good' } // Optimize quality
      ],
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET // Optional: use upload preset
    });

    // Update status
    uploadStatus.set(uploadId, {
      status: 'completed',
      progress: 100,
      url: result.secure_url,
      publicId: result.public_id
    });

    // Clean up status after 1 hour
    setTimeout(() => {
      uploadStatus.delete(uploadId);
    }, 3600000);

    res.status(200).json({
      success: true,
      uploadId,
      imageUrl: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    if (error.http_code === 400) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image file'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Image upload failed',
      details: error.message
    });
  }
};

const getUploadStatus = async (req, res) => {
  const { uploadId } = req.params;
  const status = uploadStatus.get(uploadId);

  if (!status) {
    return res.status(404).json({
      success: false,
      error: 'Upload not found'
    });
  }

  res.json({
    success: true,
    status
  });
};

const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        error: 'Public ID is required'
      });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      throw new Error('Failed to delete image');
    }

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete image',
      details: error.message
    });
  }
};

module.exports = {
  uploadImage,
  getUploadStatus,
  deleteImage,
  upload
};