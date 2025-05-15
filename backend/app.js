require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const storeRoutes = require('./routes/storeRoutes');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: process.env.MAX_REQUEST_SIZE || '10mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.MAX_REQUEST_SIZE || '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        port: process.env.PORT || 5000,
        database: mongoose.connection.name,
        env: {
            MONGODB_URI: process.env.MONGODB_URI ? 'configured' : 'missing',
            PORT: process.env.PORT || '5000 (default)',
            FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000'
        }
    });
});

// Connect to MongoDB with better error handling
async function connectDB() {
    try {
        console.log('Attempting to connect to MongoDB...');
        console.log('Connection string format:', process.env.MONGODB_URI ? 'configured' : 'missing');
        
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        console.log('Successfully connected to MongoDB');
        console.log('Database:', mongoose.connection.name);
        console.log('Connection state:', mongoose.connection.readyState);
    } catch (error) {
        console.error('MongoDB connection error details:', {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        
        // Don't exit immediately on connection error
        return false;
    }
    return true;
}

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', {
        name: err.name,
        message: err.message,
        code: err.code
    });
});

mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected. Attempting to reconnect...');
    setTimeout(async () => {
        const connected = await connectDB();
        if (!connected) {
            console.error('Reconnection attempt failed');
        }
    }, 5000);
});

mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected successfully');
});

// Initial database connection
(async () => {
    const connected = await connectDB();
    if (!connected) {
        console.error('Initial database connection failed');
    }
})();

// Routes
console.log('Mounting routes...');

// Mount product routes
app.use('/api/products', productRoutes);
console.log('Product routes mounted at /api/products');

// Mount cart routes
app.use('/api/cart', cartRoutes);
console.log('Cart routes mounted at /api/cart');

// Mount seller routes
app.use('/api/seller', sellerRoutes);
console.log('Seller routes mounted at /api/seller');

// Mount store routes
app.use('/api/stores', storeRoutes);
console.log('Store routes mounted at /api/stores');

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Test route working' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
    
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
});

// Handle 404 routes
app.use((req, res) => {
    res.status(404).json({
        error: {
            message: 'Route not found'
        }
    });
});

const PORT = process.env.PORT || 5000;
let server;

try {
    server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Health check available at http://localhost:${PORT}/api/health`);
        console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    });
} catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
}

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

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', {
        reason: reason instanceof Error ? {
            name: reason.name,
            message: reason.message,
            stack: reason.stack
        } : reason,
        promise
    });
    
    if (server) {
        server.close(() => {
            console.log('Server closed due to unhandled rejection');
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
});

module.exports = app;
