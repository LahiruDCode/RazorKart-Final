import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Rating,
  IconButton,
  Snackbar,
  Alert,
  TextField,
  CircularProgress,
  Grid,
  Divider,
  Chip,
  Avatar
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ShareIcon from '@mui/icons-material/Share';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import StorefrontIcon from '@mui/icons-material/Storefront';
import VerifiedIcon from '@mui/icons-material/Verified';
import CheckIcon from '@mui/icons-material/Check';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService';

const STORE_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIGZpbGw9IiNFMEUwRTAiLz48cGF0aCBkPSJNNDAgMjBDMzEuNzE1NyAyMCAyNSAyNi43MTU3IDI1IDM1QzI1IDQzLjI4NDMgMzEuNzE1NyA1MCA0MCA1MEM0OC4yODQzIDUwIDU1IDQzLjI4NDMgNTUgMzVDNTUgMjYuNzE1NyA0OC4yODQzIDIwIDQwIDIwWk00MCA0NkMzMy45MjQ5IDQ2IDI5IDQxLjA3NTEgMjkgMzVDMjkgMjguOTI0OSAzMy45MjQ5IDI0IDQwIDI0QzQ2LjA3NTEgMjQgNTEgMjguOTI0OSA1MSAzNUM1MSA0MS4wNzUxIDQ2LjA3NTEgNDYgNDAgNDZaIiBmaWxsPSIjOUU5RTlFIi8+PC9zdmc+';

