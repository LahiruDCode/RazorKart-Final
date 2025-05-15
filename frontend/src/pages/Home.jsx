import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  InputBase,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Backdrop,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';

import { Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material';
import DevicesIcon from '@mui/icons-material/Devices';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import YardIcon from '@mui/icons-material/Yard';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import ToysIcon from '@mui/icons-material/Toys';
import FaceRetouchingNaturalIcon from '@mui/icons-material/FaceRetouchingNatural';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import API from '../api';

const categories = [
  {
    name: 'Electronics',
    icon: <DevicesIcon sx={{ fontSize: 40, color: '#FF3900' }} />,
  },
  {
    name: 'Clothing',
    icon: <CheckroomIcon sx={{ fontSize: 40, color: '#FF3900' }} />,
  },
  {
    name: 'Books',
    icon: <MenuBookIcon sx={{ fontSize: 40, color: '#FF3900' }} />,
  },
  {
    name: 'Home & Garden',
    icon: <YardIcon sx={{ fontSize: 40, color: '#FF3900' }} />,
  },
  {
    name: 'Sports',
    icon: <SportsSoccerIcon sx={{ fontSize: 40, color: '#FF3900' }} />,
  },
  {
    name: 'Toys',
    icon: <ToysIcon sx={{ fontSize: 40, color: '#FF3900' }} />,
  },
  {
    name: 'Beauty',
    icon: <FaceRetouchingNaturalIcon sx={{ fontSize: 40, color: '#FF3900' }} />,
  },
  {
    name: 'Food',
    icon: <RestaurantIcon sx={{ fontSize: 40, color: '#FF3900' }} />,
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetchProducts();

    // Add keyboard shortcut listener
    const handleKeyPress = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === 'Escape') {
        setSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 5)); // Show top 5 results
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products for homepage...');
      const response = await API.get('/products');
      console.log('Products response status:', response.status);
      
      if (response.data && response.data.success) {
        console.log(`Fetched ${response.data.products.length} products successfully`);
        setProducts(response.data.products);
      } else {
        console.error('API returned success:false or invalid data structure', response.data);
        setError('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(`Failed to fetch products: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ pt: 2 }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4
        }}>
          <Typography 
            variant="h5" 
            component="h1" 
            sx={{ 
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            <Typography component="span" variant="h5" sx={{ color: '#FF3900', fontWeight: 600 }}>
              Razor
            </Typography>
            <Typography component="span" variant="h5" sx={{ color: '#666' }}>
              Kart
            </Typography>
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Paper
              onClick={() => setSearchOpen(true)}
              sx={{
                p: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                width: 400,
                borderRadius: 2,
                border: '1px solid #ddd',
                cursor: 'pointer',
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #FF3900',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                },
              }}
            >
              <SearchIcon sx={{ ml: 1, color: '#FF3900' }} />
              <Typography
                sx={{
                  ml: 1,
                  flex: 1,
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                }}
              >
                Search products... (⌘K)
              </Typography>
            </Paper>
          </Box>
        </Box>

        {/* Spotlight Search Dialog */}
        <Dialog
          open={searchOpen}
          onClose={handleSearchClose}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }
          }}
        >
          <DialogContent sx={{ p: 0 }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <SearchIcon sx={{ color: '#FF3900' }} />
              <InputBase
                autoFocus
                fullWidth
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ flex: 1 }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  px: 1,
                  py: 0.5,
                }}
              >
                ESC
              </Typography>
            </Box>
            {searchResults.length > 0 && (
              <>
                <Divider />
                <List sx={{ py: 0 }}>
                  {searchResults.map((product) => (
                    <ListItem
                      key={product._id}
                      onClick={() => handleProductClick(product._id)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'rgba(255, 57, 0, 0.1)',
                        },
                      }}
                    >
                      <Box
                        component="img"
                        src={product.images[0]}
                        alt={product.name}
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          mr: 2,
                          objectFit: 'cover',
                        }}
                      />
                      <ListItemText
                        primary={product.name}
                        secondary={`$${product.price.toFixed(2)} - ${product.category}`}
                        primaryTypographyProps={{
                          fontWeight: 500,
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Categories */}
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Our Categories
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {categories.map((category) => (
            <Grid item xs={6} sm={4} md={3} key={category.name}>
              <Paper
                elevation={0}
                onClick={() => navigate(`/products?category=${category.name}`)}
                sx={{
                  p: 2,
                  textAlign: 'center',
                  borderRadius: 2,
                  cursor: 'pointer',
                  border: '1px solid #eee',
                  '&:hover': {
                    bgcolor: 'rgba(255, 57, 0, 0.1)',
                    borderColor: '#FF3900',
                  },
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: 60,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  {category.icon}
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {category.name}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Banner */}
        <Box
          sx={{
            width: '100%',
            height: 300,
            borderRadius: 2,
            overflow: 'hidden',
            position: 'relative',
            mb: 4,
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200"
            alt="Banner"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white',
              textAlign: 'center',
              p: 4,
            }}
          >
            <Typography variant="h3" gutterBottom>
              Starting '99
            </Typography>
            <Typography variant="h4" gutterBottom>
              Home shopping spree
            </Typography>
            <Typography variant="h5">
              11th - 12th March
            </Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>
              Extra 15% off use code: HOME15
            </Typography>
          </Box>
        </Box>

        {/* Featured Products */}
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Featured Products
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={3} key={product._id}>
                <Card 
                  onClick={() => handleProductClick(product._id)}
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3,
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.images[0]}
                    alt={product.name}
                    sx={{ 
                      objectFit: 'cover',
                      bgcolor: '#f5f5f5',
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography 
                      gutterBottom 
                      variant="h6" 
                      component="h2" 
                      sx={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        mb: 1,
                        height: '1.5rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {product.name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        mb: 2,
                        height: '40px',
                        fontSize: '0.875rem'
                      }}
                    >
                      {product.description}
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mt: 'auto'
                    }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: '#FF3900', 
                          fontWeight: 600,
                          fontSize: '1.1rem'
                        }}
                      >
                        ${product.price.toFixed(2)}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          bgcolor: product.stock > 0 ? 'success.light' : 'error.light',
                          color: product.stock > 0 ? 'success.dark' : 'error.dark',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.75rem'
                        }}
                      >
                        {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default Home; 