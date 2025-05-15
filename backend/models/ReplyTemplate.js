const mongoose = require('mongoose');

const replyTemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['General', 'Technical', 'Billing', 'Support', 'Other'],
        default: 'General'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
replyTemplateSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const ReplyTemplate = mongoose.model('ReplyTemplate', replyTemplateSchema);

module.exports = ReplyTemplate; 