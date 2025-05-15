const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const SellerItem = require('../models/SellerItem');

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

// Create a new seller item
router.post('/', upload.single('productImage'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Product image is required' });
    }

    // Validate required fields
    const { sellerName, itemName, description, price, category } = req.body;
    
    if (!sellerName || !itemName || !description || !price || !category) {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate price
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: 'Price must be a positive number' });
    }

    // Create and save the seller item
    const sellerItem = new SellerItem({
      sellerName,
      itemName,
      description,
      price: parseFloat(price),
      category,
      productImage: `/uploads/${req.file.filename}`, // Store path to image
      status: 'pending'
    });

    await sellerItem.save();
    
    res.status(201).json({
      message: 'Seller item submitted successfully and awaiting approval',
      sellerItem
    });
  } catch (error) {
    console.error('Error creating seller item:', error);
    // Delete uploaded file if save fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all seller items
router.get('/', async (req, res) => {
  try {
    const sellerItems = await SellerItem.find().sort({ createdAt: -1 });
    res.json(sellerItems);
  } catch (error) {
    console.error('Error fetching seller items:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get pending seller items
router.get('/pending', async (req, res) => {
  try {
    const pendingItems = await SellerItem.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json(pendingItems);
  } catch (error) {
    console.error('Error fetching pending items:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get approved seller items
router.get('/approved', async (req, res) => {
  try {
    const approvedItems = await SellerItem.find({ status: 'approved' }).sort({ createdAt: -1 });
    res.json(approvedItems);
  } catch (error) {
    console.error('Error fetching approved items:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a single seller item
router.get('/:id', async (req, res) => {
  try {
    const sellerItem = await SellerItem.findById(req.params.id);
    
    if (!sellerItem) {
      return res.status(404).json({ message: 'Seller item not found' });
    }
    
    res.json(sellerItem);
  } catch (error) {
    console.error('Error fetching seller item:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a seller item (approve or reject)
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required (approved, rejected, or pending)' });
    }
    
    const updatedItem = await SellerItem.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!updatedItem) {
      return res.status(404).json({ message: 'Seller item not found' });
    }
    
    res.json({
      message: `Seller item ${status}`,
      sellerItem: updatedItem
    });
  } catch (error) {
    console.error('Error updating seller item status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a seller item
router.delete('/:id', async (req, res) => {
  try {
    const sellerItem = await SellerItem.findById(req.params.id);
    
    if (!sellerItem) {
      return res.status(404).json({ message: 'Seller item not found' });
    }
    
    // Delete product image file
    if (sellerItem.productImage) {
      const imagePath = path.join(__dirname, '..', sellerItem.productImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await SellerItem.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Seller item deleted successfully' });
  } catch (error) {
    console.error('Error deleting seller item:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
