const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Promotion = require('../models/Promotion');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
    req.fileValidationError = 'Only image files are allowed!';
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Create a new promotion
router.post('/', upload.single('bannerImage'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Banner image is required' });
    }

    // Validate required fields
    const { title, startDate, endDate, description, targetAudience } = req.body;
    
    if (!title || !startDate || !endDate || !description || !targetAudience) {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if dates are valid
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: 'Invalid date format' });
    }

    if (end <= start) {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Create and save the promotion
    const promotion = new Promotion({
      title,
      startDate,
      endDate,
      description,
      targetAudience,
      bannerImage: `/uploads/${req.file.filename}`, // Store path to image
      status: new Date() >= start && new Date() <= end ? 'active' : 'scheduled'
    });

    await promotion.save();
    
    res.status(201).json({
      message: 'Promotion created successfully',
      promotion
    });
  } catch (error) {
    console.error('Error creating promotion:', error);
    // Delete uploaded file if save fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all promotions
router.get('/', async (req, res) => {
  try {
    const promotions = await Promotion.find().sort({ createdAt: -1 });
    res.json(promotions);
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get active promotions
router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    const promotions = await Promotion.find({
      startDate: { $lte: now },
      endDate: { $gte: now },
      status: 'active'
    }).sort({ createdAt: -1 });
    
    res.json(promotions);
  } catch (error) {
    console.error('Error fetching active promotions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a single promotion
router.get('/:id', async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }
    
    res.json(promotion);
  } catch (error) {
    console.error('Error fetching promotion:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a promotion
router.patch('/:id', upload.single('bannerImage'), async (req, res) => {
  try {
    const updates = { ...req.body };
    
    // If new image is uploaded
    if (req.file) {
      updates.bannerImage = `/uploads/${req.file.filename}`;
    }
    
    // Check if dates need to be updated
    if (updates.startDate || updates.endDate) {
      const promotion = await Promotion.findById(req.params.id);
      
      if (!promotion) {
        // Delete uploaded file if promotion not found
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ message: 'Promotion not found' });
      }
      
      const start = new Date(updates.startDate || promotion.startDate);
      const end = new Date(updates.endDate || promotion.endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        // Delete uploaded file if validation fails
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ message: 'Invalid date format' });
      }
      
      if (end <= start) {
        // Delete uploaded file if validation fails
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ message: 'End date must be after start date' });
      }
      
      // Update status based on new dates
      const now = new Date();
      updates.status = now >= start && now <= end ? 'active' : 'scheduled';
      
      // If there was an existing image and a new one is uploaded, delete the old one
      if (promotion.bannerImage && req.file) {
        const oldImagePath = path.join(__dirname, '..', promotion.bannerImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }
    
    const updatedPromotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!updatedPromotion) {
      // Delete uploaded file if promotion not found
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: 'Promotion not found' });
    }
    
    res.json({
      message: 'Promotion updated successfully',
      promotion: updatedPromotion
    });
  } catch (error) {
    console.error('Error updating promotion:', error);
    // Delete uploaded file if update fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a promotion
router.delete('/:id', async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }
    
    // Delete banner image file
    if (promotion.bannerImage) {
      const imagePath = path.join(__dirname, '..', promotion.bannerImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await Promotion.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Promotion deleted successfully' });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
