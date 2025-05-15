const mongoose = require('mongoose');

const forwardHistorySchema = new mongoose.Schema({
    forwardedTo: {
        email: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: true
        }
    },
    forwardedAt: {
        type: Date,
        default: Date.now
    }
});

const inquirySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    contactNumber: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
        default: 'Pending'
    },
    forwardHistory: [forwardHistorySchema],
    currentlyAssignedTo: {
        email: String,
        role: String
    },
    replies: [{
        message: {
            type: String,
            required: true
        },
        respondedBy: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Inquiry', inquirySchema); 