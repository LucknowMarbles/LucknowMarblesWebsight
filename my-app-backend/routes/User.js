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

router.put('/:userId/type', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isCustomer } = req.body;

    const user = await User.findByIdAndUpdate(userId, { isCustomer }, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update permissions based on user type
    if (isCustomer) {
      user.permissions = {
        viewProducts: true,
        placeOrder: true,
        submitEnquiry: true,
        // Set all other permissions to false
      };
    } else {
      // Set permissions for non-customer users
      // This is just an example, adjust as needed
      user.permissions.viewProducts = true;
      user.permissions.placeOrder = true;
      user.permissions.submitEnquiry = true;
      // Add any other default permissions for non-customer users
    }

    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user type', error: error.message });
  }
});

module.exports = router;