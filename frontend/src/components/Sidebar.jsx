import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Typography, Divider, IconButton, Tooltip } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  ShoppingCart as OrdersIcon,
  List as ListingIcon,
  Timeline as PerformanceIcon,
  Payment as PaymentsIcon,
  TrendingUp as SalesIcon,
  Inventory as ContentsIcon,
  QuestionAnswer as InquiryIcon,
  Home as HomeIcon,
  ContactSupport as ContactIcon,
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
  Store as StoreIcon
} from '@mui/icons-material';

const menuItems = [
  { text: 'Dashboard', icon: DashboardIcon, path: '/seller/dashboard' },
  { text: 'Listing', icon: ListingIcon, path: '/seller/listing' },
  { text: 'Payments', icon: PaymentsIcon, path: '/seller/payments' },
  { text: 'Contents', icon: ContentsIcon, path: '/seller/contents' },
  { text: 'Inquiry', icon: InquiryIcon, path: '/seller/inquiry' },
  { text: 'Store Settings', icon: StoreIcon, path: '/seller/store-settings' },
];

const Sidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();

  return (
    <Box
      sx={{
        width: isCollapsed ? 80 : 240,
        height: '100%',
        bgcolor: '#FFFFFF',
        borderRight: '1px solid',
        borderColor: 'rgba(255, 153, 85, 0.2)',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isCollapsed ? 'center' : 'space-between',
        bgcolor: 'rgba(255, 153, 85, 0.1)',
      }}>
        {!isCollapsed && (
          <Typography variant="h6" sx={{ 
            fontWeight: 600,
            background: 'linear-gradient(45deg, #FF3900, #FF6600)',
            backgroundClip: 'text',
            color: 'transparent',
          }}>
            RazorKart
          </Typography>
        )}
        <IconButton 
          onClick={onToggle}
          sx={{
            color: '#FF6600',
            '&:hover': {
              bgcolor: 'rgba(255, 102, 0, 0.1)',
            }
          }}
        >
          {isCollapsed ? <MenuIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>
      
      <Divider sx={{ borderColor: 'rgba(255, 153, 85, 0.2)' }} />
      
      <List sx={{ flexGrow: 1, px: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <ListItem
              key={item.text}
              component={RouterLink}
              to={item.path}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                color: isActive ? '#FF3900' : '#666666',
                bgcolor: isActive ? 'rgba(255, 57, 0, 0.1)' : 'transparent',
                '&:hover': {
                  bgcolor: 'rgba(255, 147, 0, 0.1)',
                  color: '#FF6600',
                },
              }}
            >
              <Tooltip title={isCollapsed ? item.text : ''} placement="right">
                <ListItemIcon sx={{ 
                  minWidth: isCollapsed ? 'auto' : 48,
                  color: 'inherit',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                }}>
                  <Icon />
                </ListItemIcon>
              </Tooltip>
              {!isCollapsed && <ListItemText primary={item.text} />}
            </ListItem>
          );
        })}
      </List>
      
      <Divider sx={{ borderColor: 'rgba(255, 153, 85, 0.2)' }} />
      
      <List sx={{ px: 1 }}>
        <ListItem
          component={RouterLink}
          to="/"
          sx={{
            borderRadius: 1,
            mb: 0.5,
            color: '#666666',
            '&:hover': {
              bgcolor: 'rgba(255, 147, 0, 0.1)',
              color: '#FF6600',
            },
          }}
        >
          <Tooltip title={isCollapsed ? 'Home' : ''} placement="right">
            <ListItemIcon sx={{ 
              minWidth: isCollapsed ? 'auto' : 48,
              color: 'inherit',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
            }}>
              <HomeIcon />
            </ListItemIcon>
          </Tooltip>
          {!isCollapsed && <ListItemText primary="Home" />}
        </ListItem>
      </List>
    </Box>
  );
};

export default Sidebar; 