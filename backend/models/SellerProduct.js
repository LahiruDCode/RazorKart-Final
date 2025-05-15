const mongoose = require('mongoose');

const sellerProductSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create compound index to ensure one product can only be associated with one seller
sellerProductSchema.index({ userId: 1, productId: 1 }, { unique: true });

const SellerProduct = mongoose.model('SellerProduct', sellerProductSchema);
module.exports = SellerProduct;
