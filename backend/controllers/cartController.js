const Cart = require('../models/Cart');
const Product = require('../models/productModel');

// Test endpoint to check cart
exports.testCart = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId is required'
            });
        }

        console.log('Testing cart for userId:', userId);
        
        // Find all cart items
        const cartItems = await Cart.find({ userId })
            .populate('productId')
            .lean();
        
        console.log('Cart items found:', cartItems.length);
        
        res.json({
            success: true,
            cartItems,
            message: 'Cart test successful'
        });
    } catch (error) {
        console.error('Cart test error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Add item to cart
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1, userId } = req.body;

        console.log('Add to cart request:', { productId, quantity, userId });

        // Validate required fields
        if (!productId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'productId and userId are required'
            });
        }
        
        // Check if the userId is a valid format
        if (userId.length < 5) {
            console.error('Invalid user ID format:', userId);
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1'
            });
        }

        // Validate product exists and check stock
        const product = await Product.findById(productId);
        if (!product) {
            console.log('Product not found:', productId);
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if product is in stock
        if (product.stock < quantity) {
            console.log('Insufficient stock:', { available: product.stock, requested: quantity });
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} items available in stock`
            });
        }

        // Check if item already exists in cart
        let cartItem = await Cart.findOne({ userId, productId });
        console.log('Existing cart item:', cartItem);

        if (cartItem) {
            // Update quantity if item exists
            const newQuantity = cartItem.quantity + quantity;
            
            // Check if new quantity exceeds stock
            if (newQuantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot add ${quantity} more items. Only ${product.stock - cartItem.quantity} more available`
                });
            }
            
            cartItem.quantity = newQuantity;
            await cartItem.save();
            console.log('Updated cart item:', cartItem);
        } else {
            // Create new cart item
            cartItem = await Cart.create({
                userId,
                productId,
                quantity
            });
            console.log('Created new cart item:', cartItem);
        }

        // Populate product details
        await cartItem.populate('productId');

        res.status(201).json({
            success: true,
            cartItem,
            message: 'Item added to cart successfully'
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add item to cart',
            error: error.message
        });
    }
};

// Get cart items
exports.getCartItems = async (req, res) => {
    try {
        const { userId } = req.query;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId is required'
            });
        }

        // Validate user ID for security
        if (userId.length < 5) {
            console.error('Invalid user ID format:', userId);
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

        console.log('Getting cart items for userId:', userId);

        // Strict filtering by user ID
        const cartItems = await Cart.find({ userId: userId })
            .populate('productId')
            .lean();

        // Calculate total price
        const total = cartItems.reduce((sum, item) => {
            return sum + (item.productId.price * item.quantity);
        }, 0);

        console.log('Cart items found:', {
            count: cartItems.length,
            total
        });

        res.json({
            success: true,
            cartItems,
            total,
            message: 'Cart items retrieved successfully'
        });
    } catch (error) {
        console.error('Get cart items error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get cart items',
            error: error.message
        });
    }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const { userId } = req.query;

        if (!productId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'productId and userId are required'
            });
        }

        // Validate user ID format for security
        if (userId.length < 5) {
            console.error('Invalid user ID format:', userId);
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

        console.log('Removing from cart:', { userId, productId });

        // Strict filtering by userId to ensure users can only remove their own items
        const result = await Cart.findOneAndDelete({ userId: userId, productId: productId });

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        res.json({
            success: true,
            message: 'Item removed from cart successfully'
        });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove item from cart',
            error: error.message
        });
    }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity, userId } = req.body;

        if (!productId || !userId || quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: 'productId, userId, and quantity are required'
            });
        }

        // Validate user ID format for security
        if (userId.length < 5) {
            console.error('Invalid user ID format:', userId);
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1'
            });
        }

        console.log('Updating cart item:', { userId, productId, quantity });

        // Check if item exists in cart - use explicit userId matching for security
        const cartItem = await Cart.findOne({ userId: userId, productId: productId });
        
        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        cartItem.quantity = quantity;
        await cartItem.save();
        await cartItem.populate('productId');

        console.log('Updated cart item:', cartItem);

        res.json({
            success: true,
            cartItem,
            message: 'Cart item updated successfully'
        });
    } catch (error) {
        console.error('Update cart item error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update cart item',
            error: error.message
        });
    }
};
