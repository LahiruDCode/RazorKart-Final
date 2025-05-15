const Product = require('../models/productModel');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const mongoose = require('mongoose');

// Get all products with filtering, sorting, and pagination
exports.getAllProducts = catchAsyncErrors(async (req, res) => {
    try {
        console.log('Fetching all products with filters:', req.query);
        // Build query
        const query = {};

        // Search filter
        if (req.query.search) {
            query.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // Category filter
        if (req.query.category && req.query.category !== 'All') {
            query.category = req.query.category;
        }
        
        // Seller filter - for user-based control
        if (req.query.seller) {
            const sellerId = req.query.seller;
            console.log(`Filtering products by seller ID: ${sellerId}`);
            
            // Match the sellerId in multiple formats
            // Note: In MongoDB, string IDs will match ObjectId and vice versa when using $eq
            // So we just need to ensure the field exists and matches the value
            query.userId = sellerId; // This will match both string and ObjectId formats
        }

        // Get total count
        const total = await Product.countDocuments(query);

        // Build sort object
        let sort = { createdAt: -1 }; // Default sort by newest
        if (req.query.sort) {
            switch (req.query.sort) {
                case 'price_asc':
                    sort = { price: 1 };
                    break;
                case 'price_desc':
                    sort = { price: -1 };
                    break;
                case 'name_asc':
                    sort = { name: 1 };
                    break;
                case 'name_desc':
                    sort = { name: -1 };
                    break;
            }
        }

        // Execute query
        let productsQuery = Product.find(query)
            .sort(sort)
            .populate({
                path: 'store',
                select: 'name description coverPhoto logo contactEmail contactPhone address'
            });

        // Apply pagination only if specifically requested
        if (req.query.page && req.query.limit) {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 24;
            const skip = (page - 1) * limit;
            productsQuery = productsQuery.skip(skip).limit(limit);
        }

        const products = await productsQuery;

        // Log the results
        console.log(`Found ${products.length} products out of ${total} total`);

        res.status(200).json({
            success: true,
            products,
            total,
            count: products.length
        });
    } catch (error) {
        console.error('Error in getAllProducts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
});

// Get single product details
exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
    try {
        console.log('Fetching product details for ID:', req.params.id);
        
        // First get the product and basic store info
        const product = await Product.findById(req.params.id)
            .populate({
                path: 'store',
                select: 'name description coverPhoto logo contactEmail contactPhone address createdAt updatedAt userId'
            });
        
        if (!product) {
            console.log('Product not found');
            return next(new ErrorHandler('Product not found', 404));
        }

        console.log('Product found:', {
            id: product._id,
            name: product.name,
            userId: product.userId,
            hasStore: !!product.store,
            storeId: product.store?._id
        });

        // Check if we need to find the correct store based on userId
        const Store = require('../models/storeModel');
        let storeToUse = product.store;
        
        // If product has userId, try to find the store by that userId
        if (product.userId) {
            console.log('Looking for store by userId:', product.userId);
            const sellerStore = await Store.findOne({ userId: product.userId });
            
            if (sellerStore) {
                console.log('Found seller store:', sellerStore._id);
                storeToUse = sellerStore;
                
                // Update the product with the correct store if needed
                if (!product.store || !product.store._id.equals(sellerStore._id)) {
                    console.log('Updating product with correct store');
                    product.store = sellerStore._id;
                    await product.save();
                }
            } else {
                console.log('No store found for userId:', product.userId);
            }
        }
        
        // If still no store, try to find a default
        if (!storeToUse) {
            console.log('No store found for this product, looking for any store...');
            const anyStore = await Store.findOne();
            
            if (anyStore) {
                console.log('Using default store:', anyStore._id);
                storeToUse = anyStore;
                product.store = anyStore._id;
                await product.save();
            } else {
                console.log('No stores found in the system');
            }
        }
        
        // Attach the store to the response
        const responseProduct = product.toObject();
        responseProduct.store = storeToUse;
        
        console.log('Sending product with store information:', {
            productId: responseProduct._id,
            hasStore: !!responseProduct.store,
            storeId: responseProduct.store?._id,
            storeUserId: responseProduct.store?.userId
        });
        
        // Use the responseProduct with the correct store information
        return res.status(200).json({
            success: true,
            product: responseProduct
        });
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product details',
            error: error.message
        });
    }
});

