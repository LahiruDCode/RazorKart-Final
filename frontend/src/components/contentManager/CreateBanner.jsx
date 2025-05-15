import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  MenuItem,
  Container,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import api from '../../api';

const audienceOptions = [
  { value: 'buyers', label: 'Buyers' },
  { value: 'sellers', label: 'Sellers' }
];

const CreateBanner = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAudience: '',
    startDate: '',
    endDate: '',
    bannerImage: null
  });
  
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      setSnackbar({
        open: true,
        message: 'Please select an image file',
        severity: 'error'
      });
      return;
    }

    setFormData({
      ...formData,
      bannerImage: file
    });

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.description || !formData.targetAudience || 
        !formData.startDate || !formData.endDate || !formData.bannerImage) {
      setSnackbar({
        open: true,
        message: 'All fields are required',
        severity: 'error'
      });
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setSnackbar({
        open: true,
        message: 'End date must be after start date',
        severity: 'error'
      });
      return;
    }

    setLoading(true);

    try {
      // Create form data for file upload
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('targetAudience', formData.targetAudience);
      data.append('startDate', formData.startDate);
      data.append('endDate', formData.endDate);
      data.append('bannerImage', formData.bannerImage);

      await api.post('/promotions', data);
      
      setSnackbar({
        open: true,
        message: 'Banner created successfully!',
        severity: 'success'
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        targetAudience: '',
        startDate: '',
        endDate: '',
        bannerImage: null
      });
      setPreview(null);
      
    } catch (error) {
      console.error('Error creating banner:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error creating banner',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
          Create Promotional Banner
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                variant="outlined"
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                variant="outlined"
                multiline
                rows={4}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Target Audience"
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleChange}
                variant="outlined"
                required
              >
                {audienceOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<UploadIcon />}
                sx={{ height: '100%', width: '100%' }}
              >
                Upload Banner Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />
              </Button>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                variant="outlined"
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                variant="outlined"
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            {preview && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Preview:
                </Typography>
                <Box
                  component="img"
                  src={preview}
                  alt="Banner Preview"
                  sx={{
                    width: '100%',
                    maxHeight: '200px',
                    objectFit: 'contain',
                    borderRadius: 1,
                    border: '1px solid #ddd'
                  }}
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Banner'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreateBanner;
