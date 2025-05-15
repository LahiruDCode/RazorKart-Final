import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip
} from '@mui/material';
import { sellerProductService } from '../../services/sellerProductService';

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [setupMessage, setSetupMessage] = useState('');
  const [sellerEmail, setSellerEmail] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [debugMode, setDebugMode] = useState(process.env.NODE_ENV === 'development');

  // Get current user on component mount
  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    try {
      if (storedUser) {
        const user = JSON.parse(storedUser);
        console.log('Current user from localStorage:', user);
        setCurrentUser(user);
        setSellerEmail(user.email);
        
        // Debug authentication
        if (debugMode) {
          console.log('Auth token:', storedToken);
          
          // Decode JWT token (just for debugging)
          if (storedToken) {
            try {
              const base64Url = storedToken.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              }).join(''));
              
              console.log('Decoded token:', JSON.parse(jsonPayload));
            } catch (e) {
              console.error('Error decoding token:', e);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error parsing user from localStorage:', err);
    }
    
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const data = await sellerProductService.getMyProducts();
      console.log('Fetched products:', data);
      setProducts(data.products || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load your products: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Function to run the setup linking products to the specified seller email
  const handleSetupSellerProducts = async () => {
    try {
      if (!sellerEmail) {
        setSetupMessage('Please enter a valid seller email address');
        return;
      }
      
      setLoading(true);
      console.log('Setting up products for seller:', sellerEmail);
      const result = await sellerProductService.setupSellerProducts(sellerEmail);
      console.log('Setup result:', result);
      
      setSetupMessage(result.message || 'Setup completed successfully');
      // Refresh the product list after setup
      fetchMyProducts();
    } catch (err) {
      console.error('Setup error:', err);
      setSetupMessage('Error during setup: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // If there are no products, show setup option
  const renderNoProductsMessage = () => (
    <Box sx={{ textAlign: 'center', mt: 4, p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        No products found for {currentUser?.email || 'your account'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        You need to associate products with your seller account before they appear here.
      </Typography>
      
      <Button 
        variant="contained" 
        color="primary"
        onClick={() => setSetupDialogOpen(true)}
        sx={{ mt: 2 }}
      >
        Setup Seller Products
      </Button>

      <Dialog 
        open={setupDialogOpen} 
        onClose={() => setSetupDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Set Up Seller Products</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            This will associate all existing products with the seller account specified below.
            Each seller should use their own email to see only their products.
          </Alert>
          
          <TextField
            fullWidth
            label="Seller Email"
            value={sellerEmail}
            onChange={(e) => setSellerEmail(e.target.value)}
            margin="normal"
            variant="outlined"
            helperText="Enter the seller email to assign products to"
          />
          
          {setupMessage && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {setupMessage}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSetupDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              handleSetupSellerProducts();
            }} 
            variant="contained"
            color="primary"
          >
            Confirm Setup
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  // Render product table
  const renderProductTable = () => (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {products.length} Products Found 
          <Chip 
            label={`Owner: ${currentUser?.email || 'Unknown'}`} 
            color="primary" 
            size="small" 
            sx={{ ml: 2 }}
          />
        </Typography>
        <Button 
          variant="outlined"
          onClick={fetchMyProducts}
        >
          Refresh
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product._id}>
                <TableCell>
                  {product.images && product.images[0] && (
                    <Box
                      component="img"
                      src={product.images[0]}
                      alt={product.name}
                      sx={{ width: 50, height: 50, objectFit: 'cover' }}
                    />
                  )}
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="error" 
                    size="small"
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Products
      </Typography>
      
      {currentUser && (
        <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            <strong>Logged in as:</strong> {currentUser.email}
          </Typography>
          <Typography variant="body2">
            <strong>Role:</strong> {currentUser.role} | 
            <strong> User ID:</strong> {currentUser._id}
          </Typography>
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : products.length > 0 ? (
        renderProductTable()
      ) : (
        renderNoProductsMessage()
      )}
      
      {debugMode && (
        <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>Debug Info:</Typography>
          <pre style={{ fontSize: '0.8rem', overflow: 'auto', maxHeight: '200px' }}>
            {JSON.stringify({
              user: currentUser,
              productsCount: products.length,
              hasToken: !!localStorage.getItem('token'),
            }, null, 2)}
          </pre>
        </Box>
      )}
    </Box>
  );
};

export default MyProducts;
