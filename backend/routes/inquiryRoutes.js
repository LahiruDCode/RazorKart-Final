const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');
const { protect } = require('../middleware/auth');

// Get all inquiries (admin/inquiry manager access)
router.get('/', inquiryController.getAllInquiries);

// Get user's own inquiries (authenticated users only)
router.get('/my-inquiries', protect, inquiryController.getUserInquiries);

// Get single inquiry (protected to ensure user can only access their own inquiries)
router.get('/:id', protect, inquiryController.getInquiry);

// Create new inquiry - protected route if user is logged in, public if not
router.post('/', protect, inquiryController.createInquiry);

// Update inquiry
router.put('/:id', inquiryController.updateInquiry);

// Update inquiry status
router.patch('/:id/status', inquiryController.updateInquiryStatus);

// Forward inquiry
router.post('/:id/forward', inquiryController.forwardInquiry);

// Delete inquiry
router.delete('/:id', inquiryController.deleteInquiry);

// Role request routes
router.get('/role-requests', inquiryController.getRoleRequests);
router.put('/role-requests/:id/status', inquiryController.updateRoleRequestStatus);

// Reply to inquiry
router.post('/:id/reply', inquiryController.replyToInquiry);

module.exports = router;