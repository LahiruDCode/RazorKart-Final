import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardMedia,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { Image as ImageIcon, Save as SaveIcon } from '@mui/icons-material';
import { storeService } from '../../services/storeService';
import { useAuth } from '../../context/AuthContext';

const resizeImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 1200; // Larger size for cover photo
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
        const resizedImage = canvas.toDataURL('image/jpeg', 0.8);
        resolve(resizedImage);
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const StoreSettings = () => {
  const { currentUser } = useAuth();
  console.log('StoreSettings component rendering');
  
  const [store, setStore] = useState({
    name: '',
    description: '',
    coverPhoto: '',
    logo: '',
    contactEmail: '',
    contactPhone: '',
    address: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchStoreDetails();
    return () => {
      // Cleanup function
    };
  }, []);

  const fetchStoreDetails = async () => {
    try {
      setLoading(true);
      const response = await storeService.getStoreDetails();
      
      if (response.success) {
        // If we have a store, use its data
        setStore(response.store);
      } else {
        // Initialize with empty values if no store exists
        setStore({
          name: '',
          description: '',
          coverPhoto: '',
          logo: '',
          contactEmail: '',
          contactPhone: '',
          address: ''
        });
      }
      setError(null);
    } catch (error) {
      // Don't show error to the user, just initialize with empty values
      setStore({
        name: '',
        description: '',
        coverPhoto: '',
        logo: '',
        contactEmail: '',
        contactPhone: '',
        address: ''
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStore(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    try {
      const resizedImage = await resizeImage(file);
      setStore(prev => ({
        ...prev,
        [type]: resizedImage
      }));
    } catch (error) {
      console.error('Error processing image:', error);
      setError('Error processing image. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Only keep the essential fields from the store object to prevent validation issues
      const storeData = {
        name: store.name || 'My Store',
        description: store.description || 'Welcome to my store',
        coverPhoto: store.coverPhoto || 'https://via.placeholder.com/1200x400',
        logo: store.logo || 'https://via.placeholder.com/150',
        contactEmail: store.contactEmail || currentUser.email,
        contactPhone: store.contactPhone || '+1234567890',
        address: store.address || 'Store Address',
        userId: currentUser._id, // Explicitly include the user ID
        email: currentUser.email // Include email as additional identifier
      };

      // Add detailed logging
      console.log('Current user:', currentUser);
      console.log('Saving store with data:', JSON.stringify(storeData));

      try {
        const response = await storeService.updateStore(storeData);
        console.log('Store API response:', response);
        
        if (response && response.success) {
          setSuccess(true);
          setStore(response.store);
          console.log('Store saved successfully:', response.store);
        } else {
          console.error('Store API returned unsuccessful response:', response);
          throw new Error((response && response.message) || 'Failed to update store');
        }
      } catch (apiError) {
        console.error('API error details:', apiError);
        throw apiError;
      }
    } catch (error) {
      console.error('Error saving store:', error);
      // Show the actual error message from the server if available
      const errorMessage = error.response?.data?.message || error.message || 'Unable to save store settings. Please try again.';
      console.error('Error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setSaving(false);
      
      // Scroll to the top to see success/error messages
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Store Settings
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Store settings updated successfully
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Cover Photo */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Cover Photo
              </Typography>
              {store.coverPhoto ? (
                <Box sx={{ position: 'relative', mb: 2 }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={store.coverPhoto}
                    alt="Store Cover"
                    sx={{ borderRadius: 1 }}
                  />
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<ImageIcon />}
                    sx={{ position: 'absolute', bottom: 8, right: 8 }}
                  >
                    Change Cover
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'coverPhoto')}
                    />
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<ImageIcon />}
                  fullWidth
                  sx={{ height: 200 }}
                >
                  Upload Cover Photo
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'coverPhoto')}
                  />
                </Button>
              )}
            </Grid>

            {/* Store Logo */}
            <Grid item xs={12} sm={4}>
              <Typography variant="h6" gutterBottom>
                Store Logo
              </Typography>
              {store.logo ? (
                <Box sx={{ position: 'relative', mb: 2 }}>
                  <CardMedia
                    component="img"
                    height="150"
                    image={store.logo}
                    alt="Store Logo"
                    sx={{ borderRadius: '50%', width: 150, height: 150, margin: 'auto' }}
                  />
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<ImageIcon />}
                    sx={{ position: 'absolute', bottom: 8, right: 8 }}
                  >
                    Change Logo
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'logo')}
                    />
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<ImageIcon />}
                  fullWidth
                  sx={{ height: 150 }}
                >
                  Upload Logo
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'logo')}
                  />
                </Button>
              )}
            </Grid>

            {/* Store Details */}
            <Grid item xs={12} sm={8}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Store Name"
                    name="name"
                    value={store.name}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Store Description"
                    name="description"
                    value={store.description}
                    onChange={handleInputChange}
                    multiline
                    rows={4}
                    required
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Email"
                    name="contactEmail"
                    type="email"
                    value={store.contactEmail}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Phone"
                    name="contactPhone"
                    value={store.contactPhone}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Store Address"
                    name="address"
                    value={store.address}
                    onChange={handleInputChange}
                    multiline
                    rows={2}
                    required
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<SaveIcon />}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default StoreSettings;
