const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: false,
    default: ''
  },
  role: {
    type: String,
    enum: ['admin', 'buyer', 'seller', 'content-manager', 'inquiry-manager'],
    default: 'buyer',
    set: v => v.toLowerCase() // Ensure role is always lowercase
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  // Google authentication fields
  googleId: {
    type: String,
    sparse: true
  },
  photoURL: {
    type: String,
    default: ''
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;
