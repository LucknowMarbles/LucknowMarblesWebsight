const express = require('express');
const router = express.Router();
const calendarController = require('../controller/calendarController');

// Verify that all controller methods exist before using them
router.get('/auth-url', calendarController.getAuthUrl);
router.get('/auth-callback', calendarController.handleAuthCallback);
router.get('/auth-status', calendarController.getAuthStatus);
router.get('/list', calendarController.listCalendars);
router.post('/events', calendarController.createEvent);

module.exports = router; 