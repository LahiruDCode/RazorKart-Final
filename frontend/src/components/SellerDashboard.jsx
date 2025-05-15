import React from 'react';
import { Box, Container, Grid, Paper, Typography, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Rating, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import { BarChart } from '@mui/x-charts/BarChart';

const Sidebar = styled('div')(({ theme }) => ({
  width: 250,
  backgroundColor: '#f5f5f5',
  height: '100vh',
  padding: theme.spacing(2),
}));

const NavItem = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(1),
  marginBottom: theme.spacing(1),
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#e0e0e0',
  },
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  height: '100%',
}));

const chartData = [
  { label: 'Label 1', item1: 45, item2: 35, item3: 32 },
  { label: 'Label 2', item1: 27, item2: 30, item3: 33 },
  { label: 'Label 3', item1: 30, item2: 55, item3: 40 },
  { label: 'Label 4', item1: 27, item2: 35, item3: 40 },
];

const SellerDashboard = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <Sidebar>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>RazprKart</Typography>
          <NavItem>Overview</NavItem>
          <NavItem>Orders</NavItem>
          <NavItem>Listing</NavItem>
          <NavItem>Performance</NavItem>
          <NavItem>Payments</NavItem>
          <NavItem>Sales</NavItem>
          <NavItem>Contents</NavItem>
          <NavItem>Inquiry</NavItem>
          <NavItem sx={{ mt: 'auto' }}>Contact Us</NavItem>
        </Box>
      </Sidebar>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PersonOutlineIcon />
            <Typography>Sell-X Store</Typography>
            <Typography>12 Active Listing</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Paper sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400 }}>
              <IconButton>
                <SearchIcon />
              </IconButton>
              <input style={{ border: 'none', outline: 'none', width: '100%' }} />
            </Paper>
            <IconButton>
              <MenuIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={3}>
            <StatsCard>
              <ShoppingCartIcon />
              <Typography variant="h4">421</Typography>
              <Typography>Sales</Typography>
              <Typography variant="caption">10% more than usual</Typography>
            </StatsCard>
          </Grid>
          <Grid item xs={3}>
            <StatsCard>
              <PersonOutlineIcon />
              <Typography variant="h4">245,100</Typography>
              <Typography>Visitors</Typography>
              <Typography variant="caption">23% more than usual</Typography>
            </StatsCard>
          </Grid>
          <Grid item xs={3}>
            <StatsCard>
              <Typography variant="h6">Link Click</Typography>
              <Box sx={{ mt: 2, height: 4, bgcolor: '#e0e0e0', position: 'relative' }}>
                <Box sx={{ height: '100%', width: '60%', bgcolor: 'primary.main' }} />
              </Box>
              <Typography>CPR</Typography>
            </StatsCard>
          </Grid>
          <Grid item xs={3}>
            <StatsCard>
              <Typography variant="h6">Client Ratings</Typography>
              <Rating value={4} readOnly />
              <Typography>4/5 Stars</Typography>
              <Typography variant="caption">105 Reviews</Typography>
            </StatsCard>
          </Grid>
        </Grid>

        {/* Chart */}
        <Paper sx={{ p: 2, mb: 4 }}>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            {['Sales', 'Visitors', 'Clicks', 'CPR', 'Listing'].map((tab) => (
              <Typography key={tab} sx={{ cursor: 'pointer' }}>{tab}</Typography>
            ))}
          </Stack>
          <BarChart
            width={800}
            height={300}
            series={[
              { data: chartData.map(d => d.item1), label: 'Item 1' },
              { data: chartData.map(d => d.item2), label: 'Item 2' },
              { data: chartData.map(d => d.item3), label: 'Item 3' },
            ]}
            xAxis={[{ data: chartData.map(d => d.label), scaleType: 'band' }]}
          />
        </Paper>

        {/* Latest Items Table */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Latest Items</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">Active</TableCell>
                  <TableCell>Item</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Visitors</TableCell>
                  <TableCell>Orders</TableCell>
                  <TableCell>Earning</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell padding="checkbox">
                    <input type="checkbox" checked readOnly />
                  </TableCell>
                  <TableCell>SmartWatch</TableCell>
                  <TableCell>48</TableCell>
                  <TableCell>LKR 8500</TableCell>
                  <TableCell>7806</TableCell>
                  <TableCell>57</TableCell>
                  <TableCell>LKR 484500</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell padding="checkbox">
                    <input type="checkbox" checked readOnly />
                  </TableCell>
                  <TableCell>Humidifier</TableCell>
                  <TableCell>114</TableCell>
                  <TableCell>LKR 1280</TableCell>
                  <TableCell>12840</TableCell>
                  <TableCell>105</TableCell>
                  <TableCell>LKR 134400</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Box>
  );
};

export default SellerDashboard; 