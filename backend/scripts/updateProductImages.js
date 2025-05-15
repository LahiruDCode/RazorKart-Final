const mongoose = require('mongoose');
const Product = require('../models/productModel');
require('dotenv').config();

const dummyImages = {
  Electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&h=500&fit=crop',
  Clothing: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&h=500&fit=crop',
  Books: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500&h=500&fit=crop',
  'Home & Garden': 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=500&h=500&fit=crop',
  Sports: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=500&h=500&fit=crop',
  Toys: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=500&h=500&fit=crop',
  Beauty: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=500&fit=crop',
  Food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&h=500&fit=crop'
};

// Category mapping for old categories to new ones
const categoryMapping = {
  'Cameras': 'Electronics',
  'Laptops': 'Electronics',
  'Accessories': 'Electronics',
  'Headphones': 'Electronics',
  'Clothes/Shoes': 'Clothing',
  'Beauty/Health': 'Beauty',
  'Outdoor': 'Sports',
  'Home': 'Home & Garden'
};

const updateProductImages = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const products = await Product.find();
    console.log(`Found ${products.length} products to update`);

    for (const product of products) {
      // Map old category to new category if needed
      const newCategory = categoryMapping[product.category] || product.category;
      const categoryImage = dummyImages[newCategory] || 'https://via.placeholder.com/500x500?text=No+Image';
      
      // Update both category and image
      product.category = newCategory;
      product.image = categoryImage;
      
      await product.save();
      console.log(`Updated product: ${product.name} (Category: ${newCategory})`);
    }

    console.log('All products updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating product images:', error);
    process.exit(1);
  }
};

updateProductImages(); 