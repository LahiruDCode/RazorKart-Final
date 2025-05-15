import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  Typography,
  IconButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  useTheme,
  ListItemButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  TrendingUp as TrendingUpIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { Link, useLocation, Outlet } from 'react-router-dom';

const drawerWidth = 240;

const SellerDashboard = () => {
  const [open, setOpen] = useState(true);
  const location = useLocation();
  const theme = useTheme();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/seller/dashboard' },
    { text: 'Products', icon: <InventoryIcon />, path: '/seller/products' },
    { text: 'Orders', icon: <ShoppingCartIcon />, path: '/seller/orders' },
    { text: 'Performance', icon: <TrendingUpIcon />, path: '/seller/performance' }
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => setOpen(!open)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2 }}>Seller Dashboard</Typography>
        </Box>
        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.text}
              component={Link}
              to={item.path}
              sx={{
                minHeight: 48,
                px: 2.5,
                bgcolor: location.pathname === item.path ? theme.palette.primary.light : 'transparent',
                color: location.pathname === item.path ? theme.palette.primary.main : 'inherit',
              }}
            >
              <ListItemIcon sx={{ 
                color: location.pathname === item.path ? theme.palette.primary.main : 'inherit',
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default SellerDashboard;