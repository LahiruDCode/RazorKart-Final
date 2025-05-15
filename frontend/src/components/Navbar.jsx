import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
} from '@mui/material';
import { 
  ShoppingCart as CartIcon,
  QuestionAnswer as InquiryIcon,
  ArrowDropDown as ArrowDropDownIcon,
  PersonOutline as PersonIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [inquiryMenuAnchor, setInquiryMenuAnchor] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  
  // Get auth context
  const { currentUser, logout, hasRole } = useAuth();

  useEffect(() => {
    fetchCartCount();
    // Refresh cart count every 30 seconds
    const interval = setInterval(fetchCartCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCartCount = async () => {
    try {
      if (!currentUser) return; // Only fetch cart if user is logged in
      
      const response = await API.get('/cart');
      if (response.data.success) {
        setCartItemCount(response.data.cart?.items?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const handleInquiryMenuOpen = (event) => {
    setInquiryMenuAnchor(event.currentTarget);
  };

  const handleInquiryMenuClose = () => {
    setInquiryMenuAnchor(null);
  };
  
  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const navigateToInquiry = (path) => {
    navigate(path);
    handleInquiryMenuClose();
  };
  
  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    navigate('/');
  };
  
  const getUserInitials = () => {
    if (!currentUser || !currentUser.username) return '?';
    
    const nameParts = currentUser.username.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };
  
  const handleDashboardClick = () => {
    handleUserMenuClose();
    
    if (hasRole('admin')) {
      navigate('/admin');
    } else if (hasRole('seller')) {
      navigate('/seller/dashboard');
    } else if (hasRole('inquiry-manager')) {
      navigate('/inquiry-management');
    } else if (hasRole('content-manager')) {
      navigate('/content-manager');
    }
  };

  return (
    <AppBar position="static" sx={{ bgcolor: 'white', boxShadow: 'none', borderBottom: '1px solid #eee' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
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
            <Button
              variant="outlined"
              onClick={() => navigate('/products')}
              sx={{
                color: '#FF3900',
                borderColor: '#FF3900',
                '&:hover': {
                  borderColor: '#FF6600',
                  bgcolor: 'rgba(255, 57, 0, 0.1)',
                },
              }}
            >
              All Products
            </Button>
            
            {/* Only show inquiry management for inquiry managers */}
            {hasRole('inquiry-manager') && (
              <>
                <Button
                  variant="outlined"
                  onClick={handleInquiryMenuOpen}
                  endIcon={<ArrowDropDownIcon />}
                  sx={{
                    color: '#FF3900',
                    borderColor: '#FF3900',
                    '&:hover': {
                      borderColor: '#FF6600',
                      bgcolor: 'rgba(255, 57, 0, 0.1)',
                    },
                  }}
                  startIcon={<InquiryIcon />}
                >
                  Inquiries
                </Button>
                <Menu
                  anchorEl={inquiryMenuAnchor}
                  open={Boolean(inquiryMenuAnchor)}
                  onClose={handleInquiryMenuClose}
                >
                  <MenuItem onClick={() => navigateToInquiry('/view-inquiries')}>View Inquiries</MenuItem>
                  <MenuItem onClick={() => navigateToInquiry('/inquiry-management')}>Inquiry Dashboard</MenuItem>
                  <MenuItem onClick={() => navigateToInquiry('/inquiry-templates')}>Reply Templates</MenuItem>
                </Menu>
              </>
            )}
            
            {/* Always show submit inquiry for all users */}
            {!hasRole('inquiry-manager') && (
              <Button
                variant="outlined"
                onClick={() => navigate('/submit-inquiry')}
                sx={{
                  color: '#FF3900',
                  borderColor: '#FF3900',
                  '&:hover': {
                    borderColor: '#FF6600',
                    bgcolor: 'rgba(255, 57, 0, 0.1)',
                  },
                }}
                startIcon={<InquiryIcon />}
              >
                Submit Inquiry
              </Button>
            )}
            
            {/* Show cart for everyone */}
            <IconButton
              onClick={() => navigate('/cart')}
              sx={{
                color: '#FF3900',
                '&:hover': {
                  bgcolor: 'rgba(255, 57, 0, 0.1)',
                },
              }}
            >
              <Badge badgeContent={cartItemCount} color="error">
                <CartIcon />
              </Badge>
            </IconButton>
            
            {/* Show either login button or user profile based on authentication */}
            {currentUser ? (
              <>
                <IconButton onClick={handleUserMenuOpen}>
                  <Avatar 
                    sx={{ 
                      bgcolor: '#FF3900',
                      width: 35,
                      height: 35,
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {getUserInitials()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={userMenuAnchor}
                  open={Boolean(userMenuAnchor)}
                  onClose={handleUserMenuClose}
                >
                  <MenuItem disabled>
                    <Typography variant="body2" color="textSecondary">
                      Signed in as <strong>{currentUser.username}</strong>
                    </Typography>
                  </MenuItem>
                  <MenuItem disabled>
                    <Typography variant="body2" color="textSecondary">
                      Role: <strong>{currentUser.role}</strong>
                    </Typography>
                  </MenuItem>
                  <Divider />
                  
                  {/* Show dashboard link for admin, seller, inquiry-manager */}
                  {(hasRole('admin') || hasRole('seller') || hasRole('inquiry-manager') || hasRole('content-manager')) && (
                    <MenuItem onClick={handleDashboardClick}>
                      <DashboardIcon fontSize="small" sx={{ mr: 1 }} />
                      Dashboard
                    </MenuItem>
                  )}
                  
                  <MenuItem onClick={() => { handleUserMenuClose(); navigate('/profile'); }}>
                    <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                    My Profile
                  </MenuItem>
                  
                  <MenuItem onClick={() => { handleUserMenuClose(); navigate('/my-orders'); }}>
                    <CartIcon fontSize="small" sx={{ mr: 1 }} />
                    My Orders
                  </MenuItem>

                  <MenuItem onClick={() => { handleUserMenuClose(); navigate('/my-inquiries'); }}>
                    <InquiryIcon fontSize="small" sx={{ mr: 1 }} />
                    My Inquiries
                  </MenuItem>
                  
                  <MenuItem onClick={() => { handleUserMenuClose(); navigate('/account-settings'); }}>
                    <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
                    Account Settings
                  </MenuItem>
                  
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{
                  bgcolor: '#FF3900',
                  color: 'white',
                  '&:hover': {
                    bgcolor: '#FF6600',
                  },
                }}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;