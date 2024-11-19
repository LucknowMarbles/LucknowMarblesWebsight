const express = require('express');
const router = express.Router();
const uploadController = require('../controller/uploadController');
const { authenticateToken } = require('../Middleware/auth');

// Protected route for image upload
router.post('/', uploadController.upload,uploadController.uploadImage);

// Get upload status
router.get('/status/:uploadId', uploadController.getUploadStatus);

module.exports = router; 