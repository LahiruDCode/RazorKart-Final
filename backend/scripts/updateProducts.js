const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/productModel');

// Load environment variables
dotenv.config();

const newProducts = [
    {
        name: "iPhone 15 Pro Max",
        description: "Latest iPhone with A17 Pro chip, 6.7-inch Super Retina XDR display, and Pro camera system",
        price: 1199.99,
        category: "Electronics",
        stock: 50,
        images: [
            "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500",
            "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
            "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200"
        ]
    },
    {
        name: "Samsung Galaxy S24 Ultra",
        description: "Premium Android smartphone with S Pen, AI features, and 200MP camera",
        price: 1299.99,
        category: "Electronics",
        stock: 40,
        images: [
            "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500",
            "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800"
        ]
    },
    {
        name: "PS5 Digital Edition",
        description: "Next-gen gaming console with DualSense controller and 825GB SSD",
        price: 399.99,
        category: "Electronics",
        stock: 35,
        images: [
            "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500",
            "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800"
        ]
    },
    {
        name: "Nike Air Jordan 1 High OG",
        description: "Classic basketball sneakers in premium leather construction",
        price: 179.99,
        category: "Clothing",
        stock: 25,
        images: [
            "https://images.unsplash.com/photo-1695749800656-9b8f6dc0f841?w=500",
            "https://images.unsplash.com/photo-1695749800656-9b8f6dc0f841?w=800"
        ]
    },
    {
        name: "Apple Watch Series 9",
        description: "Advanced smartwatch with health monitoring and cellular connectivity",
        price: 399.99,
        category: "Electronics",
        stock: 45,
        images: [
            "https://images.unsplash.com/photo-1695048063312-b927634d3ee5?w=500",
            "https://images.unsplash.com/photo-1695048063312-b927634d3ee5?w=800"
        ]
    },
    {
        name: "Dyson V15 Detect",
        description: "Cordless vacuum with laser dust detection and HEPA filtration",
        price: 749.99,
        category: "Home & Garden",
        stock: 20,
        images: [
            "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500",
            "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800"
        ]
    },
    {
        name: "LG C3 65-inch OLED TV",
        description: "4K OLED TV with AI processing and gaming features",
        price: 1799.99,
        category: "Electronics",
        stock: 15,
        images: [
            "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500",
            "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800"
        ]
    },
    {
        name: "Bose QuietComfort Ultra",
        description: "Premium wireless noise-cancelling headphones with spatial audio",
        price: 429.99,
        category: "Electronics",
        stock: 30,
        images: [
            "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500",
            "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800"
        ]
    },
    {
        name: "Adidas Ultraboost Light",
        description: "Premium running shoes with responsive cushioning",
        price: 189.99,
        category: "Clothing",
        stock: 40,
        images: [
            "https://images.unsplash.com/photo-1695048063312-b927634d3ee5?w=500",
            "https://images.unsplash.com/photo-1695048063312-b927634d3ee5?w=800"
        ]
    },
    {
        name: "MacBook Air M3",
        description: "13.6-inch MacBook Air with M3 chip, 8GB RAM, 256GB SSD",
        price: 1099.99,
        category: "Electronics",
        stock: 35,
        images: [
            "https://images.unsplash.com/photo-1695048063312-b927634d3ee5?w=500",
            "https://images.unsplash.com/photo-1695048063312-b927634d3ee5?w=800"
        ]
    }
];

async function updateProducts() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Delete existing products
        await Product.deleteMany({});
        console.log('Deleted existing products');

        // Insert new products
        await Product.insertMany(newProducts);
        console.log('Successfully inserted new products');

        // Close the connection
        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error updating products:', error);
        process.exit(1);
    }
}

// Run the update function
updateProducts();
