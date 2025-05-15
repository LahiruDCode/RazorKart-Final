const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/productModel');

// Load environment variables
dotenv.config();

const dummyProducts = [
    {
        name: "MacBook Pro M3",
        description: "14-inch MacBook Pro with M3 chip, 16GB RAM, and 512GB SSD",
        price: 1599.99,
        category: "Electronics",
        stock: 25,
        images: [
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500"
        ],
        rating: 4.8,
        numReviews: 156
    },
    {
        name: "Nike Air Max 2024",
        description: "Latest Nike Air Max running shoes with advanced cushioning technology",
        price: 179.99,
        category: "Clothing",
        stock: 45,
        images: [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"
        ],
        rating: 4.5,
        numReviews: 89
    },
    {
        name: "Sony WH-1000XM5",
        description: "Premium noise-cancelling headphones with up to 30 hours battery life",
        price: 349.99,
        category: "Electronics",
        stock: 30,
        images: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"
        ],
        rating: 4.9,
        numReviews: 203
    },
    {
        name: "Levi's 501 Original",
        description: "Classic straight fit jeans in premium denim",
        price: 89.99,
        category: "Clothing",
        stock: 60,
        images: [
            "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500"
        ],
        rating: 4.3,
        numReviews: 145
    },
    {
        name: "The Psychology of Money",
        description: "Timeless lessons on wealth, greed, and happiness by Morgan Housel",
        price: 19.99,
        category: "Books",
        stock: 40,
        images: [
            "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500"
        ],
        rating: 4.7,
        numReviews: 278
    },
    {
        name: "Garden Tool Set",
        description: "Complete 12-piece garden tool set with carrying case",
        price: 79.99,
        category: "Home & Garden",
        stock: 35,
        images: [
            "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500"
        ],
        rating: 4.4,
        numReviews: 67
    },
    {
        name: "Wilson Pro Tennis Racket",
        description: "Professional grade tennis racket with advanced string pattern",
        price: 199.99,
        category: "Sports",
        stock: 20,
        images: [
            "https://images.unsplash.com/photo-1617083934557-552978888c39?w=500"
        ],
        rating: 4.6,
        numReviews: 92
    },
    {
        name: "LEGO Star Wars Set",
        description: "Millennium Falcon collector's edition building set",
        price: 159.99,
        category: "Toys",
        stock: 15,
        images: [
            "https://images.unsplash.com/photo-1472457897821-70d3819a0e24?w=500"
        ],
        rating: 4.8,
        numReviews: 134
    },
    {
        name: "Organic Skincare Set",
        description: "Natural and organic skincare collection with moisturizer, serum, and cleanser",
        price: 129.99,
        category: "Health & Beauty",
        stock: 50,
        images: [
            "https://images.unsplash.com/photo-1570174006382-148305ce4972?w=500"
        ],
        rating: 4.5,
        numReviews: 156
    },
    {
        name: "Car Diagnostic Tool",
        description: "Professional OBD2 scanner for all vehicle makes",
        price: 89.99,
        category: "Automotive",
        stock: 25,
        images: [
            "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=500"
        ],
        rating: 4.4,
        numReviews: 78
    },
    {
        name: "iPad Air",
        description: "Latest iPad Air with M1 chip and 10.9-inch display",
        price: 599.99,
        category: "Electronics",
        stock: 40,
        images: [
            "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500"
        ],
        rating: 4.7,
        numReviews: 189
    },
    {
        name: "Running Shorts",
        description: "Moisture-wicking athletic shorts with phone pocket",
        price: 29.99,
        category: "Clothing",
        stock: 75,
        images: [
            "https://images.unsplash.com/photo-1519753136092-d6d9e5abd2f7?w=500"
        ],
        rating: 4.2,
        numReviews: 112
    }
];

const seedDatabase = async () => {
    try {
        // Connect to MongoDB Atlas
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB Atlas');

        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products');

        // Insert dummy products
        await Product.insertMany(dummyProducts);
        console.log('Successfully seeded products');

        // Close connection
        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

// Run the seeding function
seedDatabase();