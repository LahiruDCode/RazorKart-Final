const express = require('express');
const router = express.Router();
const { isAuthenticatedSeller } = require('../middleware/auth');

// Placeholder routes - will implement controllers later
router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Order routes working'
    });
});

module.exports = router; 