const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        console.log('\n=== Attempting MongoDB Connection ===');
        console.log('MongoDB URI:', process.env.MONGODB_URI);
        
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            family: 4,  // Use IPv4, skip trying IPv6
            maxPoolSize: 10,
            autoIndex: true,
            retryWrites: true,
            w: 'majority',
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('\n=== Database Connection Success ===');
        console.log(`Connected to MongoDB`);
        console.log(`Host: ${conn.connection.host}`);
        console.log(`Database: ${conn.connection.name}`);
        console.log(`Connection State: ${mongoose.STATES[mongoose.connection.readyState]}`);
        console.log('===================================\n');

        // Set up connection event listeners
        mongoose.connection.on('connected', () => {
            console.log('✅ Mongoose default connection established');
        });

        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
            console.error('Error details:', {
                name: err.name,
                message: err.message,
                code: err.code
            });
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected');
        });

        // Handle application termination
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('✅ MongoDB connection closed through app termination');
                process.exit(0);
            } catch (err) {
                console.error('❌ Error during MongoDB connection closure:', err);
                process.exit(1);
            }
        });

        return conn;

    } catch (error) {
        console.error('\n=== Database Connection Error ===');
        console.error('❌ MongoDB connection failed');
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            code: error.code
        });
        
        // Specific error handling
        if (error.name === 'MongoServerSelectionError') {
            console.error('\nConnection Troubleshooting Guide:');
            console.error('1. Check if MongoDB URI is correct');
            console.error('2. Verify MongoDB server is running');
            console.error('3. Check network connectivity');
            console.error('4. Verify IP whitelist in MongoDB Atlas');
            console.error('5. Check database user credentials');
        }
        
        throw error;
    }
};

module.exports = connectDB; 