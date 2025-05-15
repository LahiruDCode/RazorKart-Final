import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ShoppingBag as ShoppingBagIcon,
  People as PeopleIcon,
  Star as StarIcon,
  MoreVert as MoreIcon,
  FileDownload as ExportIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from 'recharts';

const Performance = () => {
  const [timeRange, setTimeRange] = useState('6months');
  const [performanceData, setPerformanceData] = useState({
    salesData: [],
    stats: {
      totalSales: 0,
      totalOrders: 0,
      totalCustomers: 0,
      avgRating: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/seller/performance?timeRange=${timeRange}`);
        setPerformanceData(response.data);
      } catch (error) {
        console.error('Error fetching performance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, [timeRange]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Box sx={{ flex: 1 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' }, 
        gap: 2,
        mb: 4 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" sx={{ 
            fontWeight: 600,
            background: 'linear-gradient(45deg, #1976d2, #64b5f6)',
            backgroundClip: 'text',
            color: 'transparent',
          }}>
            Performance Analytics
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Select
            size="small"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            sx={{
              minWidth: 120,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
              },
            }}
          >
            <MenuItem value="7days">Last 7 days</MenuItem>
            <MenuItem value="30days">Last 30 days</MenuItem>
            <MenuItem value="6months">Last 6 months</MenuItem>
            <MenuItem value="1year">Last year</MenuItem>
          </Select>

          <Button
            variant="contained"
            startIcon={<ExportIcon />}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { boxShadow: 'none' },
            }}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { 
            title: 'Total Sales', 
            value: `$${performanceData.stats.totalSales.toFixed(2)}`, 
            icon: <TrendingUpIcon />, 
            color: '#2196f3'
          },
          { 
            title: 'Total Orders', 
            value: performanceData.stats.totalOrders.toString(), 
            icon: <ShoppingBagIcon />, 
            color: '#ff9800'
          },
          { 
            title: 'Total Customers', 
            value: performanceData.stats.totalCustomers.toString(), 
            icon: <PeopleIcon />, 
            color: '#4caf50'
          },
          { 
            title: 'Avg Rating', 
            value: performanceData.stats.avgRating.toString(), 
            icon: <StarIcon />, 
            color: '#f44336'
          },
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              height: '100%',
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: `${stat.color}15`,
                    color: stat.color,
                  }}>
                    {stat.icon}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'success.main',
                      bgcolor: 'success.light',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontWeight: 500,
                    }}
                  >
                    {stat.increase}
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Sales Overview
              </Typography>
              <IconButton size="small">
                <MoreIcon />
              </IconButton>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData.salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  name="Sales ($)" 
                  stroke="#2196f3" 
                  strokeWidth={2} 
                />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  name="Orders" 
                  stroke="#ff9800" 
                  strokeWidth={2} 
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Customer Growth
              </Typography>
              <IconButton size="small">
                <MoreIcon />
              </IconButton>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData.salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="customers" name="Customers" fill="#4caf50" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Performance; 