const Inquiry = require('../models/Inquiry');
const RoleRequest = require('../models/RoleRequest');

// Validate phone number
const validatePhoneNumber = (number) => {
  // Remove any non-digit characters
  const digits = number.replace(/\D/g, '');
  
  // Check if it starts with 0
  if (!digits.startsWith('0')) {
    throw new Error('Phone number must start with 0');
  }
  
  // Check if it has exactly 10 digits
  if (digits.length !== 10) {
    throw new Error('Phone number must be exactly 10 digits');
  }
  
  // Check if it contains only integers
  if (!/^\d+$/.test(digits)) {
    throw new Error('Phone number must contain only numbers');
  }
  
  return digits;
};

// Get all inquiries
exports.getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single inquiry - with user validation to ensure privacy
exports.getInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    
    // If user is authenticated and not an admin/inquiry-manager, verify ownership
    if (req.user && !['admin', 'inquiry-manager'].includes(req.user.role)) {
      // Convert the ObjectIds to strings for comparison
      const inquiryUserId = inquiry.userId ? inquiry.userId.toString() : null;
      const currentUserId = req.user._id.toString();
      
      // Check if inquiry belongs to user or if it was made without authentication (no userId)
      const isOwner = inquiryUserId === currentUserId;
      const isAnonymous = !inquiry.userId && inquiry.email === req.user.email;
      
      if (!isOwner && !isAnonymous) {
        console.log('Unauthorized inquiry access attempt:', {
          inquiryId: req.params.id,
          inquiryUserId: inquiryUserId,
          currentUserId: currentUserId,
          userEmail: req.user.email,
          inquiryEmail: inquiry.email
        });
        return res.status(403).json({ message: 'You do not have permission to view this inquiry' });
      }
      
      console.log('Inquiry access granted to owner:', {
        inquiryId: req.params.id,
        userId: currentUserId
      });
    }
    
    res.json(inquiry);
  } catch (error) {
    console.error('Error fetching inquiry:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create new inquiry
exports.createInquiry = async (req, res) => {
  try {
    // Validate phone number
    const validatedPhone = validatePhoneNumber(req.body.contactNumber);
    req.body.contactNumber = validatedPhone;

    // Include userId if available in the request (from auth middleware)
    if (req.user) {
      // Use the MongoDB _id directly from the user object
      req.body.userId = req.user._id;
      console.log('Associating inquiry with user:', req.user._id);
    }

    const inquiry = new Inquiry(req.body);
    const newInquiry = await inquiry.save();
    res.status(201).json(newInquiry);
  } catch (error) {
    res.status(400).json({ 
      message: error.message,
      field: error.message.toLowerCase().includes('phone') ? 'contactNumber' : null
    });
  }
};

// Get user's inquiries
exports.getUserInquiries = async (req, res) => {
  try {
    // Ensure the user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const userId = req.user.userId;
    const inquiries = await Inquiry.find({ userId }).sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    console.error('Error fetching user inquiries:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update inquiry status
exports.updateInquiryStatus = async (req, res) => {
  try {
    console.log('Status update request received:', {
      inquiryId: req.params.id,
      newStatus: req.body.status
    });
    
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      console.log('Inquiry not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    
    // Check if the status is valid according to the model's enum
    const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Rejected'];
    if (!validStatuses.includes(req.body.status)) {
      console.log('Invalid status value:', req.body.status);
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }
    
    inquiry.status = req.body.status;
    const updatedInquiry = await inquiry.save();
    console.log('Inquiry status updated successfully:', {
      id: updatedInquiry._id,
      newStatus: updatedInquiry.status
    });
    
    res.json(updatedInquiry);
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update inquiry
exports.updateInquiry = async (req, res) => {
    try {
        const { name, email, contactNumber, subject, message } = req.body;

        // Validate phone number if it's being updated
        if (contactNumber) {
            try {
                validatePhoneNumber(contactNumber);
            } catch (error) {
                return res.status(400).json({ 
                    message: error.message,
                    field: 'contactNumber'
                });
            }
        }

        const updatedInquiry = await Inquiry.findByIdAndUpdate(
            req.params.id,
            {
                name,
                email,
                contactNumber,
                subject,
                message,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        );

        if (!updatedInquiry) {
            return res.status(404).json({ message: 'Inquiry not found' });
        }

        res.json(updatedInquiry);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete inquiry
exports.deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    await inquiry.deleteOne();
    res.json({ message: 'Inquiry deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Forward inquiry
exports.forwardInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    const { forwardTo, role } = req.body;

    // If forwarding to Admin, just save a copy to roleRequest
    if (role === 'Admin') {
      const roleRequest = new RoleRequest({
        inquiryId: inquiry._id,
        originalInquiry: inquiry.toObject()
      });
      await roleRequest.save();
    }

    res.json({ message: 'Inquiry forwarded successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add new controller for handling role requests
exports.getRoleRequests = async (req, res) => {
  try {
    const roleRequests = await RoleRequest.find()
      .populate('inquiryId')
      .sort({ forwardedAt: -1 });
    res.json(roleRequests);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateRoleRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const roleRequest = await RoleRequest.findById(id);
    if (!roleRequest) {
      return res.status(404).json({ message: 'Role request not found' });
    }

    roleRequest.status = status;
    roleRequest.adminResponse = adminResponse;
    roleRequest.responseDate = new Date();
    await roleRequest.save();

    // Update the original inquiry status if needed
    const inquiry = await Inquiry.findById(roleRequest.inquiryId);
    if (inquiry) {
      if (status === 'approved') {
        inquiry.status = 'In Progress';
      } else if (status === 'rejected') {
        inquiry.status = 'Rejected';
      }
      await inquiry.save();
    }

    res.json(roleRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.replyToInquiry = async (req, res) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id);
        if (!inquiry) {
            return res.status(404).json({ message: 'Inquiry not found' });
        }

        const { message, respondedBy } = req.body;

        // Add reply to the inquiry
        inquiry.replies.push({
            message,
            respondedBy,
            timestamp: new Date()
        });

        // Update status to In Progress if it was Pending
        if (inquiry.status === 'Pending') {
            inquiry.status = 'In Progress';
        }

        await inquiry.save();
        res.json(inquiry);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}; 