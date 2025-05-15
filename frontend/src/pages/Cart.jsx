import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardMedia,
  CardContent,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
} from '@mui/icons-material';
import { cartService } from '../services/cartService';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchCart();
    // Set up an interval to refresh cart every 30 seconds to handle expired items
    const interval = setInterval(fetchCart, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartService.getCartItems();
      if (response.success) {
        setCartItems(response.cartItems);
        setTotal(response.total);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdating(true);
      setError(null);
      
      const response = await cartService.updateCartItem(productId, newQuantity);
      if (response.success) {
        await fetchCart(); // Refresh cart after update
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      setError(error.message || 'Failed to update cart');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      setUpdating(true);
      setError(null);
      
      const response = await cartService.removeFromCart(productId);
      if (response.success) {
        await fetchCart(); // Refresh cart after removal
      }
    } catch (error) {
      console.error('Error removing item:', error);
      setError(error.message || 'Failed to remove item');
    } finally {
      setUpdating(false);
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
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CartIcon /> Shopping Cart
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {(!cartItems || cartItems.length === 0) ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Your cart is empty
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              {cartItems.map((item) => (
                <Box key={item._id} sx={{ mb: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={3} sm={2}>
                      <CardMedia
                        component="img"
                        image={item.productId.images[0]}
                        alt={item.productId.name}
                        sx={{ borderRadius: 1, height: 100, objectFit: 'contain' }}
                      />
                    </Grid>
                    <Grid item xs={9} sm={10}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle1" component="div">
                            {item.productId.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ${item.productId.price}
                          </Typography>
                        </Grid>
                        <Grid item xs={8} sm={4}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleUpdateQuantity(item.productId._id, item.quantity - 1)}
                              disabled={updating || item.quantity <= 1}
                            >
                              <RemoveIcon />
                            </IconButton>
                            <Typography>
                              {item.quantity}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleUpdateQuantity(item.productId._id, item.quantity + 1)}
                              disabled={updating || item.quantity >= item.productId.stock}
                            >
                              <AddIcon />
                            </IconButton>
                          </Box>
                        </Grid>
                        <Grid item xs={4} sm={2}>
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveItem(item.productId._id)}
                            disabled={updating}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                </Box>
              ))}
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Box sx={{ my: 2 }}>
                <Grid container justifyContent="space-between">
                  <Typography>Subtotal</Typography>
                  <Typography>${total.toFixed(2)}</Typography>
                </Grid>
              </Box>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={updating}
              >
                Proceed to Checkout
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Cart;
