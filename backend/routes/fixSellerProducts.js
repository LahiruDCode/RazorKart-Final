const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');
const SellerProduct = require('../models/SellerProduct');
const User = require('../models/User');
const mongoose = require('mongoose');

// Clear all seller product associations and set up new ones
router.post('/reset-and-setup', async (req, res) => {
    try {
        // First, clear all existing seller-product associations
        await SellerProduct.deleteMany({});
        console.log('All seller-product associations cleared.');
        
        // Get all products
        const products = await Product.find();
        console.log(`Found ${products.length} products to distribute.`);
        
        // Get the seller users
        const seller1 = await User.findOne({ email: 'testing01@gmail.com' });
        const seller2 = await User.findOne({ email: 'testing02@gmail.com' });
        
        if (!seller1 || !seller2) {
            return res.status(404).json({
                success: false,
                message: 'One or more seller accounts not found'
            });
        }
        
        // Divide products between sellers (even-indexed to seller1, odd-indexed to seller2)
        const seller1Products = [];
        const seller2Products = [];
        
        products.forEach((product, index) => {
            if (index % 2 === 0) {
                seller1Products.push({
                    userId: seller1._id,
                    productId: product._id
                });
            } else {
                seller2Products.push({
                    userId: seller2._id,
                    productId: product._id
                });
            }
        });
        
        // Insert the associations
        if (seller1Products.length > 0) {
            await SellerProduct.insertMany(seller1Products);
        }
        
        if (seller2Products.length > 0) {
            await SellerProduct.insertMany(seller2Products);
        }
        
        res.status(200).json({
            success: true,
            message: `Successfully distributed products: ${seller1Products.length} to ${seller1.username} and ${seller2Products.length} to ${seller2.username}`,
            distribution: {
                [seller1.username]: seller1Products.length,
                [seller2.username]: seller2Products.length
            }
        });
    } catch (error) {
        console.error('Error setting up seller products:', error);
        res.status(500).json({
            success: false,
            message: 'Error setting up seller products',
            error: error.message
        });
    }
});

module.exports = router;
