import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Divider,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  TextField,
  IconButton,
  Stack
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';

const InquiryDetail = () => {
  const navigate = useNavigate();
  const { inquiryId } = useParams();
  const { currentUser } = useAuth();
  
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyText, setReplyText] = useState('');
  
  useEffect(() => {
    // Fetch inquiry details
    const fetchInquiryDetails = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await API.get(`/inquiries/${inquiryId}`);
        setInquiry(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching inquiry details:', error);
        setError(error.response?.data?.message || 'Failed to load inquiry details');
        setLoading(false);
      }
    };
    
    if (inquiryId) {
      fetchInquiryDetails();
    }
  }, [inquiryId]);
  
  // Format date helper function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get status color for chip
  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending':
        return '#1976d2'; // Blue
      case 'In Progress':
        return '#ff9800'; // Orange
      case 'Resolved':
        return '#4caf50'; // Green
      case 'Rejected':
        return '#f44336'; // Red
      default:
        return '#9e9e9e'; // Grey
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
        {/* Header with back button */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton 
            onClick={() => navigate('/my-inquiries')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            <Typography component="span" variant="h4" sx={{ color: '#FF3900', fontWeight: 600 }}>
              Inquiry
            </Typography>
            <Typography component="span" variant="h4" sx={{ color: '#666', fontWeight: 600 }}>
              {" "}Details
            </Typography>
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 4 }} />
        
        {/* Loading state */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress sx={{ color: '#FF3900' }} />
          </Box>
        )}
        
        {/* Error message */}
        {error && !loading && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}
        
        {/* Inquiry details */}
        {!loading && !error && inquiry && (
          <>
            {/* Inquiry metadata */}
            <Box sx={{ mb: 4 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <Typography variant="h5" gutterBottom>
                    {inquiry.subject}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
                  <Chip 
                    label={inquiry.status} 
                    sx={{ 
                      backgroundColor: getStatusColor(inquiry.status),
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Inquiry ID:</strong> {inquiry._id}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Date:</strong> {formatDate(inquiry.createdAt)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    <strong>From:</strong> {inquiry.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Contact:</strong> {inquiry.email} | {inquiry.contactNumber}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            
            <Divider sx={{ mb: 4 }} />
            
            {/* Chat-like message display area */}
            <Box sx={{ mb: 4, height: '400px', overflow: 'auto', p: 2, bgcolor: '#f9f9f9', borderRadius: 2 }}>
              {/* User's original inquiry (left side) */}
              <Box sx={{ display: 'flex', mb: 3, justifyContent: 'flex-start' }}>
                <Box sx={{ 
                  maxWidth: '70%', 
                  bgcolor: '#e3f2fd', 
                  p: 2, 
                  borderRadius: 2,
                  boxShadow: 1
                }}>
                  <Typography variant="body1">
                    {inquiry.message}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1, textAlign: 'right' }}>
                    {formatDate(inquiry.createdAt)}
                  </Typography>
                </Box>
              </Box>
              
              {/* Display replies if any (right side) */}
              {inquiry.replies && inquiry.replies.length > 0 ? (
                inquiry.replies.map((reply, index) => (
                  <Box key={index} sx={{ display: 'flex', mb: 3, justifyContent: 'flex-end' }}>
                    <Box sx={{ 
                      maxWidth: '70%', 
                      bgcolor: '#fee8e3', 
                      p: 2, 
                      borderRadius: 2,
                      boxShadow: 1
                    }}>
                      <Typography variant="body1">
                        {reply.message}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                        {reply.respondedBy} - {formatDate(reply.timestamp)}
                      </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                inquiry.status === 'Pending' && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Your inquiry is pending. Our team will respond shortly.
                  </Alert>
                )
              )}
            </Box>
            
            {/* Reply input area (readonly for demonstration - would need backend implementation) */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {inquiry.status === 'Resolved' ? 
                  "This inquiry has been resolved. You can submit a new inquiry if you need further assistance." : 
                  "Only administrator responses will appear here. If you need additional assistance, please submit a new inquiry."}
              </Typography>
            </Box>
          </>
        )}
        
        {/* Bottom section with support info */}
        <Divider sx={{ mt: 2, mb: 3 }} />
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            onClick={() => navigate('/my-inquiries')}
            sx={{
              mb: 3,
              bgcolor: '#FF3900',
              color: 'white',
              '&:hover': {
                bgcolor: '#FF6600',
              },
            }}
          >
            Back to Inquiries
          </Button>
          <Typography variant="body2" color="textSecondary">
            Need more help? Contact our customer support team at support@razorkart.com
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default InquiryDetail;
