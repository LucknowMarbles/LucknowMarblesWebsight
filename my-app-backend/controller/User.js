   const User = require('../modals/User'); // Corrected path to the User model
   const bcrypt = require('bcryptjs');
   const jwt = require('jsonwebtoken');
 
   const registerUser = async (req, res) => {
     const { username, email, password, adminSecret, isCustomer } = req.body;
     try {
       // Check if user already exists
       const existingUser = await User.findOne({ email });
       if (existingUser) {
         return res.status(400).json({ error: 'User already exists' });
       }

       // Hash the password
       const salt = await bcrypt.genSalt(10);
       const hashedPassword = await bcrypt.hash(password, salt);

       // Create new user
       const isAdmin = adminSecret === process.env.ADMIN_SECRET;
       const user = new User({ 
         username, 
         email, 
         password: hashedPassword, 
         isAdmin,
         isCustomer: isCustomer !== undefined ? isCustomer : true // Default to true if not specified
       });

       // Set permissions based on user type
       if (isAdmin) {
         Object.keys(user.permissions).forEach(permission => {
           user.permissions[permission] = true;
         });
       } else if (!isCustomer) {
         // For non-admin, non-customer users, you might want to set specific permissions
         // This is just an example, adjust as needed
         user.permissions.viewProducts = true;
         user.permissions.placeOrder = true;
         user.permissions.submitEnquiry = true;
         // Add any other default permissions for non-customer users
       }

       // Save user to database
       await user.save();

       res.status(201).json({ message: 'User registered successfully', isAdmin, isCustomer: user.isCustomer });
     } catch (error) {
       console.error('Registration error:', error);
       res.status(400).json({ error: error.message });
     }
   };

   

   const loginUser = async (req, res) => {
     console.log('Received login request:', req.body);
     const { email, password } = req.body;
     try {
       if (!email || !password) {
         console.log('Missing email or password');
         return res.status(400).json({ error: 'Email and password are required' });
       }

       console.log('Login attempt:', email);

       // Find user by email
       const user = await User.findOne({ email });
       if (!user) {
         console.log('User not found for email:', email);
         return res.status(400).json({ error: 'Invalid email or password' });
       }

       console.log('User found:', user.email);

       // Compare passwords
       const isMatch = await bcrypt.compare(password, user.password);
       if (!isMatch) {
         console.log('Password does not match for user:', email);
         return res.status(400).json({ error: 'Invalid email or password' });
       }

       // Generate JWT
       const token = jwt.sign(
         { id: user._id, isAdmin: user.isAdmin }, 
         process.env.JWT_SECRET, 
         { expiresIn: '1h' }
       );

       console.log('Login successful for user:', email);

       res.json({ token, isAdmin: user.isAdmin, message: 'Login successful' });
     } catch (error) {
       console.error('Error during login:', error);
       res.status(400).json({ error: error.message });
     }
   };

   const getUserProfile = async (req, res) => {
     try {
       const token = req.header('Authorization').replace('Bearer ', '');
       const decoded = jwt.verify(token, process.env.JWT_SECRET);
       const user = await User.findById(decoded.id);
       if (!user) {
         return res.status(404).json({ error: 'User not found' });
       }
       res.json(user);
     } catch (error) {
       console.error('Error getting user profile:', error);
       res.status(401).json({ error: 'Please authenticate' });
     }
   };

   const checkUser = async (req, res) => {
     const { email } = req.params;
     try {
       const user = await User.findOne({ email });
       if (user) {
         res.json({ exists: true, email: user.email });
       } else {
         res.json({ exists: false });
       }
     } catch (error) {
       console.error('Error checking user:', error);
       res.status(400).json({ error: error.message });
     }
   };

   const checkPhoneNumber = async (req, res) => {
     try {
       const { phoneNumber } = req.body;
       const user = await User.findOne({ phoneNumber });
       res.json({ exists: !!user });
     } catch (error) {
       console.error('Error checking phone number:', error);
       res.status(500).json({ error: error.message });
     }
   };

   const updateUserPermissions = async (req, res) => {
     try {
       const { userId } = req.params;
       const { permissions } = req.body;

       const user = await User.findByIdAndUpdate(userId, { permissions }, { new: true });

       if (!user) {
         return res.status(404).json({ message: 'User not found' });
       }

       res.json(user);
     } catch (error) {
       res.status(500).json({ message: 'Error updating user permissions', error: error.message });
     }
   };

   const approveUser = async (req, res) => {
     try {
       const { userId } = req.params;

       const user = await User.findByIdAndUpdate(userId, { isApproved: true }, { new: true });

       if (!user) {
         return res.status(404).json({ message: 'User not found' });
       }

       res.json(user);
     } catch (error) {
       res.status(500).json({ message: 'Error approving user', error: error.message });
     }
   };

   const disapproveUser = async (req, res) => {
     try {
       const { userId } = req.params;

       const user = await User.findByIdAndUpdate(userId, { isApproved: false }, { new: true });

       if (!user) {
         return res.status(404).json({ message: 'User not found' });
       }

       res.json(user);
     } catch (error) {
       res.status(500).json({ message: 'Error disapproving user', error: error.message });
     }
   };

   const getAllUsers = async (req, res) => {
     try {
       const users = await User.find({}).select('-password'); // Exclude password field
       res.json(users);
     } catch (error) {
       console.error('Error fetching all users:', error);
       res.status(500).json({ error: 'Error fetching users' });
     }
   };

   module.exports = { 
     registerUser, 
     loginUser, 
     getUserProfile, 
     checkUser, 
     checkPhoneNumber, 
     updateUserPermissions, 
     approveUser, 
     disapproveUser,
     getAllUsers // Add this line
   };