const express = require('express');
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  checkUser, 
  checkPhoneNumber,
  updateUserPermissions, 
  approveUser, 
  disapproveUser,
  getAllUsers // Make sure this is imported
} = require('../controller/user'); // Corrected path to the controller
const authMiddleware = require('../Middleware/auth');
const adminMiddleware = require('../Middleware/admin');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', getUserProfile);
router.get('/check/:email', authMiddleware,checkUser);
router.post('/check-phone', authMiddleware,checkPhoneNumber);

router.get('/', authMiddleware, getAllUsers);
router.put('/:id/permissions', authMiddleware, adminMiddleware, updateUserPermissions);
router.put('/:userId/permissions', authMiddleware, adminMiddleware, updateUserPermissions);
router.put('/:userId/approve', authMiddleware, adminMiddleware, approveUser);
router.put('/:userId/disapprove', authMiddleware, adminMiddleware, disapproveUser);

router.get('/all', getAllUsers); // Add this line to create the route

module.exports = router;