const express = require('express');
const router = express.Router();
const {
  addToCart,
  getCartItems,
  removeFromCart,
  updateCartItem,
  testCart
} = require('../controllers/cartController');

// Wrap async route handlers with error handling
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Test route
router.get('/test', asyncHandler(testCart));

// Cart routes
router.post('/add', asyncHandler(addToCart));
router.get('/items', asyncHandler(getCartItems));
router.delete('/remove/:productId', asyncHandler(removeFromCart));
router.put('/update/:productId', asyncHandler(updateCartItem));

module.exports = router;