// Create new product
exports.createProduct = catchAsyncErrors(async (req, res) => {
    try {
        // Validate required fields
        const requiredFields = ['name', 'description', 'price', 'category', 'stock', 'images'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({
                    success: false,
                    message: `${field} is required`
                });
            }
        }

        // Validate price and stock
        if (req.body.price <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Price must be greater than 0'
            });
        }
        if (req.body.stock < 0) {
            return res.status(400).json({
                success: false,
                message: 'Stock cannot be negative'
            });
        }

        // Validate images
        if (!Array.isArray(req.body.images) || req.body.images.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one product image is required'
            });
        }

        // Get the store
        const Store = require('../models/storeModel');
        console.log('Finding store...');
        const store = await Store.findOne();
        
        if (!store) {
            console.log('No store found in database');
            return res.status(500).json({
                success: false,
                message: 'Store not found'
            });
        }

        console.log('Found store:', {
            storeId: store._id,
            name: store.name
        });

        // Add store and userId to the product data
        const productData = {
            ...req.body,
            store: store._id
        };
        
        // Check if userId is provided in the request body (from frontend)
        if (req.body.userId) {
            productData.userId = req.body.userId;
            console.log('Using userId from request body:', productData.userId);
        }
        // If not, try to get it from the authenticated user
        else if (req.user) {
            productData.userId = req.user._id;
            console.log('Using userId from authenticated user:', {
                userId: productData.userId,
                username: req.user.username
            });
        }
        // Otherwise, userId will be undefined
        else {
            console.log('Warning: No userId available for this product');
        }
        
        if (!productData.userId) {
            console.warn('Creating product without userId - it will not appear in seller listings!');
        }

        console.log('Creating product with data:', {
            name: productData.name,
            storeId: productData.store
        });

        // Create product
        const product = await Product.create(productData);

        console.log('Product created:', {
            productId: product._id,
            name: product.name,
            storeId: product.store
        });

        // Fetch the complete product with populated store information
        console.log('Populating store information...');
        const populatedProduct = await Product.findById(product._id)
            .populate({
                path: 'store',
                select: 'name description coverPhoto logo contactEmail contactPhone address createdAt updatedAt'
            })
            .exec();

        if (!populatedProduct.store) {
            console.error('Store not populated:', {
                productId: product._id,
                storeId: store._id
            });
        } else {
            console.log('Store populated successfully:', {
                productId: populatedProduct._id,
                productName: populatedProduct.name,
                storeId: populatedProduct.store._id,
                storeName: populatedProduct.store.name
            });
        }

        res.status(201).json({
            success: true,
            product: populatedProduct
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating product',
            error: error.message
        });
    }
});

// Update product
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return next(new ErrorHandler('Product not found', 404));
        }

        // Validate price and stock if provided
        if (req.body.price !== undefined && req.body.price <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Price must be greater than 0'
            });
        }
        if (req.body.stock !== undefined && req.body.stock < 0) {
            return res.status(400).json({
                success: false,
                message: 'Stock cannot be negative'
            });
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating product',
            error: error.message
        });
    }
});

// Delete product
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
    try {
        console.log('Attempting to delete product with ID:', req.params.id);
        
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            console.error('Invalid product ID format:', req.params.id);
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID format'
            });
        }

        const result = await Product.findByIdAndDelete(req.params.id);
        
        if (!result) {
            console.error('Product not found with ID:', req.params.id);
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        console.log('Successfully deleted product with ID:', req.params.id);

        return res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting product:', {
            id: req.params.id,
            error: {
                message: error.message,
                stack: error.stack
            }
        });
        return res.status(500).json({
            success: false,
            message: 'Error deleting product',
            error: error.message
        });
    }
});