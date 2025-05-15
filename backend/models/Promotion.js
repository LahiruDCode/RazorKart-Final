const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  targetAudience: {
    type: String,
    enum: ['buyers', 'sellers'],
    required: true
  },
  bannerImage: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'scheduled'],
    default: 'scheduled'
  }
});

module.exports = mongoose.model('Promotion', promotionSchema);
