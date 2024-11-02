const express = require('express');
const router = express.Router();
const aiController = require('../controller/aiController');

router.post('/generate-content', aiController.generateContent);

module.exports = router;
