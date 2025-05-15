import React, { useState } from 'react';
import API from '../../api';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';

// Component to setup products for a specific seller
const SetupSellerProducts = ({ onClose }) => {
  const [email, setEmail] = useState('testing02@gmail.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleSetup = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await API.post('/seller-products/setup-seller-products', {
        email
      });

      setResult(response.data);
      setSnackbar({
        open: true,
        message: `Successfully set up products for seller: ${email}`,
        severity: 'success'
      });
      
      // Close dialog after successful setup (if onClose provided)
      if (onClose) {
        setTimeout(() => onClose(), 2000);
      }
    } catch (err) {
      console.error('Error setting up seller products:', err);
      setError(err.response?.data?.message || err.message || 'Failed to setup products');
      setSnackbar({
        open: true,
        message: `Error: ${err.response?.data?.message || err.message || 'Failed to setup products'}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Setup Seller Products
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          This utility will assign all products to the specified seller account.
        </Typography>
        
        <TextField
          fullWidth
          label="Seller Email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          placeholder="Enter seller email"
          helperText="Enter the email of the seller to assign products to"
        />
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleSetup}
            disabled={loading || !email}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
          >
            {loading ? 'Setting Up...' : 'Setup Products'}
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {result && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {result.message}
          </Alert>
        )}
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SetupSellerProducts;
