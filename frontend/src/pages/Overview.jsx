import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  IconButton,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  InputBase,
  Checkbox,
  Rating,
} from '@mui/material';
import {
  TrendingUp,
  ShoppingCart,
  Person,
  Search,
  Menu,
  BarChart as ChartIcon,
  FileDownload,
  KeyboardArrowDown,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Label 1', item1: 45, item2: 36, item3: 33 },
  { name: 'Label 2', item1: 27, item2: 30, item3: 33 },
  { name: 'Label 3', item1: 30, item2: 55, item3: 40 },
  { name: 'Label 4', item1: 27, item2: 35, item3: 40 },
];

const latestItems = [
  { id: 1, active: true, item: 'SmartWatch', quantity: 48, price: 'LKR 8500', visitors: 7806, orders: 57, earning: 'LKR 484500' },
  { id: 2, active: true, item: 'Humidifier', quantity: 114, price: 'LKR 1280', visitors: 12840, orders: 105, earning: 'LKR 134400' },
];

const StoreHeader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
        <Person />
      </Avatar>
      <Box>
        <Typography variant="h5">Sell-X Store</Typography>
        <Typography variant="subtitle2" color="text.secondary">12 Active Listing</Typography>
      </Box>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Paper
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          width: 250,
          borderRadius: 2,
        }}
      >
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Search..."
        />
        <IconButton sx={{ p: '10px' }}>
          <Search />
        </IconButton>
      </Paper>
      <IconButton>
        <Menu />
      </IconButton>
    </Box>
  </Box>
);

const StatCard = ({ title, value, subtitle, icon }) => (
  <Paper
    sx={{
      p: 3,
      borderRadius: 3,
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4,
      },
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
      {icon}
      <Typography variant="h4">{value}</Typography>
    </Box>
    <Typography variant="h6" gutterBottom>{title}</Typography>
    <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
  </Paper>
);

const Overview = () => {
  return (
    <Box sx={{ p: 3 }}>
      <StoreHeader />

      <Grid container spacing={3}>
        {/* Stat Cards */}
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Sales"
            value="421"
            subtitle="10% more than usual"
            icon={<ShoppingCart sx={{ color: 'primary.main', fontSize: 32 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Visitors"
            value="245,100"
            subtitle="23% more than usual"
            icon={<Person sx={{ color: 'success.main', fontSize: 32 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              },
            }}
          >
            <Typography variant="h6" gutterBottom>Link Click</Typography>
            <Box sx={{ mt: 2, mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Clicks</Typography>
              <Box sx={{ width: '100%', height: 4, bgcolor: '#eee', borderRadius: 2, mt: 1 }}>
                <Box sx={{ width: '60%', height: '100%', bgcolor: 'primary.main', borderRadius: 2 }} />
              </Box>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">CPR</Typography>
              <Box sx={{ width: '100%', height: 4, bgcolor: '#eee', borderRadius: 2, mt: 1 }}>
                <Box sx={{ width: '75%', height: '100%', bgcolor: 'success.main', borderRadius: 2 }} />
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              },
            }}
          >
            <Typography variant="h6" gutterBottom>Client Ratings</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Rating value={4} readOnly />
              <Typography variant="body2" sx={{ ml: 1 }}>4/5 Stars</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">105 Reviews</Typography>
          </Paper>
        </Grid>

        {/* Chart Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              {['Sales', 'Visitors', 'Clicks', 'CPR', 'Listing'].map((item) => (
                <Button
                  key={item}
                  variant="text"
                  sx={{
                    color: 'text.primary',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  {item}
                </Button>
              ))}
            </Box>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="item1" fill="#2196f3" />
                  <Bar dataKey="item2" fill="#4caf50" />
                  <Bar dataKey="item3" fill="#ff9800" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="outlined">-</Button>
                <Button size="small" variant="outlined">5</Button>
                <Button size="small" variant="outlined">+</Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  startIcon={<ChartIcon />}
                  variant="outlined"
                  size="small"
                >
                  Charts
                </Button>
                <Button
                  startIcon={<FileDownload />}
                  variant="outlined"
                  size="small"
                >
                  Export
                </Button>
                <Button
                  endIcon={<KeyboardArrowDown />}
                  variant="outlined"
                  size="small"
                >
                  Quantity
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Latest Items Table */}
        <Grid item xs={12}>
          <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Typography variant="h6" sx={{ p: 3, pb: 2 }}>Latest Items</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Typography variant="subtitle2">Active</Typography>
                    </TableCell>
                    <TableCell><Typography variant="subtitle2">Item</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2">Quantity</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2">Price</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2">Visitors</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2">Orders</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2">Earning</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {latestItems.map((item) => (
                    <TableRow
                      key={item.id}
                      hover
                      sx={{
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox checked={item.active} />
                      </TableCell>
                      <TableCell>{item.item}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.price}</TableCell>
                      <TableCell>{item.visitors}</TableCell>
                      <TableCell>{item.orders}</TableCell>
                      <TableCell>{item.earning}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Overview; 