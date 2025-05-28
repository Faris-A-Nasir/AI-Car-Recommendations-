const express = require('express');
// const bcrypt = require('bcrypt');
const bcrypt = require('bcryptjs');
const User = require('../models/user');  // Import your User model
const router = express.Router();
const jwt = require('jsonwebtoken');


// Signup route
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // ✅ Check password strength
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;

    if (!strongPasswordRegex.test(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character',
      });
    }

    // ✅ Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // ✅ Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Plain password:', password);
    console.log('Hashed password:', hashedPassword);

    // ✅ Create and save new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Error creating user' });
  }
});


// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Step 1: Find the user in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid Email' });
    }

    // Step 2: Compare the password with the hashed password in the database
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: 'Incorrect Password' });
    }

    // Step 3: Generate a JWT token
    const token = jwt.sign(
  { userId: user._id, email: user.email, name: user.name },
  process.env.JWT_SECRET_KEY,
  { expiresIn: '1h' }
);

    // Step 4: Send the token back to the frontend
    return res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
