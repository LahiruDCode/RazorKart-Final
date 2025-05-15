import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Button,
  Select,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  FileDownload as ExportIcon,
} from '@mui/icons-material';

// Sample data - in a real app, this would come from an API
const orders = [
  {
    id: 'ORD001',
    customer: 'John Doe',
    items: 3,
    total: 149.99,
    status: 'Processing',
    date: '2025-03-23',
  },
  {
    id: 'ORD002',
    customer: 'Jane Smith',
    items: 1,
    total: 49.99,
    status: 'Shipped',
    date: '2025-03-22',
  },
  {
    id: 'ORD003',
    customer: 'Bob Johnson',
    items: 2,
    total: 99.99,
    status: 'Delivered',
    date: '2025-03-21',
  },
  {
    id: 'ORD004',
    customer: 'Alice Brown',
    items: 4,
    total: 199.99,
    status: 'Processing',
    date: '2025-03-23',
  },
];

const Orders = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleMenuOpen = (event, order) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing':
        return { color: 'warning', bg: '#fff4e5' };
      case 'Shipped':
        return { color: 'info', bg: '#e3f2fd' };
      case 'Delivered':
        return { color: 'success', bg: '#edf7ed' };
      default:
        return { color: 'default', bg: '#f5f5f5' };
    }
  };

  const filteredOrders = orders.filter(order => 
    statusFilter === 'all' ? true : order.status.toLowerCase() === statusFilter.toLowerCase()
  );

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
            Orders
          </Typography>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              color: 'text.secondary',
              bgcolor: 'action.hover',
              px: 2,
              py: 0.5,
              borderRadius: 20,
              fontWeight: 500,
            }}
          >
            {filteredOrders.length} Orders
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search orders..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
                '&.Mui-focused': {
                  boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                },
              },
            }}
          />

          <Select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{
              minWidth: 120,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
              },
            }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="processing">Processing</MenuItem>
            <MenuItem value="shipped">Shipped</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
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
            Export
          </Button>
        </Box>
      </Box>

      {/* Orders Table */}
      <TableContainer component={Paper} sx={{ 
        borderRadius: 3,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell align="center">Items</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id} hover>
                <TableCell
                  sx={{
                    color: 'primary.main',
                    fontWeight: 500,
                  }}
                >
                  {order.id}
                </TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell align="center">{order.items}</TableCell>
                <TableCell align="right">${order.total.toFixed(2)}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={order.status}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(order.status).bg,
                      color: `${getStatusColor(order.status).color}.main`,
                      fontWeight: 500,
                    }}
                  />
                </TableCell>
                <TableCell align="right">{order.date}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, order)}
                  >
                    <MoreIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleMenuClose}>View Details</MenuItem>
        <MenuItem onClick={handleMenuClose}>Update Status</MenuItem>
        <MenuItem onClick={handleMenuClose}>Contact Customer</MenuItem>
      </Menu>
    </Box>
  );
};

export default Orders; 