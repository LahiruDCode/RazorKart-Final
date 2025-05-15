const mongoose = require('mongoose');
const Product = require('../models/productModel');
const Store = require('../models/storeModel');
require('dotenv').config();

async function updateProducts() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get the store
        const store = await Store.findOne();
        if (!store) {
            console.error('No store found');
            process.exit(1);
        }

        // Update all products to reference this store
        const result = await Product.updateMany(
            { store: { $exists: false } }, // Only update products that don't have a store
            { $set: { store: store._id } }
        );

        console.log(`Updated ${result.modifiedCount} products`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updateProducts();