const ProductDetails = ({ isSellerView = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const data = await productService.getProductById(id);
      console.log('Product details response:', {
        id: data.product._id,
        name: data.product.name,
        hasStore: !!data.product.store,
        storeId: data.product.store?._id,
        storeName: data.product.store?.name,
        sellerId: data.product.userId,
        sellerUserId: data.product.store?.userId
      });
      setProduct(data.product);
      setError(null);
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError('Failed to fetch product details. Please try again later.');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const handleImageNavigation = (direction) => {
    if (!product?.images?.length) return;
    
    if (direction === 'next') {
      setSelectedImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    } else {
      setSelectedImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  const handleQuantityChange = (event) => {
    const value = parseInt(event.target.value);
    if (value >= 1 && value <= product.stock) {
      setQuantity(value);
    }
  };

  const handleQuantityIncrement = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleQuantityDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    try {
      setLoading(true);
      console.log('Adding product to cart:', {
        productId: product._id,
        name: product.name,
        quantity: quantity
      });
      
      const response = await cartService.addToCart(product._id, quantity);
      console.log('Add to cart response:', response);
      
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Product added to cart successfully!',
          severity: 'success'
        });
        setQuantity(1); // Reset quantity after successful add
      } else {
        throw new Error(response.message || 'Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to add product to cart',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setSnackbar({
      open: true,
      message: 'Product link copied to clipboard!',
      severity: 'success'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Paper sx={{ p: 3, mt: 3, textAlign: 'center', color: 'error.main' }}>
          {error}
        </Paper>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container>
        <Paper sx={{ p: 3, mt: 3, textAlign: 'center' }}>
          Product not found
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ position: 'relative', overflow: 'hidden', borderRadius: 2 }}>
            <Box
              component="img"
              src={product.images[selectedImageIndex]}
              alt={product.name}
              sx={{
                width: '100%',
                height: 400,
                objectFit: 'cover',
              }}
            />
            {product.images.length > 1 && (
              <>
                <IconButton
                  sx={{
                    position: 'absolute',
                    left: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                  }}
                  onClick={() => handleImageNavigation('prev')}
                >
                  <NavigateBeforeIcon />
                </IconButton>
                <IconButton
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                  }}
                  onClick={() => handleImageNavigation('next')}
                >
                  <NavigateNextIcon />
                </IconButton>
              </>
            )}
          </Paper>
          {/* Thumbnail Images */}
          <Box sx={{ display: 'flex', gap: 1, mt: 2, overflowX: 'auto', pb: 1 }}>
            {product.images.map((image, index) => (
              <Box
                key={index}
                component="img"
                src={image}
                alt={`${product.name} thumbnail ${index + 1}`}
                sx={{
                  width: 60,
                  height: 60,
                  objectFit: 'cover',
                  cursor: 'pointer',
                  border: index === selectedImageIndex ? '2px solid primary.main' : 'none',
                  borderRadius: 1,
                  '&:hover': { opacity: 0.8 },
                }}
                onClick={() => setSelectedImageIndex(index)}
              />
            ))}
          </Box>
        </Grid>

        {/* Product Details */}
        <Grid item xs={12} md={6}>
          <Typography variant="h4" component="h1" gutterBottom>
            {product.name}
          </Typography>
          <Typography variant="h5" color="primary" gutterBottom>
            ${product.price.toFixed(2)}
          </Typography>
          <Box sx={{ my: 2 }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {product.description}
            </Typography>
          </Box>
          <Box sx={{ my: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Category: {product.category}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Stock: {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
            </Typography>
          </Box>



          {/* Quantity and Add to Cart Section */}
          {!isSellerView && (
            <Paper sx={{ p: 3, mt: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', width: 120 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton 
                      size="small" 
                      onClick={handleQuantityDecrement}
                      disabled={quantity <= 1 || product.stock === 0}
                      sx={{ 
                        bgcolor: 'grey.100',
                        '&:hover': { bgcolor: 'grey.200' },
                        padding: '4px'
                      }}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <TextField
                      type="number"
                      value={quantity}
                      onChange={handleQuantityChange}
                      inputProps={{
                        min: 1,
                        max: product.stock,
                        step: 1,
                        style: { textAlign: 'center', MozAppearance: 'textfield' }
                      }}
                      sx={{ 
                        width: '100%',
                        '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                          '-webkit-appearance': 'none',
                          margin: 0
                        }
                      }}
                      disabled={product.stock === 0}
                      size="small"
                    />
                    <IconButton 
                      size="small" 
                      onClick={handleQuantityIncrement}
                      disabled={quantity >= product.stock || product.stock === 0}
                      sx={{ 
                        bgcolor: 'grey.100',
                        '&:hover': { bgcolor: 'grey.200' },
                        padding: '4px'
                      }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<ShoppingCartIcon />}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || loading}
                  sx={{ flex: 1, height: 40 }}
                >
                  {loading ? 'Adding...' : 'Add to Cart'}
                </Button>
                <IconButton onClick={handleShare} color="primary">
                  <ShareIcon />
                </IconButton>
              </Box>
            </Paper>
          )}

          {/* Seller Information Section */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mt: 3, 
              mb: 3, 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Seller Information
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip 
                  icon={<VerifiedIcon fontSize="small" sx={{ color: '#4285F4' }} />} 
                  label="Verified Seller" 
                  size="small" 
                  sx={{ 
                    bgcolor: '#ffffff', 
                    border: '1px solid #E0E0E0',
                    '& .MuiChip-label': { fontWeight: 500, color: '#333333' }
                  }}
                />
              </Box>
            </Box>
            
            {/* Cover Photo - Using exact image from screenshot */}
            <Box sx={{ mb: 2, borderRadius: 1, overflow: 'hidden', height: 150 }}>
              <Box
                component="img"
                src="https://via.placeholder.com/800x150/e8eaf6/7986cb?text=Online+Shopping"
                alt="Store Cover"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </Box>

            {/* Store Logo and Basic Info */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <Avatar
                src="/online-seller.png"
                alt="Online Seller New"
                sx={{
                  width: 70,
                  height: 70,
                  border: '1px solid #e0e0e0',
                  bgcolor: '#ffffff',
                }}
              >
                <StorefrontIcon sx={{ fontSize: 35, color: '#651fff' }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, mb: 0.5 }}>
                  Online Seller New
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.875rem', lineHeight: 1.5 }}>
                  Discover high-quality products at unbeatable prices! At Online Store, we are committed to providing you with a seamless shopping experience, offering a wide range of [mention product categories, e.g., fashion, electronics, home essentials, etc.]...aaa
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  <Chip 
                    icon={<CheckIcon sx={{ color: 'success.main', fontSize: 16 }} />} 
                    label="Top-Quality Products" 
                    size="small" 
                    variant="outlined"
                    sx={{ bgcolor: '#f1f8e9', border: '1px solid #c5e1a5', '& .MuiChip-label': { fontSize: '0.75rem', color: '#689f38' } }}
                  />
                  <Chip 
                    icon={<CheckIcon sx={{ color: 'success.main', fontSize: 16 }} />} 
                    label="Affordable Prices" 
                    size="small" 
                    variant="outlined"
                    sx={{ bgcolor: '#f1f8e9', border: '1px solid #c5e1a5', '& .MuiChip-label': { fontSize: '0.75rem', color: '#689f38' } }}
                  />
                  <Chip 
                    icon={<CheckIcon sx={{ color: 'success.main', fontSize: 16 }} />} 
                    label="Fast Delivery" 
                    size="small" 
                    variant="outlined"
                    sx={{ bgcolor: '#f1f8e9', border: '1px solid #c5e1a5', '& .MuiChip-label': { fontSize: '0.75rem', color: '#689f38' } }}
                  />
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Contact Information - Exactly as in screenshot */}
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'text.primary', fontSize: '1rem' }}>
              Contact Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  Email
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                  info@onlineseller.com
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  Phone
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                  0716006006
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  Store Address
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                  426, Ragama
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Hidden backup section if store info not available - currently not used */}
          {false && (
            <Paper sx={{ p: 3, mt: 3, mb: 3 }}>
              <Typography variant="subtitle1" color="text.secondary" align="center">
                Store information not available
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductDetails;