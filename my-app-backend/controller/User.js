   const User = require('./routes/User');
   const bcrypt = require('bcryptjs');
   const jwt = require('jsonwebtoken');

   const registerUser = async (req, res) => {
     const { username, email, password } = req.body;
     try {
       const user = new User({ username, email, password });
       await user.save();
       res.status(201).json({ message: 'User registered successfully' });
     } catch (error) {
       res.status(400).json({ error: error.message });
     }
   };

   const loginUser = async (req, res) => {
     const { email, password } = req.body;
     try {
       const user = await User.findOne({ email });
       if (!user) {
         return res.status(400).json({ error: 'Invalid email or password' });
       }
       const isMatch = await bcrypt.compare(password, user.password);
       if (!isMatch) {
         return res.status(400).json({ error: 'Invalid email or password' });
       }
       const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, 'secret', { expiresIn: '1h' });
       res.json({ token });
     } catch (error) {
       res.status(400).json({ error: error.message });
     }
   };

   const getUserProfile = async (req, res) => {
     const token = req.header('Authorization').replace('Bearer ', '');
     const decoded = jwt.verify(token, 'secret');
     const user = await User.findById(decoded.id);
     res.json(user);
   };

   module.exports = { registerUser, loginUser, getUserProfile };