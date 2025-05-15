import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';

const MyInquiries = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Fetch user's inquiries
    const fetchUserInquiries = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You need to be logged in to view your inquiries');
          setLoading(false);
          return;
        }
        
        const response = await API.get('/inquiries/my-inquiries', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setInquiries(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching inquiries:', error);
        setError(error.response?.data?.message || 'Failed to load your inquiries');
        setLoading(false);
      }
    };
    
    fetchUserInquiries();
  }, []);  // Empty dependency array means this effect runs once when component mounts
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 3 }}>
          <Typography component="span" variant="h4" sx={{ color: '#FF3900', fontWeight: 600 }}>
            My
          </Typography>
          <Typography component="span" variant="h4" sx={{ color: '#666', fontWeight: 600 }}>
            {" "}Inquiries
          </Typography>
        </Typography>
        
        <Divider sx={{ mb: 4 }} />
        
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="h2">
            Your Inquiry History
          </Typography>
          
          <Button 
            variant="contained" 
            onClick={() => navigate('/submit-inquiry')}
            sx={{
              bgcolor: '#FF3900',
              color: 'white',
              '&:hover': {
                bgcolor: '#FF6600',
              },
            }}
          >
            Submit New Inquiry
          </Button>
        </Box>
        
        {/* Show loading state */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress sx={{ color: '#FF3900' }} />
          </Box>
        )}
        
        {/* Show error message if any */}
        {error && !loading && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}
        
        {/* Show no inquiries message if needed */}
        {!loading && !error && inquiries.length === 0 && (
          <Alert severity="info" sx={{ mb: 4 }}>
            You haven't submitted any inquiries yet. Use the "Submit New Inquiry" button to get started.
          </Alert>
        )}
        
        {/* Show inquiries table if data is available */}
        {!loading && !error && inquiries.length > 0 && (
          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #eee' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f7f7f7' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inquiries.map((inquiry) => {
                  // Format date
                  const formattedDate = new Date(inquiry.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  });
                  
                  // Determine status color
                  let statusColor;
                  switch(inquiry.status) {
                    case 'Pending':
                      statusColor = '#1976d2'; // Blue
                      break;
                    case 'In Progress':
                      statusColor = '#ff9800'; // Orange
                      break;
                    case 'Resolved':
                      statusColor = '#4caf50'; // Green
                      break;
                    case 'Rejected':
                      statusColor = '#f44336'; // Red
                      break;
                    default:
                      statusColor = '#9e9e9e'; // Grey
                  }
                  
                  return (
                    <TableRow key={inquiry._id} hover>
                      <TableCell>{inquiry.subject}</TableCell>
                      <TableCell>{formattedDate}</TableCell>
                      <TableCell>
                        <Chip 
                          label={inquiry.status} 
                          size="small"
                          sx={{ 
                            backgroundColor: statusColor,
                            color: 'white'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => navigate(`/inquiries/${inquiry._id}`)}
                          sx={{ 
                            color: '#FF3900', 
                            borderColor: '#FF3900',
                            '&:hover': {
                              borderColor: '#FF6600',
                              backgroundColor: 'rgba(255, 57, 0, 0.1)',
                            }
                          }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            Need more help? Contact our customer support team at support@razorkart.com
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default MyInquiries;
