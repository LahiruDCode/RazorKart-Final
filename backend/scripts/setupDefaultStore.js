const mongoose = require('mongoose');
const Store = require('../models/storeModel');
require('dotenv').config();

async function setupDefaultStore() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if default store exists
        let store = await Store.findOne();
        
        if (!store) {
            // Create default store
            store = await Store.create({
                name: 'RazorKart Store',
                description: 'Your one-stop shop for all your needs',
                coverPhoto: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
                logo: 'https://via.placeholder.com/150?text=RK',
                contactEmail: 'contact@razorkart.com',
                contactPhone: '+1234567890',
                address: '123 Shopping Street'
            });
            console.log('Default store created successfully');
        }

        // Update all products to reference this store
        const Product = require('../models/productModel');
        await Product.updateMany(
            { store: { $exists: false } },
            { $set: { store: store._id } }
        );
        
        console.log('All products updated with default store');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

setupDefaultStore(); 