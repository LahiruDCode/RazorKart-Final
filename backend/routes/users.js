const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, contactNumber, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      username,
      email,
      contactNumber,
      password, // Store password as plain text
      role: 'buyer', // Default role
      isActive: true,
      status: 'active',
      lastLogin: new Date()
    });

    // Save user to database
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Update user role
router.put('/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['admin', 'buyer', 'seller', 'content-manager', 'inquiry-manager'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Error updating user role' });
  }
});

// Update user status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['active', 'inactive'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Error updating user status' });
  }
});

// Get user statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
    res.json(stats);
  } catch (error) {
    console.error('Error getting user statistics:', error);
    res.status(500).json({ message: 'Error getting user statistics' });
  }
});

// Get buyer count for admin dashboard
router.get('/buyers/count', async (req, res) => {
  try {
    const count = await User.countDocuments({ role: 'buyer' });
    res.json({ count });
    console.log('Returned buyer count:', count);
  } catch (error) {
    console.error('Error getting buyer count:', error);
    res.status(500).json({ message: 'Error getting buyer count' });
  }
});

// Get users by role
router.get('/by-role/:role', async (req, res) => {
  try {
    const users = await User.find({ 
      role: req.params.role,
      isActive: true 
    }).select('-password');
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users by role:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/:id', async (req, res) => {
  try {
    const { username, email, contactNumber } = req.body;
    
    // Check if email is already in use by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use by another account' });
      }
    }

    // Find and update the user
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, contactNumber },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Error updating user profile' });
  }
});

// Change user password with plaintext storage (no encryption)
router.put('/:id/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    console.log('Password change request received:', { userId: req.params.id });
    
    // Find the user
    const user = await User.findById(req.params.id);
    if (!user) {
      console.log('User not found with ID:', req.params.id);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('User found, comparing plaintext passwords');
    console.log('Password details:', { 
      requestPasswordLength: currentPassword ? currentPassword.length : 0,
      storedPasswordLength: user.password ? user.password.length : 0,
      storedPassword: user.password || 'none'
    });
    
    // Direct comparison of plaintext passwords
    if (currentPassword !== user.password) {
      console.log('Password mismatch - current password is incorrect');
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    console.log('Password matched, updating to new password');
    
    // Store the new password as plaintext
    user.password = newPassword;
    await user.save();
    
    console.log('Password successfully updated for user:', user._id);
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    console.log('Delete request received for user ID:', req.params.id);
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Change password
router.put('/:id/password', async (req, res) => {
  try {
    const { password } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { password }, // Store as plain text
      { new: true, select: '-password' }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
});

// Update user profile
router.put('/:id', async (req, res) => {
  try {
    const { username, email, contactNumber } = req.body;
    
    // If updating email, check if it's already taken by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use by another account' });
      }
    }
    
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (contactNumber) updateData.contactNumber = contactNumber;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, select: '-password' }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

module.exports = router;
