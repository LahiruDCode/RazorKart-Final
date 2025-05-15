const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Store must be associated with a user']
    },
    name: {
        type: String,
        required: [true, 'Store name is required'],
        trim: true,
        maxLength: [100, 'Store name cannot exceed 100 characters'],
        default: 'My Store'
    },
    description: {
        type: String,
        required: [true, 'Store description is required'],
        trim: true,
        maxLength: [1000, 'Store description cannot exceed 1000 characters'],
        default: 'Welcome to my store'
    },
    coverPhoto: {
        type: String,
        required: [true, 'Store cover photo is required'],
        default: 'https://via.placeholder.com/1200x400',
        validate: {
            validator: function(v) {
                // Accept any value that's not empty
                return v && v.length > 0;
            },
            message: 'Cover photo cannot be empty'
        }
    },
    logo: {
        type: String,
        required: [true, 'Store logo is required'],
        default: 'https://via.placeholder.com/150',
        validate: {
            validator: function(v) {
                // Accept any value that's not empty
                return v && v.length > 0;
            },
            message: 'Logo cannot be empty'
        }
    },
    contactEmail: {
        type: String,
        required: [true, 'Contact email is required'],
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
    },
    contactPhone: {
        type: String,
        required: [true, 'Contact phone is required'],
        default: '+1234567890'
    },
    address: {
        type: String,
        required: [true, 'Store address is required']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;
