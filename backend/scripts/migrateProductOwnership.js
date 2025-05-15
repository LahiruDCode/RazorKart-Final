/**
 * Migration script to associate existing products with seller userIds
 * 
 * This script finds all seller-product relationships in the SellerProduct table
 * and adds the userId to each Product document directly.
 * 
 * Run with: node scripts/migrateProductOwnership.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/productModel');
const SellerProduct = require('../models/SellerProduct');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

// Migrate products to include userId
const migrateProducts = async () => {
  try {
    console.log('Starting product ownership migration...');
    
    // Get all seller-product associations
    const sellerProducts = await SellerProduct.find();
    console.log(`Found ${sellerProducts.length} seller-product associations`);
    
    // Get unique product IDs 
    const uniqueProductIds = [...new Set(sellerProducts.map(sp => sp.productId.toString()))];
    console.log(`Found ${uniqueProductIds.length} unique products to update`);
    
    // Create a map of productId to userId
    const productToUserMap = {};
    sellerProducts.forEach(sp => {
      productToUserMap[sp.productId.toString()] = sp.userId;
    });
    
    // Update products with their respective userIds
    let updatedCount = 0;
    for (const productId of uniqueProductIds) {
      const userId = productToUserMap[productId];
      if (userId) {
        await Product.findByIdAndUpdate(productId, { userId });
        updatedCount++;
        if (updatedCount % 10 === 0) {
          console.log(`Updated ${updatedCount} products so far...`);
        }
      }
    }
    
    console.log(`Successfully updated ${updatedCount} products with user ownership.`);
    
    // Find any products that weren't updated
    const productsWithoutUsers = await Product.find({ userId: { $exists: false } });
    if (productsWithoutUsers.length > 0) {
      console.log(`Found ${productsWithoutUsers.length} products without a userId.`);
      
      // Get a default seller to assign to these products
      const defaultSeller = await User.findOne({ role: 'seller' });
      if (defaultSeller) {
        console.log(`Assigning remaining products to default seller: ${defaultSeller.username}`);
        
        for (const product of productsWithoutUsers) {
          await Product.findByIdAndUpdate(product._id, { userId: defaultSeller._id });
        }
        
        console.log(`Successfully assigned ${productsWithoutUsers.length} products to default seller.`);
      } else {
        console.log('No default seller found to assign remaining products.');
      }
    }
    
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

// Run the migration
(async () => {
  const connected = await connectDB();
  if (connected) {
    await migrateProducts();
  } else {
    console.error('Failed to connect to database, migration aborted.');
  }
})();
