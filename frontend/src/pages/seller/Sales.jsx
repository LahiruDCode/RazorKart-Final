import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Sales = () => {
  const [loading, setLoading] = useState(false);
  const [salesData, setSalesData] = useState([]);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('7days');
  const { currentUser } = useAuth();

  useEffect(() => {
    console.log('Sales component mounted');
    // In a real app, you would fetch the sales data here
    // For now, we'll just set some mock data
    setSalesData([
      { id: 1, date: '2025-05-01', product: 'Wireless Headphones', amount: 129.99, customer: 'John Doe' },
      { id: 2, date: '2025-05-02', product: 'Smart Watch', amount: 199.99, customer: 'Jane Smith' },
      { id: 3, date: '2025-05-03', product: 'Fitness Tracker', amount: 89.99, customer: 'Mike Johnson' },
      { id: 4, date: '2025-05-04', product: 'Bluetooth Speaker', amount: 149.99, customer: 'Sarah Williams' },
      { id: 5, date: '2025-05-05', product: 'Wireless Earbuds', amount: 79.99, customer: 'David Brown' },
    ]);
  }, []);

  const calculateTotalSales = () => {
    return salesData.reduce((total, sale) => total + sale.amount, 0).toFixed(2);
  };

  const handleTimeFilterChange = (event) => {
    setTimeFilter(event.target.value);
    // In a real app, you would fetch new data based on the filter
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom>Sales Overview</Typography>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="time-filter-label">Time Period</InputLabel>
          <Select
            labelId="time-filter-label"
            value={timeFilter}
            label="Time Period"
            onChange={handleTimeFilterChange}
          >
            <MenuItem value="7days">Last 7 Days</MenuItem>
            <MenuItem value="30days">Last 30 Days</MenuItem>
            <MenuItem value="90days">Last 90 Days</MenuItem>
            <MenuItem value="year">This Year</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MoneyIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6">Total Sales</Typography>
              </Box>
              <Typography variant="h3" color="primary.main">${calculateTotalSales()}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                For the selected time period
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="h6">Sales Growth</Typography>
              </Box>
              <Typography variant="h3" color="success.main">+12.5%</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Compared to previous period
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5" sx={{ mb: 2 }}>Recent Sales</Typography>
      <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'rgba(0, 0, 0, 0.03)' }}>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {salesData.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>{sale.date}</TableCell>
                <TableCell>{sale.product}</TableCell>
                <TableCell>{sale.customer}</TableCell>
                <TableCell align="right">${sale.amount.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default Sales; 