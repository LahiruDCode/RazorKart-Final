import React, { useState } from 'react';
import { Box } from '@mui/material';
import Sidebar from '../components/Sidebar';

const SellerLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const styles = {
    menuItem: {
      marginTop: 1,
      '&:first-of-type': {
        marginTop: 0
      }
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      bgcolor: '#FFF9F5',
      overflow: 'auto',
      background: 'linear-gradient(135deg, #FFF9F5 0%, #FFF5F0 100%)',
    }}>
      <Box sx={{ 
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        zIndex: 1200,
        boxShadow: '4px 0 24px rgba(255, 102, 0, 0.1)',
      }}>
        <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          pl: { 
            xs: isCollapsed ? '80px' : '65px', 
            sm: isCollapsed ? '80px' : '240px' 
          },
          pt: 3,
          pb: 3,
          pr: 3,
          transition: 'all 0.3s ease-in-out',
          overflow: 'visible',
          '& > *': {
            opacity: 1,
            transition: 'opacity 0.3s ease-in-out',
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default SellerLayout;