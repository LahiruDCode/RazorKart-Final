import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import api from '../../api';

const OngoingAds = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/promotions');
      setPromotions(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      setError('Failed to load promotions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (promotion) => {
    setSelectedPromotion(promotion);
    setDeleteDialogOpen(true);
  };

  const handleViewClick = (promotion) => {
    setSelectedPromotion(promotion);
    setViewDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPromotion) return;
    
    try {
      setLoading(true);
      await api.delete(`/promotions/${selectedPromotion._id}`);
      
      setPromotions(promotions.filter(p => p._id !== selectedPromotion._id));
      setSnackbar({
        open: true,
        message: 'Promotion deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting promotion:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting promotion',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setSelectedPromotion(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'scheduled':
        return 'primary';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  const checkStatus = (promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    
    if (now < startDate) {
      return 'scheduled';
    } else if (now > endDate) {
      return 'inactive';
    } else {
      return 'active';
    }
  };

  if (loading && promotions.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, mt: 2 }}>
        Manage Promotional Banners
      </Typography>
      
      {promotions.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No promotional banners found
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => window.location.href = '/content-manager/create-banner'}
          >
            Create Your First Banner
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {promotions.map((promotion) => (
            <Grid item xs={12} sm={6} md={4} key={promotion._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="160"
                  image={`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${promotion.bannerImage}`}
                  alt={promotion.title}
                  sx={{ objectFit: 'cover' }}
                />
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" noWrap sx={{ maxWidth: '70%' }}>
                      {promotion.title}
                    </Typography>
                    <Chip 
                      label={checkStatus(promotion)}
                      size="small"
                      color={getStatusColor(checkStatus(promotion))}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {`${formatDate(promotion.startDate)} - ${formatDate(promotion.endDate)}`}
                  </Typography>
                  
                  <Chip 
                    label={promotion.targetAudience === 'buyers' ? 'Buyers' : 'Sellers'}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {promotion.description}
                  </Typography>
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<VisibilityIcon />} 
                    onClick={() => handleViewClick(promotion)}
                  >
                    View
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<DeleteIcon />} 
                    color="error"
                    onClick={() => handleDeleteClick(promotion)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        {selectedPromotion && (
          <>
            <DialogTitle>{selectedPromotion.title}</DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <img 
                  src={`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${selectedPromotion.bannerImage}`}
                  alt={selectedPromotion.title}
                  style={{ width: '100%', borderRadius: '4px' }}
                />
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Target Audience:</Typography>
                  <Typography variant="body2">
                    {selectedPromotion.targetAudience === 'buyers' ? 'Buyers' : 'Sellers'}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Status:</Typography>
                  <Chip 
                    label={checkStatus(selectedPromotion)}
                    size="small"
                    color={getStatusColor(checkStatus(selectedPromotion))}
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Start Date:</Typography>
                  <Typography variant="body2">
                    {formatDate(selectedPromotion.startDate)}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2">End Date:</Typography>
                  <Typography variant="body2">
                    {formatDate(selectedPromotion.endDate)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Description:</Typography>
                  <Typography variant="body2">
                    {selectedPromotion.description}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this promotional banner? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OngoingAds;
