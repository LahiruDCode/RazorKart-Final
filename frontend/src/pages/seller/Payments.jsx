import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import { 
  AccountBalance as AccountIcon,
  Payment as PaymentIcon,
  AddCircleOutline as AddIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Payments = () => {
  const [loading, setLoading] = useState(false);
  const [paymentsData, setPaymentsData] = useState([]);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const { currentUser } = useAuth();

  useEffect(() => {
    console.log('Payments component mounted');
    // In a real app, you would fetch the payments data here
    // For now, we'll just set some mock data
    setPaymentsData([
      { id: 1, date: '2025-05-01', amount: 429.99, status: 'completed', method: 'Direct Deposit' },
      { id: 2, date: '2025-04-15', amount: 275.75, status: 'completed', method: 'Direct Deposit' },
      { id: 3, date: '2025-04-01', amount: 189.50, status: 'completed', method: 'PayPal' },
      { id: 4, date: '2025-05-15', amount: 350.00, status: 'pending', method: 'Direct Deposit' },
      { id: 5, date: '2025-05-30', amount: 400.00, status: 'scheduled', method: 'Direct Deposit' },
    ]);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // In a real app, you would filter payments based on tab
  };

  // Filter payments based on current tab
  const filteredPayments = () => {
    if (tabValue === 0) return paymentsData;
    if (tabValue === 1) return paymentsData.filter(p => p.status === 'completed');
    if (tabValue === 2) return paymentsData.filter(p => p.status === 'pending');
    if (tabValue === 3) return paymentsData.filter(p => p.status === 'scheduled');
    return paymentsData;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'scheduled': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Payment Management</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        View and manage your payments, payouts, and financial transactions.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6">Current Balance</Typography>
              </Box>
              <Typography variant="h3" color="primary.main">$1,245.24</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button variant="outlined" size="small" startIcon={<PaymentIcon />}>
                  Withdraw Funds
                </Button>
                <Button variant="text" size="small">
                  View History
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PaymentIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6">Payment Methods</Typography>
              </Box>
              <Typography variant="body1" sx={{ mb: 2 }}>Direct Deposit (Primary)</Typography>
              <Button variant="contained" startIcon={<AddIcon />} size="small">
                Add Payment Method
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="All Payments" />
          <Tab label="Completed" />
          <Tab label="Pending" />
          <Tab label="Scheduled" />
        </Tabs>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'rgba(0, 0, 0, 0.03)' }}>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPayments().map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.date}</TableCell>
                <TableCell>{payment.method}</TableCell>
                <TableCell>
                  <Chip 
                    label={payment.status.charAt(0).toUpperCase() + payment.status.slice(1)} 
                    color={getStatusColor(payment.status)} 
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">${payment.amount.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default Payments; 