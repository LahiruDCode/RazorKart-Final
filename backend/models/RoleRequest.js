const mongoose = require('mongoose');

const roleRequestSchema = new mongoose.Schema({
  inquiryId: mongoose.Schema.Types.ObjectId,
  originalInquiry: {
    id: mongoose.Schema.Types.ObjectId,
    name: String,
    subject: String,
    email: String,
    contactNumber: String,
    message: String,
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    forwardHistory: Array
  },
  createdAt: Date,
  __v: Number
});

const RoleRequest = mongoose.model('RoleRequest', roleRequestSchema, 'rolerequests');

module.exports = RoleRequest;
