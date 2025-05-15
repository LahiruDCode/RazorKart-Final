const express = require('express');
const router = express.Router();
const RoleRequest = require('../models/RoleRequest');

// Get all role requests
router.get('/', async (req, res) => {
  try {
    const requests = await RoleRequest.find();
    const formattedRequests = requests.map(request => ({
      _id: request._id,
      username: request.originalInquiry.name,
      email: request.originalInquiry.email,
      contactNumber: request.originalInquiry.contactNumber,
      requestedRole: request.originalInquiry.subject,
      message: request.originalInquiry.message,
      status: request.originalInquiry.status,
      createdAt: request.createdAt
    }));
    res.json(formattedRequests);
  } catch (error) {
    console.error('Error fetching role requests:', error);
    res.status(500).json({ message: 'Error fetching role requests' });
  }
});

// Update role request status
router.put('/:id', async (req, res) => {
  try {
    const request = await RoleRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    request.originalInquiry.status = req.body.status;
    await request.save();
    
    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating role request:', error);
    res.status(500).json({ message: 'Error updating role request' });
  }
});

module.exports = router;
