const mongoose = require('mongoose');
const Product = require('../models/productModel');
require('dotenv').config();

const dummyProducts = [
  {
    name: "Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    price: 99.99,
    category: "Headphones",
    stock: 50
  },
  {
    name: "Smart Watch",
    description: "Fitness tracking smartwatch with heart rate monitoring",
    price: 199.99,
    category: "Electronics",
    stock: 30
  },
  {
    name: "Laptop Backpack",
    description: "Durable laptop backpack with multiple compartments",
    price: 49.99,
    category: "Accessories",
    stock: 100
  },
  {
    name: "Running Shoes",
    description: "Comfortable running shoes with good arch support",
    price: 79.99,
    category: "Clothes/Shoes",
    stock: 75
  },
  {
    name: "Yoga Mat",
    description: "Premium yoga mat with carrying strap",
    price: 29.99,
    category: "Sports",
    stock: 60
  },
  {
    name: "Coffee Maker",
    description: "Programmable coffee maker with thermal carafe",
    price: 89.99,
    category: "Home",
    stock: 40
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert dummy products
    const insertedProducts = await Product.insertMany(dummyProducts);
    console.log(`Successfully inserted ${insertedProducts.length} products`);

    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit();
  }
};

seedDatabase(); 