import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  TextField, 
  Button, 
  Avatar, 
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  Edit as EditIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { currentUser, updateProfile, deleteAccount, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    contactNumber: ''
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ open: false, message: '', severity: 'success' });

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else {
      // Initialize form data when currentUser is available
      setFormData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        contactNumber: currentUser.contactNumber || ''
      });
    }
  }, [currentUser, navigate]);
  
  if (!currentUser) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({
      username: currentUser.username,
      email: currentUser.email,
      contactNumber: currentUser.contactNumber
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Set loading state while updating profile
      setIsLoading(true);
      
      // Call the updateProfile function from the AuthContext
      console.log('Submitting profile update with data:', formData);
      await updateProfile(formData);
      
      setIsEditing(false);
      setAlertInfo({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Profile update error:', error);
      setAlertInfo({
        open: true,
        message: error.response?.data?.message || error.message || 'Failed to update profile',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      // Set loading state while deleting account
      setIsLoading(true);
      
      console.log('Attempting to delete account for user ID:', currentUser._id);
      await deleteAccount();
      
      setDeleteDialogOpen(false);
      setAlertInfo({
        open: true,
        message: 'Account deleted successfully. Redirecting to home page...',
        severity: 'success'
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        logout(); // Force logout to clear any remaining session data
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Account deletion error:', error);
      setAlertInfo({
        open: true,
        message: error.response?.data?.message || error.message || 'Failed to delete account',
        severity: 'error'
      });
      setDeleteDialogOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setAlertInfo(prev => ({ ...prev, open: false }));
  };

  const getUserInitials = () => {
    if (!currentUser.username) return '?';
    
    const nameParts = currentUser.username.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Snackbar 
        open={alertInfo.open} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alertInfo.severity} 
          sx={{ width: '100%' }}
        >
          {alertInfo.message}
        </Alert>
      </Snackbar>

      <Typography variant="h4" component="h1" gutterBottom>
        My Profile
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mt: 3, borderRadius: 2 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: '#FF3900',
                fontSize: '2rem',
                mb: 2
              }}
            >
              {getUserInitials()}
            </Avatar>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              {currentUser.username}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              {currentUser.role}
            </Typography>
          </Grid>

          <Grid item xs={12} md={9}>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Contact Number"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  {isEditing ? (
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<CancelIcon />}
                        onClick={handleCancel}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        startIcon={isLoading ? null : <SaveIcon />}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={isLoading ? null : <DeleteIcon />}
                        onClick={handleDeleteClick}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Processing...' : 'Delete Account'}
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={isLoading ? null : <EditIcon />}
                        onClick={handleEdit}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Loading...' : 'Edit Profile'}
                      </Button>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => !isLoading && setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Account Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            color="primary"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            autoFocus
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete My Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;
