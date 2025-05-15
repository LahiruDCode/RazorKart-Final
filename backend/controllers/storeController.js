const Store = require('../models/storeModel');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');

// Get store details
exports.getStoreDetails = catchAsyncErrors(async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: 'Please login to access store details'
            });
        }

        const userId = req.user._id;
        console.log('Fetching store details for user:', userId);
        
        let store = await Store.findOne({ userId });
        
        if (!store) {
            console.log('No store found for user, creating default store...');
            store = await Store.create({
                userId,
                name: 'My Store',
                description: 'Welcome to my store',
                coverPhoto: 'https://via.placeholder.com/1200x400',
                logo: 'https://via.placeholder.com/150',
                contactEmail: req.user.email || 'store@example.com',
                contactPhone: '+1234567890',
                address: 'Store Address'
            });
            console.log('Default store created successfully for user:', userId);
        }

        console.log('Sending store details:', store);
        return res.status(200).json({
            success: true,
            store
        });
    } catch (error) {
        console.error('Error in getStoreDetails:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
});

// Update store details
exports.updateStore = catchAsyncErrors(async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: 'Please login to update store details'
            });
        }

        const userId = req.user._id;
        console.log(`Updating store for user ${userId} with data:`, req.body);
        
        const {
            name,
            description,
            coverPhoto,
            logo,
            contactEmail,
            contactPhone,
            address
        } = req.body;

        // Provide default values for any missing fields
        const storeData = {
            name: name || 'My Store',
            description: description || 'Welcome to my store',
            coverPhoto: coverPhoto || 'https://via.placeholder.com/1200x400',
            logo: logo || 'https://via.placeholder.com/150',
            contactEmail: contactEmail || req.user.email || 'store@example.com',
            contactPhone: contactPhone || '+1234567890',
            address: address || 'Store Address'
        };
        
        console.log('Processed store data with defaults:', storeData);

        // Always use the authenticated user's ID, even if a different one is provided in the request
        // This ensures stores are correctly associated with the current seller
        
        // Find the store and update it
        let store = await Store.findOne({ userId });
        
        if (!store) {
            console.log(`No store found for user ${userId}, creating new store...`);
            // Create a new store with the authenticated user's ID and the store data with defaults
            store = new Store({
                ...storeData,
                userId: req.user._id, // Always use the authenticated user's ID
                createdAt: Date.now()
            });
            console.log('Creating new store with data:', store);
        } else {
            console.log(`Updating existing store for user ${userId}...`);
            // Update existing store with store data and defaults but preserve the original userId
            store.name = storeData.name;
            store.description = storeData.description;
            store.coverPhoto = storeData.coverPhoto;
            store.logo = storeData.logo;
            store.contactEmail = storeData.contactEmail;
            store.contactPhone = storeData.contactPhone;
            store.address = storeData.address;
            store.updatedAt = Date.now();
            console.log('Updating store with data:', store);
        }

        try {
            await store.save();
            console.log('Store updated successfully:', store);

            return res.status(200).json({
                success: true,
                store,
                message: 'Store updated successfully'
            });
        } catch (saveError) {
            console.error('Error saving store to database:', saveError);
            
            // If it's a validation error, provide better feedback
            if (saveError.name === 'ValidationError') {
                const validationErrors = Object.values(saveError.errors).map(error => error.message);
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validationErrors
                });
            }
            
            return res.status(500).json({
                success: false,
                message: saveError.message || 'Failed to update store'
            });
        }
    } catch (error) {
        console.error('Error in updateStore:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to update store'
        });
    }
});
