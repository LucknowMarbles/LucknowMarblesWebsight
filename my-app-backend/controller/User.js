   const User = require('../modals/User'); // Corrected path to the User model
   const Customer = require('../modals/Customer');
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

   const getAllCustomers = async (req, res) => {
    try {
      const customers = await Customer.find({});
      res.json(customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      res.status(500).json({ error: 'Error fetching customers' });
    }
  };
   const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
      console.log(email, password);
      const customer = await Customer.findOne({ email });
      if (!customer) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }
  
      const user = await User.findOne({ customer: customer._id });
      if (!user) {
        return res.status(400).json({ error: 'Please set a password to login' });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }
  
      const token = jwt.sign(
        { id: user._id, customerId: customer._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      res.json({ token, isAdmin: user.isAdmin, message: 'Login successful' });
    } catch (error) {
      console.error('Login error:', error);
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
   const createCustomer = async (req, res) => {
    const { username, email, phoneNumber } = req.body;
    try {
      const existingCustomer = await Customer.findOne({ $or: [{ email }, { phoneNumber }] });
      if (existingCustomer) {
        return res.status(400).json({ error: 'Customer already exists' });
      }
  
      const customer = new Customer({ username, email, phoneNumber });
      await customer.save();
  
      res.status(201).json({ message: 'Customer created successfully', customer });
    } catch (error) {
      console.error('Customer creation error:', error);
      res.status(400).json({ error: error.message });
    }
  };

  const convertToUser = async (req, res) => {
    const { customerId, password } = req.body;
    try {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
  
      const existingUser = await User.findOne({ customer: customerId });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists for this customer' });
      }
  
      const user = new User({
        customer: customerId,
        password,
        isAdmin: false,
        permissions: {
          viewProducts: true,
        placeOrder: true,
        submitEnquiry: true,
        // Set other permissions as needed
      }
    });

    await user.save();

    res.status(201).json({ message: 'Customer converted to user successfully', user });
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(400).json({ error: error.message });
  }
};
const VarifyCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({ phoneNumber: req.params.phoneNumber });
    if (customer) {
      res.json(customer);
    } else {
      res.json(null);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error verifying customer', error: error.message });
  }
};

   module.exports = { 
    VarifyCustomer,
     createCustomer,
     convertToUser,
     registerUser, 
     loginUser, 
     getUserProfile, 
     checkUser, 
     checkPhoneNumber, 
     updateUserPermissions, 
     approveUser, 
     disapproveUser,
     getAllUsers,
     getAllCustomers
   };