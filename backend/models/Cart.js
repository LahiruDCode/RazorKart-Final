const mongoose = require('mongoose');

// Define the schema for the Cart model
const cartSchema = new mongoose.Schema({
  // Unique identifier for the user
  userId: {
    type: String,
    required: true
  },
  // Reference to the Product model
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  // Quantity of the product in the cart
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  // Timestamp for when the cart was created
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 7200 // Document will be automatically deleted after 2 hours
  }
});

// Create a compound index to ensure unique combinations of userId and productId
cartSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Export the Cart model
module.exports = mongoose.model('Cart', cartSchema);
