import React from 'react';
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
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const MyOrders = () => {
  const navigate = useNavigate();
  
  // This is just a placeholder UI without actual functionality
  // Actual data fetching would be implemented later
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 3 }}>
          <Typography component="span" variant="h4" sx={{ color: '#FF3900', fontWeight: 600 }}>
            My
          </Typography>
          <Typography component="span" variant="h4" sx={{ color: '#666', fontWeight: 600 }}>
            {" "}Orders
          </Typography>
        </Typography>
        
        <Divider sx={{ mb: 4 }} />
        
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="h2">
            Your Order History
          </Typography>
        </Box>
        
        <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #eee' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f7f7f7' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Sample order data - this would be dynamically generated from API */}
              <TableRow hover>
                <TableCell>ORD-20250510-001</TableCell>
                <TableCell>May 10, 2025</TableCell>
                <TableCell>
                  <Box sx={{ 
                    backgroundColor: '#4caf50', 
                    color: 'white', 
                    px: 1, 
                    py: 0.5, 
                    borderRadius: '4px',
                    display: 'inline-block'
                  }}>
                    Delivered
                  </Box>
                </TableCell>
                <TableCell>$255.75</TableCell>
                <TableCell>
                  <Button 
                    variant="outlined" 
                    size="small" 
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
              
              <TableRow hover>
                <TableCell>ORD-20250428-089</TableCell>
                <TableCell>April 28, 2025</TableCell>
                <TableCell>
                  <Box sx={{ 
                    backgroundColor: '#1976d2', 
                    color: 'white', 
                    px: 1, 
                    py: 0.5, 
                    borderRadius: '4px',
                    display: 'inline-block'
                  }}>
                    Processing
                  </Box>
                </TableCell>
                <TableCell>$104.99</TableCell>
                <TableCell>
                  <Button 
                    variant="outlined" 
                    size="small"
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
              
              <TableRow hover>
                <TableCell>ORD-20250405-243</TableCell>
                <TableCell>April 5, 2025</TableCell>
                <TableCell>
                  <Box sx={{ 
                    backgroundColor: '#ff9800', 
                    color: 'white', 
                    px: 1, 
                    py: 0.5, 
                    borderRadius: '4px',
                    display: 'inline-block'
                  }}>
                    Shipped
                  </Box>
                </TableCell>
                <TableCell>$85.50</TableCell>
                <TableCell>
                  <Button 
                    variant="outlined" 
                    size="small"
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
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={() => navigate('/products')}
            sx={{
              bgcolor: '#FF3900',
              color: 'white',
              '&:hover': {
                bgcolor: '#FF6600',
              },
            }}
          >
            Continue Shopping
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default MyOrders;
