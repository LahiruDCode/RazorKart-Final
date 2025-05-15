import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Button,
  Typography,
  Container,
  styled,
  Paper
} from '@mui/material';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

const StyledAppBar = styled(AppBar)({
  backgroundColor: '#FF6600',
});

const StyledButton = styled(Button)({
  color: '#FFFFFF',
  margin: '0 10px',
  '&:hover': {
    backgroundColor: '#FF3900',
  },
});

const ContentManagerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to determine which component to directly render based on the path
  const renderDirectContent = () => {
    const path = location.pathname;
    
    // Render test content for debugging
    return (
      <Paper sx={{ p: 4, mt: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Content Manager - Direct Rendering
        </Typography>
        <Typography variant="body1">
          This is directly rendered in ContentManagerLayout for testing purposes.
          Current path: {path}
        </Typography>
        <Box sx={{ height: '200px', backgroundColor: '#f0f0f0', mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6">Testing Content Area</Typography>
        </Box>
      </Paper>
    );
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <StyledAppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Content Manager Dashboard
          </Typography>
          <StyledButton onClick={() => navigate('/content-manager/create-banner')}>
            CREATE BANNER
          </StyledButton>
          <StyledButton onClick={() => navigate('/content-manager/ongoing-ads')}>
            ONGOING ADS
          </StyledButton>
          <StyledButton onClick={() => navigate('/content-manager/seller-ads')}>
            SELLER ADS
          </StyledButton>
          <StyledButton onClick={() => navigate('/')}>
            HOME
          </StyledButton>
        </Toolbar>
      </StyledAppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* Direct test content for debugging */}
        {renderDirectContent()}
        
        {/* Regular content routing */}
        <Box sx={{ mt: 4 }}>
          <Outlet />
        </Box>
      </Container>
    </Box>
  );
};

export default ContentManagerLayout;
