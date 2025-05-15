const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxLength: [100, 'Product name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative'],
        validate: {
            validator: function(v) {
                return v > 0;
            },
            message: 'Price must be greater than 0'
        }
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: {
            values: [
                'Electronics',
                'Clothing',
                'Books',
                'Home & Garden',
                'Sports',
                'Toys',
                'Health & Beauty',
                'Automotive',
                'Other'
            ],
            message: '{VALUE} is not a valid category'
        }
    },
    stock: {
        type: Number,
        required: [true, 'Product stock is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0,
        validate: {
            validator: function(v) {
                return Number.isInteger(v) && v >= 0;
            },
            message: 'Stock must be a non-negative integer'
        }
    },
    images: {
        type: [String],
        required: [true, 'At least one product image is required'],
        validate: {
            validator: function(arr) {
                return arr && arr.length > 0;
            },
            message: 'At least one product image is required'
        }
    },
    rating: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot be more than 5']
    },
    numReviews: {
        type: Number,
        default: 0,
        min: [0, 'Number of reviews cannot be negative']
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: [true, 'Store reference is required']
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
        // Not making it required yet to maintain backward compatibility with existing products
        // But we'll populate it for all products using our data migration script
        description: 'User ID of the seller who owns this product'
    }
}, {
    timestamps: true
});

// Add text indexes for search
productSchema.index({ 
    name: 'text', 
    description: 'text', 
    category: 'text' 
});

module.exports = mongoose.model('Product', productSchema);