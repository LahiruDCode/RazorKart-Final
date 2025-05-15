const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register User
router.post('/register', async (req, res) => {
  try {
    const { username, email, contactNumber, password } = req.body;
    console.log('Registration attempt:', { username, email, contactNumber });

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user with plain text password
    const user = new User({
      username,
      email,
      contactNumber,
      password, // Store as plain text
      role: 'buyer',
      status: 'active'
    });

    await user.save();
    console.log('User created successfully:', email);

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        contactNumber: user.contactNumber,
        status: user.status
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('Found user:', {
      email: user.email,
      role: user.role,
      status: user.status
    });

    // Simple string comparison for password
    const isMatch = (password === user.password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is active
    if (user.status !== 'active') {
      console.log('Inactive account:', email);
      return res.status(403).json({ message: 'Account is inactive' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Convert role to lowercase for consistency
    const normalizedRole = user.role.toLowerCase();

    // Generate token with normalized role
    const token = jwt.sign(
      { userId: user._id, role: normalizedRole },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful for:', email, 'with role:', normalizedRole);
    res.json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: normalizedRole,
        contactNumber: user.contactNumber,
        status: user.status,
        lastLogin: user.lastLogin
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error occurred during login' });
  }
});

// Google Sign-in endpoint
router.post('/google-signin', async (req, res) => {
  try {
    const { email, username, googleId, photoURL } = req.body;
    console.log('Google sign-in attempt:', { email, username });

    if (!email || !googleId) {
      return res.status(400).json({ message: 'Email and Google ID are required' });
    }

    // Check if user with this email already exists
    let user = await User.findOne({ email });

    if (user) {
      // Update existing user with Google info if needed
      if (!user.googleId) {
        user.googleId = googleId;
        if (photoURL) user.photoURL = photoURL;
        await user.save();
        console.log('Updated existing user with Google ID:', email);
      }
    } else {
      // Create new user with Google data
      user = new User({
        username: username || email.split('@')[0],
        email,
        contactNumber: '',  // Optional field, can be updated later
        password: Math.random().toString(36).slice(-10),  // Generate a random password
        googleId,
        photoURL,
        role: 'buyer',
        status: 'active'
      });

      await user.save();
      console.log('Created new user via Google auth:', email);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Google login successful for:', email);
    res.json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        contactNumber: user.contactNumber,
        status: user.status,
        photoURL: user.photoURL,
        lastLogin: user.lastLogin
      },
      token
    });
  } catch (error) {
    console.error('Google sign-in error:', error);
    res.status(500).json({ message: 'Error during Google sign-in' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
