const express = require('express');
const router = express.Router();
const {
    getAllProducts,
    getProductDetails,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

// Get all products
router.get('/', getAllProducts);

// Get single product
router.get('/:id', getProductDetails);

// Create new product
router.post('/', createProduct);

// Update product
router.put('/:id', updateProduct);

// Delete product
router.delete('/:id', deleteProduct);

module.exports = router;