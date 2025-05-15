const express = require('express');
const router = express.Router();
const {
    getStoreDetails,
    updateStore
} = require('../controllers/storeController');
const { protect } = require('../middleware/auth');

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Store routes are working' });
});

// Get store details (original route for backward compatibility)
router.get('/', protect, getStoreDetails);

// Get current user's store details
router.get('/my-store', protect, getStoreDetails);

// Update store details (original route for backward compatibility)
router.put('/', protect, updateStore);

// Update current user's store details
router.put('/my-store', protect, updateStore);

// Create new store (will handle this in the updateStore controller if store doesn't exist)
router.post('/', protect, updateStore);

module.exports = router;
