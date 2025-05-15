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
  Alert,
  Tab,
  Tabs,
  Divider
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../../api';

const SellerAds = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      let endpoint = '/seller-items';
      
      // Use the appropriate endpoint based on the active tab
      if (activeTab === 'pending') {
        endpoint = '/seller-items/pending';
      } else if (activeTab === 'approved') {
        endpoint = '/seller-items/approved';
      }
      
      const response = await api.get(endpoint);
      setItems(response.data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching seller items:', error);
      setError('Failed to load seller items. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewClick = (item) => {
    setSelectedItem(item);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const handleStatusChange = async (itemId, status) => {
    try {
      setLoading(true);
      await api.patch(`/seller-items/${itemId}`, { status });
      
      // Update the local state based on the action
      if (status === 'rejected' || status === 'approved') {
        setItems(items.filter(item => item._id !== itemId));
      }
      
      setSnackbar({
        open: true,
        message: `Item ${status} successfully`,
        severity: 'success'
      });
    } catch (error) {
      console.error(`Error ${status} item:`, error);
      setSnackbar({
        open: true,
        message: `Error ${status} item`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setViewDialogOpen(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;
    
    try {
      setLoading(true);
      await api.delete(`/seller-items/${selectedItem._id}`);
      
      setItems(items.filter(item => item._id !== selectedItem._id));
      setSnackbar({
        open: true,
        message: 'Item deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting item',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setSelectedItem(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, mt: 2 }}>
        Manage Seller Advertisements
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Pending Approval" value="pending" />
          <Tab label="Approved Ads" value="approved" />
          <Tab label="All" value="all" />
        </Tabs>
      </Paper>
      
      {loading && items.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      ) : items.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No {activeTab === 'pending' ? 'pending' : activeTab === 'approved' ? 'approved' : ''} seller advertisements found
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {items.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="160"
                  image={`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${item.productImage}`}
                  alt={item.itemName}
                  sx={{ objectFit: 'contain' }}
                />
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" noWrap sx={{ maxWidth: '70%' }}>
                      {item.itemName}
                    </Typography>
                    <Chip 
                      label={item.status}
                      size="small"
                      color={getStatusColor(item.status)}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Seller: {item.sellerName}
                  </Typography>
                  
                  <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                    ${item.price.toFixed(2)}
                  </Typography>
                  
                  <Chip 
                    label={item.category}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {item.description}
                  </Typography>
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<VisibilityIcon />} 
                    onClick={() => handleViewClick(item)}
                  >
                    View
                  </Button>
                  
                  {item.status === 'pending' && (
                    <>
                      <Button 
                        size="small" 
                        startIcon={<ApproveIcon />} 
                        color="success"
                        onClick={() => handleStatusChange(item._id, 'approved')}
                      >
                        Approve
                      </Button>
                      <Button 
                        size="small" 
                        startIcon={<RejectIcon />} 
                        color="error"
                        onClick={() => handleStatusChange(item._id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  
                  {item.status === 'approved' && (
                    <Button 
                      size="small" 
                      startIcon={<DeleteIcon />} 
                      color="error"
                      onClick={() => handleDeleteClick(item)}
                    >
                      Delete
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        {selectedItem && (
          <>
            <DialogTitle>{selectedItem.itemName}</DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <img 
                  src={`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${selectedItem.productImage}`}
                  alt={selectedItem.itemName}
                  style={{ width: '100%', borderRadius: '4px', maxHeight: '300px', objectFit: 'contain' }}
                />
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Seller:</Typography>
                  <Typography variant="body2">
                    {selectedItem.sellerName}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Status:</Typography>
                  <Chip 
                    label={selectedItem.status}
                    size="small"
                    color={getStatusColor(selectedItem.status)}
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Price:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    ${selectedItem.price.toFixed(2)}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Category:</Typography>
                  <Typography variant="body2">
                    {selectedItem.category}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Description:</Typography>
                  <Typography variant="body2">
                    {selectedItem.description}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Submitted On:</Typography>
                  <Typography variant="body2">
                    {formatDate(selectedItem.createdAt)}
                  </Typography>
                </Grid>
              </Grid>
              
              {selectedItem.status === 'pending' && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <Button 
                    variant="contained" 
                    color="success" 
                    startIcon={<ApproveIcon />}
                    onClick={() => handleStatusChange(selectedItem._id, 'approved')}
                    disabled={loading}
                  >
                    Approve Advertisement
                  </Button>
                  <Button 
                    variant="contained" 
                    color="error" 
                    startIcon={<RejectIcon />}
                    onClick={() => handleStatusChange(selectedItem._id, 'rejected')}
                    disabled={loading}
                  >
                    Reject
                  </Button>
                </Box>
              )}
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
            Are you sure you want to delete this seller advertisement? This action cannot be undone.
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

export default SellerAds;
