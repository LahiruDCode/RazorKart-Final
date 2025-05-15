require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB connection...');
console.log('MongoDB URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Successfully connected to MongoDB!');
    console.log('Connection state:', mongoose.connection.readyState);
    
    // Test creating a collection
    return mongoose.connection.db.createCollection('test_collection')
    .then(() => {
        console.log('Successfully created test collection');
        return mongoose.connection.db.dropCollection('test_collection');
    })
    .then(() => {
        console.log('Successfully cleaned up test collection');
    })
    .catch(err => {
        if (err.code === 48) { // Collection already exists
            console.log('Test collection already exists (this is fine)');
        } else {
            throw err;
        }
    });
})
.catch(error => {
    console.error('MongoDB connection error:', error);
})
.finally(() => {
    mongoose.connection.close()
    .then(() => {
        console.log('Connection closed.');
        process.exit(0);
    })
    .catch(err => {
        console.error('Error closing connection:', err);
        process.exit(1);
    });
});
