import React, { useState } from 'react';
import { Box, styled } from '@mui/material';
import Sidebar from './Sidebar';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: theme.spacing(7),
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: drawerWidth,
    }),
    backgroundColor: theme.palette.background.default,
    minHeight: '100vh',
    width: '100%',
  }),
);

const DashboardLayout = ({ children }) => {
  const [open, setOpen] = useState(false);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ 
      display: 'flex',
      minHeight: '100vh',
      width: '100%',
      backgroundColor: 'background.default'
    }}>
      <Sidebar open={open} onDrawerToggle={handleDrawerToggle} />
      <Main open={open}>
        <Box sx={{ 
          py: 2,
          px: 3,
          minHeight: '100vh',
          backgroundColor: 'background.default'
        }}>
          {children}
        </Box>
      </Main>
    </Box>
  );
};

export default DashboardLayout; 