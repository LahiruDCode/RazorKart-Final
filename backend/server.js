const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const productRoutes = require('./routes/productRoutes');
const storeRoutes = require('./routes/storeRoutes');
const cartRoutes = require('./routes/cartRoutes');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const roleRequestRoutes = require('./routes/roleRequests');
const inquiryRoutes = require('./routes/inquiryRoutes');
const replyTemplateRoutes = require('./routes/replyTemplateRoutes');
const sellerProductRoutes = require('./routes/sellerProductRoutes');
const promotionsRoutes = require('./routes/promotions');
const sellerItemsRoutes = require('./routes/sellerItems');
const fixSellerProductsRoutes = require('./routes/fixSellerProducts');
const sellerRoutes = require('./routes/sellerRoutes');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json({ limit: process.env.MAX_REQUEST_SIZE || '10mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.MAX_REQUEST_SIZE || '10mb' }));

// Serve static files from the uploads directory
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        port: process.env.PORT || 5005,
        database: mongoose.connection.name,
        env: {
            MONGODB_URI: process.env.MONGODB_URI ? 'configured' : 'missing',
            PORT: process.env.PORT || '5005 (default)',
            FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3001'
        }
    });
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/role-requests', roleRequestRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/reply-templates', replyTemplateRoutes);
app.use('/api/seller-products', sellerProductRoutes);
app.use('/api/promotions', promotionsRoutes);
app.use('/api/seller-items', sellerItemsRoutes);
app.use('/api/fix-seller-products', fixSellerProductsRoutes);
app.use('/api/seller', sellerRoutes);

// Log mounted routes
console.log('Routes mounted:', {
    products: '/api/products',
    stores: '/api/stores',
    cart: '/api/cart',
    auth: '/api/auth',
    users: '/api/users',
    roleRequests: '/api/role-requests',
    inquiries: '/api/inquiries',
    replyTemplates: '/api/reply-templates',
    sellerProducts: '/api/seller-products',
    promotions: '/api/promotions',
    sellerItems: '/api/seller-items'
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

// Error handling for invalid routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Cannot ${req.method} ${req.url}`
    });
});

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB connected successfully`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Start server
const PORT = process.env.PORT || 5005;
let server;

const startServer = async () => {
    try {
        await connectDB();
        
        server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Health check available at http://localhost:${PORT}/api/health`);
            console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3001'}`);
        });

        // Handle server shutdown gracefully
        process.on('SIGTERM', () => {
            console.log('SIGTERM received. Shutting down gracefully...');
            if (server) {
                server.close(() => {
                    console.log('Server closed.');
                    if (mongoose.connection) {
                        mongoose.connection.close(false, () => {
                            console.log('MongoDB connection closed.');
                            process.exit(0);
                        });
                    } else {
                        process.exit(0);
                    }
                });
            } else {
                process.exit(0);
            }
        });

        // Handle unexpected errors
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            
            if (server) {
                server.close(() => {
                    console.log('Server closed due to uncaught exception');
                    process.exit(1);
                });
            } else {
                process.exit(1);
            }
        });

    } catch (error) {
        console.error('Server startup error:', error);
        process.exit(1);
    }
};

// Start the server
startServer();