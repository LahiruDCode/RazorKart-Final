const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check if token exists in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded); // Log the decoded token

      // Get user from the token
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        console.log('User not found with ID:', decoded.userId);
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Set user info including the MongoDB _id and userId from token
      req.user = user;
      // Also include the userId from token for compatibility
      req.user.userId = decoded.userId;

      console.log('Authenticated user:', {
        id: user._id,
        email: user.email,
        role: user.role
      });

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

// Check if user has specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    console.log(`Checking role: user has ${req.user.role}, needs one of:`, roles);
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized to access this route`
      });
    }
    
    next();
  };
};

module.exports = { protect, authorize };
