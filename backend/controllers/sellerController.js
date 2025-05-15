const Product = require('../models/productModel');
const User = require('../models/User');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

// Get all products for the authenticated seller
exports.getSellerProducts = catchAsyncErrors(async (req, res) => {
    try {
        const userId = req.user._id;
        
        console.log(`Getting products for seller with ID: ${userId}`);
        
        // First let's get all products to check if any are being created
        const allProducts = await Product.find();
        console.log(`Total products in database: ${allProducts.length}`);
        
        // Log a couple of products to see their userId field
        if (allProducts.length > 0) {
            allProducts.slice(0, 3).forEach(p => {
                console.log(`Product ${p.name} (${p._id}) - userId:`, p.userId, 
                            `- userId type: ${typeof p.userId}`);
            });
        }
        
        // Convert userId to string for consistent comparison
        const userIdString = userId.toString();
        console.log(`Searching for products with userId: ${userIdString} (as string)`);
        
        // Query products directly using the userId field
        // Use $or to match userId in different formats
        const products = await Product.find({
            $or: [
                { userId: userId },            // Object ID format
                { userId: userIdString }        // String format
            ]
        })
        .populate({
            path: 'store',
            select: 'name description coverPhoto logo contactEmail contactPhone address'
        })
        .sort({ createdAt: -1 });
        
        console.log(`Found ${products.length} products for seller ${req.user.username}`);
        
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

// Add a new product as a seller
exports.addSellerProduct = catchAsyncErrors(async (req, res) => {
    try {
        const userId = req.user._id;
        
        console.log(`Adding product for seller with ID: ${userId}`);
        
        // Add the user ID to the product data
        const productData = {
            ...req.body,
            userId: userId
        };
        
        // Ensure required fields are present
        const requiredFields = ['name', 'description', 'price', 'category', 'stock', 'images'];
        for (const field of requiredFields) {
            if (!productData[field]) {
                return res.status(400).json({ 
                    success: false, 
                    message: `${field} is required` 
                });
            }
        }
        
        // Create the product
        const product = await Product.create(productData);
        
        console.log(`Product created: ${product.name} (${product._id}) for seller ${req.user.username}`);
        
        res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        console.error('Error adding seller product:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding seller product',
            error: error.message
        });
    }
});

// Run the migration to update userId in products (for admin users only)
exports.runProductOwnershipMigration = catchAsyncErrors(async (req, res) => {
    try {
        // This should only be accessible to admin users
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admin users can run data migrations'
            });
        }
        
        console.log('Running product ownership migration...');
        
        // Import the migration logic
        const migrateProducts = require('../scripts/migrateProductOwnership');
        
        // Run the migration
        await migrateProducts();
        
        res.status(200).json({
            success: true,
            message: 'Product ownership migration completed successfully'
        });
    } catch (error) {
        console.error('Migration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error running product ownership migration',
            error: error.message
        });
    }
});
