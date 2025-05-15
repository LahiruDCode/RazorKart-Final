import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  Snackbar,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import { Image as ImageIcon, Delete as DeleteIcon } from '@mui/icons-material';

const resizeImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 800;
        const size = Math.min(maxSize, Math.max(img.width, img.height));
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, size, size);
        
        let dx = 0, dy = 0, dWidth = size, dHeight = size;
        const aspectRatio = img.width / img.height;
        
        if (aspectRatio > 1) {
          dHeight = size / aspectRatio;
          dy = (size - dHeight) / 2;
        } else if (aspectRatio < 1) {
          dWidth = size * aspectRatio;
          dx = (size - dWidth) / 2;
        }
        
        ctx.drawImage(img, dx, dy, dWidth, dHeight);
        const resizedImage = canvas.toDataURL('image/jpeg', 0.7);
        resolve(resizedImage);
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const categories = [
  'Electronics',
  'Clothing',
  'Books',
  'Home & Garden',
  'Sports',
  'Toys',
  'Beauty',
  'Food'
];

const AddProduct = ({ open, onClose, onProductAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    images: []
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = async (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length === 0) {
      setError('Please select valid image files');
      return;
    }

    try {
      const newImages = [];
      const newPreviews = [];

      for (const file of validFiles) {
        const resizedImage = await resizeImage(file);
        newImages.push(resizedImage);
        newPreviews.push(URL.createObjectURL(file));
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    } catch (error) {
      console.error('Error processing images:', error);
      setError('Error processing images. Please try again.');
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setFieldErrors({});

    try {
      // Validate all required fields
      const errors = {};
      if (!formData.name.trim()) errors.name = 'Product name is required';
      if (!formData.description.trim()) errors.description = 'Product description is required';
      if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) {
        errors.price = 'Price must be greater than 0';
      }
      if (!formData.category) errors.category = 'Category is required';
      if (!formData.stock || isNaN(formData.stock) || Number(formData.stock) < 0) {
        errors.stock = 'Stock must be 0 or greater';
      }
      if (formData.images.length === 0) errors.images = 'At least one product image is required';

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setError('Please correct the errors in the form');
        return;
      }

      setIsLoading(true);
      
      // Get current user from localStorage to ensure userId is associated
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setError('User not authenticated. Please log in again.');
        setIsLoading(false);
        return;
      }
      
      const user = JSON.parse(storedUser);
      console.log(`Adding product as user: ${user.username} (${user._id})`);

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock),
        images: formData.images,
        // Explicitly include userId as a string to ensure proper MongoDB handling
        userId: user._id.toString()
      };

      console.log('Submitting product data:', productData);
      const response = await API.post('/products', productData);
      
      if (response.data.success) {
        setSuccess(true);
        if (onProductAdded) onProductAdded(response.data.product);
        // Reset form
        setFormData({
          name: '',
          description: '',
          price: '',
          category: '',
          stock: '',
          images: []
        });
        setImagePreviews([]);
        onClose();
      } else {
        throw new Error(response.data.message || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setError(error.response?.data?.message || error.message || 'Failed to save product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Add New Product</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                name="name"
                label="Product Name"
                value={formData.name}
                onChange={handleTextChange}
                required
                fullWidth
              />
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleTextChange}
                required
                fullWidth
                multiline
                rows={4}
              />
              <TextField
                name="price"
                label="Price"
                type="number"
                value={formData.price}
                onChange={handleTextChange}
                required
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
              />
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  label="Category"
                  onChange={handleSelectChange}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                name="stock"
                label="Stock"
                type="number"
                value={formData.stock}
                onChange={handleTextChange}
                required
                fullWidth
                inputProps={{ min: 0 }}
              />
              <Button
                variant="outlined"
                component="label"
                startIcon={<ImageIcon />}
                fullWidth
              >
                Upload Images
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />
              </Button>
              {imagePreviews.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Preview Images ({imagePreviews.length})
                  </Typography>
                  <Grid container spacing={1}>
                    {imagePreviews.map((preview, index) => (
                      <Grid item xs={4} key={index}>
                        <Box sx={{ position: 'relative' }}>
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                          />
                          <IconButton
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              backgroundColor: 'rgba(255, 255, 255, 0.8)',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.9)'
                              }
                            }}
                            onClick={() => handleRemoveImage(index)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Add Product
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Product added successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddProduct; 