const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');
const SellerProduct = require('../models/SellerProduct');
const User = require('../models/User');
const mongoose = require('mongoose');
const { protect, authorize } = require('../middleware/auth');

// Get all products for a specific seller - protected route only for authenticated users
router.get('/my-products', protect, authorize('seller', 'admin'), async (req, res) => {
    try {
        // Get the seller's ID from the authenticated user
        const userId = req.user._id;
        const userIdStr = userId.toString();
        
        console.log(`Fetching products for seller with ID: ${userId}`);

        // STEP 1: Find products directly associated with this seller via userId field
        console.log(`Searching for products with direct userId field: ${userId}`);
        const directProducts = await Product.find({ 
            $or: [
                { userId: userId },          // ObjectId format
                { userId: userIdStr }         // String format
            ]
        })
        .populate({
            path: 'store',
            select: 'name description coverPhoto logo contactEmail contactPhone address'
        });
        
        console.log(`Found ${directProducts.length} products with direct userId`);

        // STEP 2: Find all product IDs associated with this seller in the mapping table
        const sellerProducts = await SellerProduct.find({ userId });
        const productIds = sellerProducts.map(sp => sp.productId);

        console.log(`Found ${productIds.length} additional products from SellerProduct mapping table`);

        // STEP 3: Find all products from the mapping table
        let mappedProducts = [];
        if (productIds.length > 0) {
            mappedProducts = await Product.find({ 
                _id: { $in: productIds } 
            })
            .populate({
                path: 'store',
                select: 'name description coverPhoto logo contactEmail contactPhone address'
            });
        }

        // STEP 4: Combine products from both sources, removing duplicates
        const allProductMap = new Map(); // Use Map to remove duplicates by ID
        
        // Add direct products
        directProducts.forEach(product => {
            allProductMap.set(product._id.toString(), product);
        });
        
        // Add mapped products
        mappedProducts.forEach(product => {
            allProductMap.set(product._id.toString(), product);
        });
        
        // Convert back to array
        const products = Array.from(allProductMap.values());
        
        console.log(`Total unique products for seller ${req.user.username || userId}: ${products.length}`);

        res.status(200).json({
            success: true,
            products,
            count: products.length
        });
    } catch (error) {
        console.error('Error fetching seller products:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching seller products',
            error: error.message
        });
    }
});

// Setup products for specific seller - this can be called with different emails
router.post('/setup-seller-products', async (req, res) => {
    try {
        const { email } = req.body;
        const userEmail = email || 'shenuk@gmail.com'; // Default to shenuk if no email provided
        
        // Find the user with the provided email
        const user = await User.findOne({ email: userEmail });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: `Seller with email ${userEmail} not found`
            });
        }
        
        // Find all existing products
        const products = await Product.find();
        
        // Create seller-product associations
        const associations = [];
        for (const product of products) {
            associations.push({
                userId: user._id,
                productId: product._id
            });
        }
        
        // Insert all associations at once (ignoring duplicates if they exist)
        if (associations.length > 0) {
            await SellerProduct.insertMany(associations, { ordered: false })
                .catch(err => {
                    // Handle duplicate key errors and continue
                    if (err.code !== 11000) {
                        throw err;
                    }
                    console.log('Some products were already associated, ignoring duplicates');
                });
        }
        
        res.status(200).json({
            success: true,
            message: `Associated ${associations.length} products with seller ${user.username} (${user.email})`,
            sellerInfo: {
                id: user._id,
                username: user.username,
                email: user.email
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

// Add a new endpoint to associate specific products with a specific seller
router.post('/assign-products', protect, authorize('admin'), async (req, res) => {
    try {
        const { sellerEmail, productIds } = req.body;
        
        if (!sellerEmail || !productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a seller email and an array of product IDs'
            });
        }
        
        // Find the seller
        const seller = await User.findOne({ email: sellerEmail });
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: `Seller with email ${sellerEmail} not found`
            });
        }
        
        // Check if products exist
        const products = await Product.find({ _id: { $in: productIds } });
        if (products.length !== productIds.length) {
            const foundIds = products.map(p => p._id.toString());
            const missingIds = productIds.filter(id => !foundIds.includes(id));
            
            return res.status(400).json({
                success: false,
                message: 'Some products were not found',
                missingIds
            });
        }
        
        // Create associations
        const associations = productIds.map(productId => ({
            userId: seller._id,
            productId
        }));
        
        // Insert associations (ignore duplicates)
        await SellerProduct.insertMany(associations, { ordered: false })
            .catch(err => {
                if (err.code !== 11000) {
                    throw err;
                }
                console.log('Some products were already associated, ignoring duplicates');
            });
        
        res.status(200).json({
            success: true,
            message: `Associated ${productIds.length} products with seller ${seller.username} (${seller.email})`,
            sellerInfo: {
                id: seller._id,
                username: seller.username,
                email: seller.email
            },
            productCount: productIds.length
        });
    } catch (error) {
        console.error('Error assigning products to seller:', error);
        res.status(500).json({
            success: false,
            message: 'Error assigning products to seller',
            error: error.message
        });
    }
});

// Clear all seller-product associations for testing
router.delete('/clear-associations', protect, authorize('admin'), async (req, res) => {
    try {
        await SellerProduct.deleteMany({});
        res.status(200).json({
            success: true,
            message: 'All seller-product associations have been cleared'
        });
    } catch (error) {
        console.error('Error clearing seller-product associations:', error);
        res.status(500).json({
            success: false,
            message: 'Error clearing seller-product associations',
            error: error.message
        });
    }
});

module.exports = router;
